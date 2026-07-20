/**
 * Crestis pipeline lifecycle events
 *
 *   pipeline:start
 *   step:start
 *   step:success
 *   step:retry
 *   step:error
 *   pipeline:complete
 */

import { AsyncLocalStorage } from "node:async_hooks";

export type PipelineEventType =
  | "pipeline:start"
  | "step:start"
  | "step:success"
  | "step:retry"
  | "step:error"
  | "pipeline:complete";

export type PipelineEvent = {
  type: PipelineEventType;
  at: string;
  runId?: string;
  step?: string;
  /** 1-based next attempt number for step:retry */
  attempt?: number;
  duration?: number;
  tokens?: number;
  cost?: number;
  reason?: string;
};

export type PipelineEventHandler = (event: PipelineEvent) => void;

const eventSink = new AsyncLocalStorage<PipelineEventHandler>();
let globalHandler: PipelineEventHandler | null = null;

/** Optional process-wide listener (tests / admin) */
export function setPipelineEventHandler(
  handler: PipelineEventHandler | null,
): void {
  globalHandler = handler;
}

/** Bind an event sink for the duration of a pipeline run (captures step:retry from nested retries) */
export function runWithPipelineEventSink<T>(
  handler: PipelineEventHandler,
  fn: () => Promise<T>,
): Promise<T> {
  return eventSink.run(handler, fn);
}

export function emitPipelineEvent(
  type: PipelineEventType,
  payload: Omit<PipelineEvent, "type" | "at"> = {},
  onEvent?: PipelineEventHandler | null,
): PipelineEvent {
  const event: PipelineEvent = {
    type,
    at: new Date().toISOString(),
    ...payload,
  };
  console.info("[pipeline-event]", JSON.stringify(event));
  eventSink.getStore()?.(event);
  onEvent?.(event);
  globalHandler?.(event);
  return event;
}
