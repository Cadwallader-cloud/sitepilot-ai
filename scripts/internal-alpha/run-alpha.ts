/**
 * Sprint 1.5 — Internal Alpha batch runner.
 * Uses the real Crestis engine (generateSiteWithOpenAI) + rules QA + preview save.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/internal-alpha/run-alpha.ts
 *   npx tsx --env-file=.env.local scripts/internal-alpha/run-alpha.ts --limit=5
 *   npx tsx --env-file=.env.local scripts/internal-alpha/run-alpha.ts --niche=roofing
 *   npx tsx --env-file=.env.local scripts/internal-alpha/run-alpha.ts --output=runs/2026-07-23-001
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BusinessFormInput } from "../../src/lib/business-form";
import { generateSiteWithOpenAI } from "../../src/lib/generate-site-ai";
import { auditWebsiteWithRules } from "../../src/lib/quality-audit";
import { formatGenerationUsage } from "../../src/lib/usage";
import {
  evaluateGenerationKpi,
  evaluateSprintDKpi,
  formatKpiLine,
  GENERATION_KPI_MS,
} from "./kpi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const MATRIX = path.join(ROOT, "scripts/ai-quality/matrix.json");
const DEFAULT_OUT_DIR = path.join(__dirname, "output");

export function resolveRunOutputDir(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_OUT_DIR;
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(ROOT, trimmed);
}

const NICHE_CATEGORY: Record<string, string> = {
  roofing: "Roofing",
  plumbing: "Plumbing",
  hvac: "HVAC",
  electricians: "Electrician",
  restaurants: "Restaurant",
  dentists: "Dentist",
  lawyers: "Law Firm",
  cleaning: "Cleaning",
  landscaping: "Landscaping",
  real_estate: "Real Estate",
};

type MatrixRow = {
  id: string;
  niche: string;
  businessName: string;
  location: string;
  services: string;
  phone: string;
  email: string;
};

export function parseAlphaBatchArgs(argv: string[]) {
  const out = {
    limit: 100,
    niche: null as string | null,
    concurrency: 2,
    output: null as string | null,
  };
  for (const arg of argv) {
    if (arg.startsWith("--limit=")) out.limit = Number(arg.slice(8)) || 100;
    if (arg.startsWith("--niche=")) out.niche = arg.slice(8);
    if (arg.startsWith("--concurrency=")) {
      out.concurrency = Math.max(1, Number(arg.slice(14)) || 2);
    }
    if (arg.startsWith("--output=")) out.output = arg.slice(9);
  }
  return out;
}

function toFormInput(row: MatrixRow): BusinessFormInput {
  const category = NICHE_CATEGORY[row.niche] ?? row.niche;
  return {
    businessName: row.businessName,
    category,
    location: row.location,
    description: `${row.businessName} serves ${row.location} with ${category.toLowerCase()} services.`,
    services: row.services,
    phone: row.phone,
    email: row.email,
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]!, idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const args = parseAlphaBatchArgs(process.argv.slice(2));
  const outDir = resolveRunOutputDir(args.output);
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY missing (.env.local)");
    process.exit(1);
  }

  const matrix = JSON.parse(await readFile(MATRIX, "utf8")) as MatrixRow[];
  let rows = matrix;
  if (args.niche) rows = rows.filter((r) => r.niche === args.niche);
  rows = rows.slice(0, args.limit);

  await mkdir(outDir, { recursive: true });

  console.log(
    `Internal Alpha — ${rows.length} sites via Crestis engine (concurrency=${args.concurrency}, output=${path.relative(ROOT, outDir)})`,
  );

  const results = await mapPool(rows, args.concurrency, async (row, idx) => {
    process.stdout.write(`[${idx + 1}/${rows.length}] ${row.id}… `);
    const started = Date.now();
    const stepTimings: { step: string; durationMs: number }[] = [];
    try {
      const input = toFormInput(row);
      const site = await generateSiteWithOpenAI(input, {
        userEmail: "alpha@crestis.internal",
        onEvent: (event) => {
          if (
            event.type === "step:success" &&
            event.step &&
            typeof event.duration === "number"
          ) {
            stepTimings.push({ step: event.step, durationMs: event.duration });
          }
        },
      });
      const qa = auditWebsiteWithRules(site, input.location, {
        category: input.category,
      });
      const payload = {
        id: row.id,
        niche: row.niche,
        input: row,
        site,
        usage: site.usage,
        telemetry: site.usage?.telemetry ?? [],
        qa: {
          score: qa.score,
          summary: qa.summary,
          checks: qa.checks,
          source: qa.source,
        },
        mode: "preview" as const,
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - started,
        timing: {
          totalMs: Date.now() - started,
          steps: stepTimings,
        },
      };
      await writeFile(
        path.join(outDir, `${row.id}.json`),
        JSON.stringify(payload, null, 2),
        "utf8",
      );
      const usageLabel = site.usage ? formatGenerationUsage(site.usage) : "usage n/a";
      console.log(`ok (${qa.score}/100, ${payload.durationMs}ms, ${usageLabel})`);
      return {
        ok: true,
        id: row.id,
        score: qa.score,
        durationMs: payload.durationMs,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.log(`FAIL ${message}`);
      await writeFile(
        path.join(outDir, `${row.id}.error.json`),
        JSON.stringify(
          { id: row.id, error: message, stack, at: new Date().toISOString() },
          null,
          2,
        ),
        "utf8",
      );
      return { ok: false, id: row.id, error: message };
    }
  });

  const okRuns = results.filter((r) => r.ok && typeof r.durationMs === "number");
  const avgDurationMs =
    okRuns.length > 0
      ? Math.round(
          okRuns.reduce((sum, r) => sum + (r.durationMs as number), 0) /
            okRuns.length,
        )
      : null;

  const okCount = results.filter((r) => r.ok).length;
  const avgScore =
    results.filter((r) => r.ok && typeof r.score === "number").length > 0
      ? Math.round(
          results
            .filter((r) => r.ok && typeof r.score === "number")
            .reduce((sum, r) => sum + (r.score as number), 0) /
            results.filter((r) => r.ok && typeof r.score === "number").length,
        )
      : null;

  const successRate = rows.length > 0 ? okCount / rows.length : null;

  const summary = {
    sprint: "1.5-internal-alpha",
    pipelineVersion: "v2+v3+c",
    kpiTargetsMs: GENERATION_KPI_MS,
    total: rows.length,
    ok: okCount,
    failed: results.filter((r) => !r.ok),
    avgDurationMs,
    kpi: avgDurationMs != null ? evaluateGenerationKpi(avgDurationMs) : null,
    avgScore,
    successRate,
    sprintD: evaluateSprintDKpi({
      avgDurationMs,
      avgCostUsd: null,
      successRate,
      avgQaScore: avgScore,
      retryRate: null,
    }),
    outputDir: path.relative(ROOT, outDir),
    finishedAt: new Date().toISOString(),
  };

  await writeFile(
    path.join(outDir, "_alpha-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
  console.log(summary);
  if (avgDurationMs != null) {
    console.log(formatKpiLine(avgDurationMs));
  }
  if (summary.failed.length > 0) process.exit(1);
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
