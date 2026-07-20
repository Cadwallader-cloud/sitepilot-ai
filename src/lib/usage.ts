import { getSupabaseAdmin } from "@/lib/supabase";
import { recordAttemptUsage } from "@/lib/ai/retry/attempt-log";

/** Approximate list prices (USD per 1M tokens) — update when OpenAI changes rates. */
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "gpt-5-nano": { input: 0.05, output: 0.4 },
  "gpt-5-mini": { input: 0.25, output: 2 },
  "gpt-5": { input: 1.25, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2, output: 8 },
};

export function estimateOpenAiCostUsd(params: {
  model: string;
  promptTokens: number;
  completionTokens: number;
}): number {
  const rates = MODEL_RATES[params.model] ?? MODEL_RATES["gpt-4o-mini"];
  const input = (params.promptTokens / 1_000_000) * rates.input;
  const output = (params.completionTokens / 1_000_000) * rates.output;
  return Math.round((input + output) * 1_000_000) / 1_000_000;
}

export async function logApiUsage(params: {
  route: string;
  method?: string;
  userEmail?: string | null;
  status?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("api_usage").insert({
    route: params.route,
    method: params.method ?? "POST",
    user_email: params.userEmail?.toLowerCase() || null,
    status: params.status ?? null,
    meta: params.meta ?? null,
  });

  if (error) {
    console.error("logApiUsage:", error.message);
  }
}

export async function logOpenAiUsage(params: {
  userEmail?: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens?: number;
}): Promise<void> {
  const promptTokens = params.promptTokens || 0;
  const completionTokens = params.completionTokens || 0;
  const totalTokens =
    params.totalTokens || promptTokens + completionTokens;
  const estimated = estimateOpenAiCostUsd({
    model: params.model,
    promptTokens,
    completionTokens,
  });

  // Always feed active retry attempt (even if Supabase is offline)
  recordAttemptUsage(totalTokens, estimated);

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("openai_usage").insert({
    user_email: params.userEmail?.toLowerCase() || null,
    model: params.model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    estimated_cost_usd: estimated,
  });

  if (error) {
    console.error("logOpenAiUsage:", error.message);
  }
}
