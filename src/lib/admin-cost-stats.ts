import type { StageTelemetryRecord } from "@/lib/ai/telemetry/stage-telemetry";
import type { GenerationUsageStep } from "@/lib/usage";

export type ModuleCostRow = {
  stage: string;
  runs: number;
  avgDurationMs: number;
  totalDurationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  avgCostUsd: number;
};

export type AdminCostStats = {
  sampleCount: number;
  avgCostUsd: number;
  avgDurationMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  byModule: ModuleCostRow[];
  mostExpensive: ModuleCostRow[];
};

export type GenerateUsageLogMeta = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  durationMs?: number;
  steps?: GenerationUsageStep[];
  telemetry?: StageTelemetryRecord[];
};

const emptyStats: AdminCostStats = {
  sampleCount: 0,
  avgCostUsd: 0,
  avgDurationMs: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  totalCostUsd: 0,
  byModule: [],
  mostExpensive: [],
};

function num(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function moduleKey(stage: string): string {
  return stage.trim() || "unknown";
}

/** Pure aggregation for tests + admin dashboard. */
export function summarizeAdminCostStats(
  rows: GenerateUsageLogMeta[],
): AdminCostStats {
  if (!rows.length) return emptyStats;

  let sampleCount = 0;
  let sumCost = 0;
  let sumDuration = 0;
  let durationSamples = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const moduleMap = new Map<
    string,
    {
      runs: number;
      totalDurationMs: number;
      inputTokens: number;
      outputTokens: number;
      costUsd: number;
    }
  >();

  const bumpModule = (
    stage: string,
    patch: {
      runs?: number;
      durationMs?: number;
      inputTokens?: number;
      outputTokens?: number;
      costUsd?: number;
    },
  ) => {
    const key = moduleKey(stage);
    const prev = moduleMap.get(key) ?? {
      runs: 0,
      totalDurationMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
    };
    moduleMap.set(key, {
      runs: prev.runs + (patch.runs ?? 0),
      totalDurationMs: prev.totalDurationMs + (patch.durationMs ?? 0),
      inputTokens: prev.inputTokens + (patch.inputTokens ?? 0),
      outputTokens: prev.outputTokens + (patch.outputTokens ?? 0),
      costUsd: prev.costUsd + (patch.costUsd ?? 0),
    });
  };

  for (const row of rows) {
    sampleCount += 1;
    const cost = num(row.costUsd);
    sumCost += cost;

    const durationMs = num(row.durationMs);
    if (durationMs > 0) {
      sumDuration += durationMs;
      durationSamples += 1;
    }

    const input = num(row.promptTokens);
    const output = num(row.completionTokens);
    totalInputTokens += input;
    totalOutputTokens += output;

    const telemetry = Array.isArray(row.telemetry) ? row.telemetry : [];
    const steps = Array.isArray(row.steps) ? row.steps : [];

    if (telemetry.length) {
      for (const t of telemetry) {
        if (t.cacheHit && t.durationMs === 0 && t.costUsd === 0) {
          bumpModule(t.stage, { runs: 1 });
          continue;
        }
        bumpModule(t.stage, {
          runs: 1,
          durationMs: num(t.durationMs),
          inputTokens: num(t.inputTokens),
          outputTokens: num(t.outputTokens),
          costUsd: num(t.costUsd),
        });
      }
      continue;
    }

    if (steps.length) {
      for (const step of steps) {
        bumpModule(step.step, {
          runs: 1,
          durationMs: num(step.durationMs),
          inputTokens: num(step.promptTokens),
          outputTokens: num(step.completionTokens),
          costUsd: num(step.costUsd),
        });
      }
      continue;
    }

    bumpModule("generation", {
      runs: 1,
      durationMs,
      inputTokens: input,
      outputTokens: output,
      costUsd: cost,
    });
  }

  const byModule: ModuleCostRow[] = [...moduleMap.entries()]
    .map(([stage, agg]) => ({
      stage,
      runs: agg.runs,
      totalDurationMs: agg.totalDurationMs,
      avgDurationMs: agg.runs
        ? Math.round(agg.totalDurationMs / agg.runs)
        : 0,
      inputTokens: agg.inputTokens,
      outputTokens: agg.outputTokens,
      totalTokens: agg.inputTokens + agg.outputTokens,
      costUsd: Math.round(agg.costUsd * 1_000_000) / 1_000_000,
      avgCostUsd:
        Math.round((agg.runs ? agg.costUsd / agg.runs : 0) * 1_000_000) /
        1_000_000,
    }))
    .sort((a, b) => b.costUsd - a.costUsd);

  const totalCostUsd = Math.round(sumCost * 1_000_000) / 1_000_000;

  return {
    sampleCount,
    avgCostUsd:
      Math.round((sampleCount ? sumCost / sampleCount : 0) * 1_000_000) /
      1_000_000,
    avgDurationMs: durationSamples
      ? Math.round(sumDuration / durationSamples)
      : 0,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    totalCostUsd,
    byModule,
    mostExpensive: byModule.slice(0, 8),
  };
}

export function buildGenerateUsageMeta(params: {
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    steps?: GenerationUsageStep[];
    telemetry?: StageTelemetryRecord[];
  };
  durationMs?: number;
}): GenerateUsageLogMeta | undefined {
  if (!params.usage) return undefined;
  return {
    promptTokens: params.usage.promptTokens,
    completionTokens: params.usage.completionTokens,
    totalTokens: params.usage.totalTokens,
    costUsd: params.usage.costUsd,
    durationMs: params.durationMs,
    steps: params.usage.steps,
    telemetry: params.usage.telemetry,
  };
}

export async function getAdminCostStats(): Promise<AdminCostStats> {
  const { getSupabaseAdmin } = await import("@/lib/supabase");
  const supabase = getSupabaseAdmin();
  if (!supabase) return emptyStats;

  const { data, error } = await supabase
    .from("api_usage")
    .select("meta, status, created_at")
    .eq("route", "/api/generate")
    .eq("status", 200)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    if (error) console.error("getAdminCostStats:", error.message);
    return emptyStats;
  }

  const rows: GenerateUsageLogMeta[] = [];
  for (const row of data as { meta: unknown }[]) {
    const meta =
      row.meta && typeof row.meta === "object"
        ? (row.meta as GenerateUsageLogMeta)
        : null;
    if (!meta || num(meta.costUsd) <= 0 && num(meta.totalTokens) <= 0) {
      continue;
    }
    rows.push(meta);
  }

  return summarizeAdminCostStats(rows);
}
