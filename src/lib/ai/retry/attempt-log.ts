/**
 * Per-attempt retry logs — Module / Attempt / Duration / Tokens / Cost / Passed / Error
 * Collected in-memory + console + optional Supabase (admin-ready).
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { getSupabaseAdmin } from "@/lib/supabase";

/** One row per generate → validate attempt */
export type RetryAttemptLog = {
  module: string;
  attempt: number;
  /** Wall-clock ms for this attempt (generate + validate) */
  duration: number;
  tokens: number;
  /** Estimated USD for OpenAI calls inside this attempt */
  cost: number;
  passed: boolean;
  error: string | null;
};

type AttemptUsageBucket = {
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  parent?: AttemptUsageBucket;
};

const attemptUsage = new AsyncLocalStorage<AttemptUsageBucket>();

/** Accumulate OpenAI tokens/cost while a retry attempt / pipeline step is running */
export function recordAttemptUsage(
  tokens: number,
  costUsd: number,
  breakdown?: { promptTokens?: number; completionTokens?: number },
): void {
  let bucket = attemptUsage.getStore();
  while (bucket) {
    if (Number.isFinite(tokens) && tokens > 0) bucket.tokens += tokens;
    if (Number.isFinite(costUsd) && costUsd > 0) bucket.cost += costUsd;
    const prompt = breakdown?.promptTokens ?? 0;
    const completion = breakdown?.completionTokens ?? 0;
    if (Number.isFinite(prompt) && prompt > 0) bucket.promptTokens += prompt;
    if (Number.isFinite(completion) && completion > 0) {
      bucket.completionTokens += completion;
    }
    bucket = bucket.parent;
  }
}

export async function runWithAttemptUsage<T>(
  fn: () => Promise<T>,
): Promise<{
  value: T;
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
}> {
  const parent = attemptUsage.getStore();
  const bucket: AttemptUsageBucket = {
    tokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    cost: 0,
    parent,
  };
  const value = await attemptUsage.run(bucket, fn);
  return {
    value,
    tokens: bucket.tokens,
    promptTokens: bucket.promptTokens,
    completionTokens: bucket.completionTokens,
    cost: Math.round(bucket.cost * 1_000_000) / 1_000_000,
  };
}

export function logRetryAttempt(entry: RetryAttemptLog): void {
  // Structured console line — easy to grep / ship to log drains
  console.info(
    "[retry-attempt]",
    JSON.stringify({
      Module: entry.module,
      Attempt: entry.attempt,
      Duration: entry.duration,
      Tokens: entry.tokens,
      Cost: entry.cost,
      Passed: entry.passed,
      Error: entry.error,
    }),
  );
}

/**
 * Persist one attempt for admin UI.
 * Uses dedicated table when present; falls back to api_usage.meta.
 */
export async function persistRetryAttemptLog(
  entry: RetryAttemptLog,
  opts?: { userEmail?: string | null; runId?: string | null },
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const row = {
    module: entry.module,
    attempt: entry.attempt,
    duration_ms: entry.duration,
    tokens: entry.tokens,
    cost_usd: entry.cost,
    passed: entry.passed,
    error: entry.error,
    run_id: opts?.runId ?? null,
    user_email: opts?.userEmail?.toLowerCase() || null,
  };

  const primary = await supabase.from("retry_attempt_logs").insert(row);
  if (!primary.error) return;

  // Table may not exist yet — keep a copy on api_usage for admin later
  const { error } = await supabase.from("api_usage").insert({
    route: "ai/retry/attempt",
    method: "POST",
    user_email: row.user_email,
    status: entry.passed ? 200 : 422,
    meta: {
      Module: entry.module,
      Attempt: entry.attempt,
      Duration: entry.duration,
      Tokens: entry.tokens,
      Cost: entry.cost,
      Passed: entry.passed,
      Error: entry.error,
      runId: opts?.runId ?? null,
    },
  });

  if (error) {
    console.error("persistRetryAttemptLog:", primary.error.message, error.message);
  }
}
