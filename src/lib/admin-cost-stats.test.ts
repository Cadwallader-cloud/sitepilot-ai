import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeAdminCostStats } from "./admin-cost-stats";

describe("admin-cost-stats", () => {
  it("aggregates generation averages and module costs from telemetry", () => {
    const stats = summarizeAdminCostStats([
      {
        promptTokens: 1000,
        completionTokens: 400,
        totalTokens: 1400,
        costUsd: 0.01,
        durationMs: 30_000,
        telemetry: [
          {
            stage: "hero",
            started: "",
            finished: "",
            durationMs: 8000,
            inputTokens: 500,
            outputTokens: 200,
            costUsd: 0.004,
            retries: 0,
            cacheHit: false,
            status: "success",
          },
          {
            stage: "planner",
            started: "",
            finished: "",
            durationMs: 12000,
            inputTokens: 400,
            outputTokens: 150,
            costUsd: 0.005,
            retries: 1,
            cacheHit: false,
            status: "success",
          },
        ],
      },
      {
        promptTokens: 900,
        completionTokens: 300,
        totalTokens: 1200,
        costUsd: 0.008,
        durationMs: 25_000,
        telemetry: [
          {
            stage: "hero",
            started: "",
            finished: "",
            durationMs: 7000,
            inputTokens: 450,
            outputTokens: 180,
            costUsd: 0.0035,
            retries: 0,
            cacheHit: false,
            status: "success",
          },
          {
            stage: "seo_ai",
            started: "",
            finished: "",
            durationMs: 6000,
            inputTokens: 350,
            outputTokens: 120,
            costUsd: 0.003,
            retries: 0,
            cacheHit: false,
            status: "success",
          },
        ],
      },
    ]);

    assert.equal(stats.sampleCount, 2);
    assert.equal(stats.avgCostUsd, 0.009);
    assert.equal(stats.avgDurationMs, 27_500);
    assert.equal(stats.totalInputTokens, 1900);
    assert.equal(stats.totalOutputTokens, 700);

    const hero = stats.byModule.find((m) => m.stage === "hero");
    assert.ok(hero);
    assert.equal(hero.runs, 2);
    assert.equal(hero.costUsd, 0.0075);

    assert.equal(stats.mostExpensive[0]?.stage, "hero");
  });

  it("falls back to pipeline steps when telemetry is missing", () => {
    const stats = summarizeAdminCostStats([
      {
        promptTokens: 500,
        completionTokens: 100,
        totalTokens: 600,
        costUsd: 0.002,
        durationMs: 10_000,
        steps: [
          {
            step: "about",
            promptTokens: 500,
            completionTokens: 100,
            totalTokens: 600,
            costUsd: 0.002,
            durationMs: 10_000,
          },
        ],
      },
    ]);

    assert.equal(stats.byModule.length, 1);
    assert.equal(stats.byModule[0]?.stage, "about");
  });
});
