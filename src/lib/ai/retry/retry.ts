/**
 * Crestis section retry core
 *
 *   await retry(generateHero, validateHero, { module: "Hero" });
 *
 * After every attempt logs:
 *   Module · Attempt · Duration · Tokens · Cost · Passed · Error
 */

import {
  logRetryAttempt,
  persistRetryAttemptLog,
  runWithAttemptUsage,
  type RetryAttemptLog,
} from "./attempt-log";
import { emitPipelineEvent } from "../orchestrator/events";
import { incrementStageRetries } from "../telemetry/stage-telemetry";

export type RetryIssue = {
  path: string;
  message: string;
};

/** Structured failure for logs / observability */
export type RetryFailure = {
  module: string;
  attempts: number;
  reason: string;
};

export type RetryResult<T> = {
  success: boolean;
  data?: T;
  error?: RetryFailure;
  attempts: number;
  /** Per-attempt logs (admin-ready) */
  logs: RetryAttemptLog[];
};

export type RetryValidateResult<T> =
  | { ok: true; data: T; issues: [] }
  | { ok: false; data: null; issues: RetryIssue[] };

export type RetryOptions = {
  module?: string;
  maxAttempts?: number;
  userEmail?: string | null;
  runId?: string | null;
};

/** Try #1 → #2 → #3, then return structured error */
export const DEFAULT_SECTION_MAX_ATTEMPTS = 3;

function isOkResult<T>(
  check: unknown,
): check is { ok: true; data?: T | null } {
  return Boolean(
    check &&
      typeof check === "object" &&
      "ok" in check &&
      (check as { ok: unknown }).ok === true,
  );
}

function readIssues(check: unknown): RetryIssue[] {
  if (
    check &&
    typeof check === "object" &&
    "ok" in check &&
    (check as { ok: unknown }).ok === false &&
    "issues" in check &&
    Array.isArray((check as { issues: unknown }).issues)
  ) {
    return (check as { issues: RetryIssue[] }).issues.filter(
      (i) => i && typeof i.message === "string",
    );
  }
  return [];
}

/** Turn Zod path + message into a short log-friendly reason */
export function formatRetryReason(issues: RetryIssue[]): string {
  if (!issues.length) return "Validation failed";

  const first = issues[0]!;
  const leaf =
    first.path && first.path !== "$"
      ? first.path.split(".").filter(Boolean).pop() || first.path
      : "";
  const label = leaf
    ? leaf.charAt(0).toUpperCase() + leaf.slice(1)
    : "";
  const msg = first.message;

  if (label) {
    if (/too small|minimum|min\b/i.test(msg)) return `${label} too short`;
    if (/too big|maximum|max\b/i.test(msg)) return `${label} too long`;
    if (/required|undefined|invalid_type|expected .+ received/i.test(msg)) {
      return `${label} missing`;
    }
    if (/invalid|failed/i.test(msg)) return `${label} invalid`;
    return `${label}: ${msg}`;
  }

  return msg || "Validation failed";
}

function resolveOptions(
  maxAttemptsOrOpts?: number | RetryOptions,
): {
  module: string;
  maxAttempts: number;
  userEmail?: string | null;
  runId?: string | null;
} {
  if (typeof maxAttemptsOrOpts === "number") {
    return {
      module: "Unknown",
      maxAttempts: Math.max(1, maxAttemptsOrOpts),
    };
  }
  return {
    module: maxAttemptsOrOpts?.module?.trim() || "Unknown",
    maxAttempts: Math.max(
      1,
      maxAttemptsOrOpts?.maxAttempts ?? DEFAULT_SECTION_MAX_ATTEMPTS,
    ),
    userEmail: maxAttemptsOrOpts?.userEmail,
    runId: maxAttemptsOrOpts?.runId,
  };
}

/**
 * Canonical retry:
 *   await retry(generateHero, validateHero, { module: "Hero" });
 */
export async function retry<T>(
  generator: () => Promise<unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts validateHero + boolean validators
  validator: (
    data: any,
  ) => boolean | { ok: boolean; data?: T | null; issues?: RetryIssue[] },
  maxAttemptsOrOpts: number | RetryOptions = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<T>> {
  const { module, maxAttempts, userEmail, runId } =
    resolveOptions(maxAttemptsOrOpts);
  const logs: RetryAttemptLog[] = [];
  let lastIssues: RetryIssue[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const started = Date.now();
    const {
      value: generated,
      tokens,
      cost,
    } = await runWithAttemptUsage(() => generator());

    const check = validator(generated);
    let passed = false;
    let data: T | undefined;

    if (check === true) {
      passed = true;
      data = generated as T;
    } else if (isOkResult<T>(check)) {
      passed = true;
      data = (check.data ?? generated) as T;
    } else {
      lastIssues = readIssues(check);
    }

    const error = passed ? null : formatRetryReason(lastIssues);
    const entry: RetryAttemptLog = {
      module,
      attempt,
      duration: Date.now() - started,
      tokens,
      cost,
      passed,
      error,
    };
    logs.push(entry);
    logRetryAttempt(entry);
    void persistRetryAttemptLog(entry, { userEmail, runId });

    if (passed && data !== undefined) {
      return {
        success: true,
        data,
        attempts: attempt,
        logs,
      };
    }

    // Failed attempt with retries left → step:retry then continue
    if (attempt < maxAttempts) {
      incrementStageRetries(module.toLowerCase());
      emitPipelineEvent("step:retry", {
        runId: runId ?? undefined,
        step: module.toLowerCase(),
        attempt: attempt + 1,
        duration: entry.duration,
        tokens,
        cost,
        reason: error ?? undefined,
      });
    }
  }

  const failure: RetryFailure = {
    module,
    attempts: maxAttempts,
    reason: formatRetryReason(lastIssues),
  };

  return {
    success: false,
    attempts: maxAttempts,
    error: failure,
    logs,
  };
}

/** @deprecated Prefer RetryResult.error — kept for callers that still throw */
export class SectionRetryError extends Error {
  readonly section: string;
  readonly issues: RetryIssue[];
  readonly attempts: number;
  readonly failure: RetryFailure;
  readonly logs: RetryAttemptLog[];

  constructor(
    failure: RetryFailure,
    issues: RetryIssue[] = [],
    logs: RetryAttemptLog[] = [],
  ) {
    super(JSON.stringify(failure));
    this.name = "SectionRetryError";
    this.section = failure.module;
    this.issues = issues;
    this.attempts = failure.attempts;
    this.failure = failure;
    this.logs = logs;
  }
}

/** Throw structured failure — for pipelines that want hard stop */
export function unwrapRetryResult<T>(result: RetryResult<T>): T {
  if (result.success && result.data !== undefined) {
    return result.data;
  }
  const failure =
    result.error ??
    ({
      module: "Unknown",
      attempts: result.attempts,
      reason: "Validation failed",
    } satisfies RetryFailure);
  throw new SectionRetryError(failure, [], result.logs);
}

/**
 * Soft resolve — pipeline must not crash on one failed module.
 * Uses validated data on PASS; otherwise keeps fallback and logs the error.
 */
export function softRetryResult<T>(
  result: RetryResult<T>,
  fallback: T,
): { data: T; failed: boolean; error?: RetryFailure; logs: RetryAttemptLog[] } {
  if (result.success && result.data !== undefined) {
    return { data: result.data, failed: false, logs: result.logs };
  }
  if (result.error) {
    console.warn("[retry-soft-fail]", JSON.stringify(result.error));
  }
  return {
    data: fallback,
    failed: true,
    error: result.error,
    logs: result.logs,
  };
}

export type { RetryAttemptLog } from "./attempt-log";
