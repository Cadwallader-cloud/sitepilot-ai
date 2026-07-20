/**
 * Hard pipeline failure after a step exhausts retries.
 *
 *   Hero → Retry → PASS → Continue
 *   Hero → Retry → FAIL → PipelineError (stop)
 */

import type { RetryAttemptLog } from "../retry/attempt-log";
import {
  SectionRetryError,
  type RetryFailure,
} from "../retry/retry";

export class PipelineError extends Error {
  readonly step: string;
  readonly failure: RetryFailure;
  readonly logs: RetryAttemptLog[];

  constructor(
    step: string,
    failure: RetryFailure,
    logs: RetryAttemptLog[] = [],
  ) {
    super(
      `PIPELINE:${step} failed after ${failure.attempts} attempts — ${failure.reason}`,
    );
    this.name = "PipelineError";
    this.step = step;
    this.failure = failure;
    this.logs = logs;
  }

  static fromUnknown(step: string, err: unknown): PipelineError {
    if (err instanceof PipelineError) return err;
    if (err instanceof SectionRetryError) {
      return new PipelineError(step, err.failure, err.logs);
    }
    const reason =
      err instanceof Error ? err.message : String(err ?? "Unknown error");
    return new PipelineError(
      step,
      { module: step, attempts: 0, reason },
      [],
    );
  }
}
