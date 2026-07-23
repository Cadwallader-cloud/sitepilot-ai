/**
 * Generation pipeline KPI ladder (wall-clock per site, ms).
 *
 * V1 — sequential baseline (~190 s)
 * V2 — parallel content wave after planner (~70 s target)
 * V3 — single-pass hero/about (+ other stage merges) (~40 s target)
 * V4 — context cache + deterministic QA selectors + nano routing (~25–35 s)
 */

export const GENERATION_KPI_MS = {
  v1_baseline: 190_000,
  v2_parallel: 70_000,
  v3_single_pass: 40_000,
  v4_cached_min: 25_000,
  v4_cached_max: 35_000,
};

/** Sprint D sign-off targets (production / alpha batch). */
export const SPRINT_D_KPI = {
  maxGenerationTimeMs: 40_000,
  maxAvgCostUsd: 0.05,
  minSuccessRate: 0.99,
  minQaScore: 90,
  maxRetryRate: 0.05,
};

/**
 * @param {{
 *   avgDurationMs?: number | null;
 *   avgCostUsd?: number | null;
 *   successRate?: number | null;
 *   avgQaScore?: number | null;
 *   retryRate?: number | null;
 * }} metrics
 */
export function evaluateSprintDKpi(metrics) {
  const targets = SPRINT_D_KPI;

  const check = (key, pass, actual, target, na = false) => ({
    key,
    pass: na ? null : pass,
    actual,
    target,
    na,
  });

  const checks = [
    check(
      "generationTime",
      metrics.avgDurationMs != null &&
        metrics.avgDurationMs < targets.maxGenerationTimeMs,
      metrics.avgDurationMs != null
        ? `${Math.round(metrics.avgDurationMs / 1000)} s`
        : null,
      `< ${targets.maxGenerationTimeMs / 1000} s`,
      metrics.avgDurationMs == null,
    ),
    check(
      "avgCost",
      metrics.avgCostUsd != null && metrics.avgCostUsd < targets.maxAvgCostUsd,
      metrics.avgCostUsd != null ? `$${metrics.avgCostUsd.toFixed(4)}` : null,
      `< $${targets.maxAvgCostUsd.toFixed(2)}`,
      metrics.avgCostUsd == null,
    ),
    check(
      "successRate",
      metrics.successRate != null && metrics.successRate > targets.minSuccessRate,
      metrics.successRate != null
        ? `${(metrics.successRate * 100).toFixed(1)}%`
        : null,
      `> ${(targets.minSuccessRate * 100).toFixed(0)}%`,
      metrics.successRate == null,
    ),
    check(
      "qaScore",
      metrics.avgQaScore != null && metrics.avgQaScore > targets.minQaScore,
      metrics.avgQaScore != null ? String(Math.round(metrics.avgQaScore)) : null,
      `> ${targets.minQaScore}`,
      metrics.avgQaScore == null,
    ),
    check(
      "retryRate",
      metrics.retryRate != null && metrics.retryRate < targets.maxRetryRate,
      metrics.retryRate != null
        ? `${(metrics.retryRate * 100).toFixed(2)}%`
        : null,
      `< ${(targets.maxRetryRate * 100).toFixed(0)}%`,
      metrics.retryRate == null,
    ),
  ];

  const measurable = checks.filter((c) => !c.na);
  const passed = measurable.filter((c) => c.pass).length;
  const allMeasurablePass =
    measurable.length > 0 && measurable.every((c) => c.pass);

  return {
    targets,
    checks,
    measurableCount: measurable.length,
    passedCount: passed,
    pass: allMeasurablePass,
  };
}

/** What's still needed to reach each tier (engineering checklist). */
export const GENERATION_KPI_V4_ITEMS = [
  "Context cache: reuse business/planner/branding blobs across steps",
  "Planner: parallel layout + seo_planner after website_planner",
  "Skip service prioritizer when input.services is explicit",
  "Optional gpt-5-nano for brand / FAQ / SEO polish stages",
];

/**
 * @param {number} avgDurationMs
 * @returns {{
 *   avgDurationMs: number;
 *   avgDurationSec: number;
 *   currentTier: string;
 *   nextTier: string | null;
 *   nextTargetMs: number | null;
 *   gapToNextMs: number | null;
 *   targets: typeof GENERATION_KPI_MS;
 *   v4Checklist: string[];
 * }}
 */
export function evaluateGenerationKpi(avgDurationMs) {
  const targets = GENERATION_KPI_MS;
  const sec = Math.round(avgDurationMs / 1000);

  let currentTier = "above_v1";
  let nextTier = "v2_parallel";
  let nextTargetMs = targets.v2_parallel;

  if (avgDurationMs <= targets.v4_cached_max) {
    currentTier = "v4_cached";
    nextTier = null;
    nextTargetMs = null;
  } else if (avgDurationMs <= targets.v3_single_pass) {
    currentTier = "v3_single_pass";
    nextTier = "v4_cached";
    nextTargetMs = targets.v4_cached_max;
  } else if (avgDurationMs <= targets.v2_parallel) {
    currentTier = "v2_parallel";
    nextTier = "v3_single_pass";
    nextTargetMs = targets.v3_single_pass;
  } else if (avgDurationMs <= targets.v1_baseline) {
    currentTier = "v1_baseline";
    nextTier = "v2_parallel";
    nextTargetMs = targets.v2_parallel;
  } else {
    currentTier = "above_v1";
    nextTier = "v2_parallel";
    nextTargetMs = targets.v2_parallel;
  }

  const gapToNextMs =
    nextTargetMs == null ? null : Math.max(0, avgDurationMs - nextTargetMs);

  return {
    avgDurationMs,
    avgDurationSec: sec,
    currentTier,
    nextTier,
    nextTargetMs,
    gapToNextMs,
    targets,
    v4Checklist: GENERATION_KPI_V4_ITEMS,
  };
}

/**
 * @param {number} avgDurationMs
 */
export function formatKpiLine(avgDurationMs) {
  const kpi = evaluateGenerationKpi(avgDurationMs);
  const tierLabel = {
    above_v1: "pre-V2 (above 190 s)",
    v1_baseline: "V1 baseline band (≤190 s)",
    v2_parallel: "V2 parallel (≤70 s) ✓",
    v3_single_pass: "V3 single-pass (≤40 s) ✓",
    v4_cached: "V4 cached (≤35 s) ✓",
  }[kpi.currentTier];

  if (kpi.nextTier == null) {
    return `KPI: ${kpi.avgDurationSec}s — ${tierLabel}`;
  }

  const nextSec = Math.round((kpi.nextTargetMs ?? 0) / 1000);
  const gapSec = Math.round((kpi.gapToNextMs ?? 0) / 1000);
  return `KPI: ${kpi.avgDurationSec}s — ${tierLabel}; need −${gapSec}s for ${kpi.nextTier} (≤${nextSec}s)`;
}
