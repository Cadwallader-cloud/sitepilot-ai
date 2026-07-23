import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  incrementStageRetries,
  logStageTelemetry,
  recordStageTelemetry,
  runWithStageRetryScope,
  runWithStageTelemetryCollector,
  StageTelemetryCollector,
  stageRetryCount,
} from "./stage-telemetry";

describe("StageTelemetry", () => {
  it("logStageTelemetry emits required benchmark fields", () => {
    let line = "";
    const orig = console.info;
    console.info = (tag: unknown, payload: unknown) => {
      if (tag === "[stage-telemetry]") line = String(payload);
    };
    try {
      logStageTelemetry({
        stage: "hero",
        started: "2026-01-01T00:00:00.000Z",
        finished: "2026-01-01T00:00:01.000Z",
        durationMs: 1000,
        inputTokens: 900,
        outputTokens: 400,
        costUsd: 0.002,
        retries: 2,
        cacheHit: false,
        status: "success",
      });
    } finally {
      console.info = orig;
    }
    const row = JSON.parse(line) as Record<string, unknown>;
    assert.equal(row.Stage, "hero");
    assert.equal(row.Started, "2026-01-01T00:00:00.000Z");
    assert.equal(row.Finished, "2026-01-01T00:00:01.000Z");
    assert.equal(row.Duration, 1000);
    assert.equal(row.InputTokens, 900);
    assert.equal(row.OutputTokens, 400);
    assert.equal(row.Cost, 0.002);
    assert.equal(row.Retries, 2);
    assert.equal(row.CacheHit, false);
  });

  it("collector stores rows during pipeline scope", async () => {
    const collector = new StageTelemetryCollector();
    await runWithStageTelemetryCollector(collector, async () => {
      recordStageTelemetry({
        stage: "planner",
        started: "2026-01-01T00:00:00.000Z",
        finished: "2026-01-01T00:00:02.000Z",
        durationMs: 2000,
        inputTokens: 100,
        outputTokens: 50,
        costUsd: 0.001,
        retries: 0,
        cacheHit: false,
        status: "success",
      });
    });
    assert.equal(collector.records.length, 1);
    assert.equal(collector.records[0]?.stage, "planner");
  });

  it("tracks retries per pipeline step scope", async () => {
    await runWithStageRetryScope("hero", async () => {
      incrementStageRetries("hero");
      incrementStageRetries("hero");
      assert.equal(stageRetryCount("hero"), 2);
    });
  });
});
