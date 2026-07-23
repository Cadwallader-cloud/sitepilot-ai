/**
 * Stage telemetry — per-step timing, tokens, cost, retries, cache hits.
 *
 * Emitted as structured `[stage-telemetry]` console lines and collected on
 * the pipeline bag for benchmark + product operations.
 */

import { AsyncLocalStorage } from "node:async_hooks";

export type StageTelemetryRecord = {
  stage: string;
  started: string;
  finished: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  retries: number;
  cacheHit: boolean;
  /** Orchestrator step when this row is an AI sub-stage */
  parentStep?: string;
  status: "success" | "error";
};

export type StageTelemetryInput = {
  stage: string;
  started: string;
  finished: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  retries?: number;
  cacheHit?: boolean;
  parentStep?: string;
  status?: "success" | "error";
};

const collectorStore = new AsyncLocalStorage<StageTelemetryCollector>();
const pipelineStepStore = new AsyncLocalStorage<string>();
const retryStore = new AsyncLocalStorage<Map<string, number>>();

export class StageTelemetryCollector {
  readonly records: StageTelemetryRecord[] = [];

  append(input: StageTelemetryInput): StageTelemetryRecord {
    const record: StageTelemetryRecord = {
      stage: input.stage,
      started: input.started,
      finished: input.finished,
      durationMs: Math.max(0, input.durationMs),
      inputTokens: Math.max(0, input.inputTokens ?? 0),
      outputTokens: Math.max(0, input.outputTokens ?? 0),
      costUsd: Math.max(0, input.costUsd ?? 0),
      retries: Math.max(0, input.retries ?? 0),
      cacheHit: input.cacheHit === true,
      parentStep: input.parentStep,
      status: input.status ?? "success",
    };
    this.records.push(record);
    logStageTelemetry(record);
    return record;
  }
}

export function logStageTelemetry(record: StageTelemetryRecord): void {
  console.info(
    "[stage-telemetry]",
    JSON.stringify({
      Stage: record.stage,
      Started: record.started,
      Finished: record.finished,
      Duration: record.durationMs,
      InputTokens: record.inputTokens,
      OutputTokens: record.outputTokens,
      Cost: record.costUsd,
      Retries: record.retries,
      CacheHit: record.cacheHit,
      ...(record.parentStep ? { ParentStep: record.parentStep } : {}),
      Status: record.status,
    }),
  );
}

export function getStageTelemetryCollector(): StageTelemetryCollector | undefined {
  return collectorStore.getStore();
}

export function runWithStageTelemetryCollector<T>(
  collector: StageTelemetryCollector,
  fn: () => Promise<T>,
): Promise<T> {
  return collectorStore.run(collector, fn);
}

export function runWithPipelineStepScope<T>(
  stepId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return pipelineStepStore.run(stepId, fn);
}

export function currentPipelineStep(): string | undefined {
  return pipelineStepStore.getStore();
}

export function runWithStageRetryScope<T>(
  stepId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const parent = retryStore.getStore();
  const map = new Map(parent ?? []);
  return retryStore.run(map, () => pipelineStepStore.run(stepId, fn));
}

export function incrementStageRetries(stage?: string): void {
  const map = retryStore.getStore();
  if (!map) return;
  const key = stage ?? currentPipelineStep() ?? "unknown";
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function stageRetryCount(stepId: string): number {
  return retryStore.getStore()?.get(stepId) ?? 0;
}

export function recordStageTelemetry(
  input: StageTelemetryInput,
): StageTelemetryRecord | null {
  const collector = getStageTelemetryCollector();
  if (!collector) {
    const record: StageTelemetryRecord = {
      stage: input.stage,
      started: input.started,
      finished: input.finished,
      durationMs: Math.max(0, input.durationMs),
      inputTokens: Math.max(0, input.inputTokens ?? 0),
      outputTokens: Math.max(0, input.outputTokens ?? 0),
      costUsd: Math.max(0, input.costUsd ?? 0),
      retries: Math.max(0, input.retries ?? 0),
      cacheHit: input.cacheHit === true,
      parentStep: input.parentStep,
      status: input.status ?? "success",
    };
    logStageTelemetry(record);
    return record;
  }
  return collector.append(input);
}

/** Cache-only row (no tokens) — prompt/context memo hits */
export function recordCacheTelemetry(params: {
  stage: string;
  cacheHit: boolean;
  parentStep?: string;
}): void {
  const now = new Date().toISOString();
  recordStageTelemetry({
    stage: params.stage,
    started: now,
    finished: now,
    durationMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    retries: 0,
    cacheHit: params.cacheHit,
    parentStep: params.parentStep ?? currentPipelineStep(),
    status: "success",
  });
}
