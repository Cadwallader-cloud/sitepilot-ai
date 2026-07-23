import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateGenerationKpi,
  evaluateSprintDKpi,
  SPRINT_D_KPI,
} from "./kpi.mjs";

test("evaluateGenerationKpi — V3 band at 40s", () => {
  const kpi = evaluateGenerationKpi(40_000);
  assert.equal(kpi.currentTier, "v3_single_pass");
});

test("evaluateSprintDKpi — all pass", () => {
  const result = evaluateSprintDKpi({
    avgDurationMs: 35_000,
    avgCostUsd: 0.03,
    successRate: 0.995,
    avgQaScore: 95,
    retryRate: 0.02,
  });
  assert.equal(result.pass, true);
  assert.equal(result.passedCount, 5);
});

test("evaluateSprintDKpi — generation time fail", () => {
  const result = evaluateSprintDKpi({
    avgDurationMs: 186_000,
    avgCostUsd: 0.03,
    successRate: 1,
    avgQaScore: 98,
    retryRate: 0,
  });
  assert.equal(result.pass, false);
  const gen = result.checks.find((c) => c.key === "generationTime");
  assert.equal(gen.pass, false);
});

test("evaluateSprintDKpi — N/A when metrics missing", () => {
  const result = evaluateSprintDKpi({});
  assert.equal(result.pass, false);
  assert.equal(result.measurableCount, 0);
  assert.equal(SPRINT_D_KPI.maxGenerationTimeMs, 40_000);
});
