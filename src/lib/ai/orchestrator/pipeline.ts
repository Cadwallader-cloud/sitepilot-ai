/**
 * Crestis orchestrator pipeline (V2)
 *
 *   User
 *    ↓
 *   Business Analyzer
 *    ↓
 *   Brand Personality
 *    ↓
 *   Website Planner
 *    ↓
 *   Hero ─┬─ About ─┬─ Services ─┬─ FAQ   (parallel)
 *         └─────────┴─────────────┘
 *                    ↓ merge
 *                  SEO
 *                    ↓
 *                   QA
 *    ↓
 *   Website JSON
 */

import type { BusinessFormInput } from "../../business-form";
import { normalizeBusinessDna } from "../../business-dna";
import {
  detectIndustry,
  getIndustryPack,
  industryPackBrief,
} from "../../industries";
import { detectTrade } from "../../trade-images";
import type { Website } from "../../website";
import type { EngineRunOptions } from "../../ai-engine/types";
import {
  briefFromDna,
  appendLog,
  seedBranding,
  seedBusinessFromInput,
  seedWebsiteShell,
  resolveGenerationProfile,
  type PipelineContext,
  type PipelineLog,
  type PipelineProgress,
  type PipelineStep,
} from "./context";
import {
  emitPipelineEvent,
  runWithPipelineEventSink,
  type PipelineEvent,
  type PipelineEventHandler,
  type PipelineEventType,
} from "./events";
import { runWithAttemptUsage } from "../retry/attempt-log";
import {
  recordStageTelemetry,
  runWithStageRetryScope,
  runWithStageTelemetryCollector,
  stageRetryCount,
  StageTelemetryCollector,
} from "../telemetry/stage-telemetry";
import { summarizePipelineUsage } from "../../usage";
import { PipelineError } from "./pipeline-error";
import {
  cloneForParallelStep,
  mergeParallelContentResults,
} from "./merge-context";
import { BusinessStep } from "./steps/business.step";
import { BrandStep } from "./steps/brand.step";
import { PlannerStep } from "./steps/planner.step";
import { HeroStep } from "./steps/hero.step";
import { AboutStep } from "./steps/about.step";
import { ServicesStep } from "./steps/services.step";
import { FAQStep } from "./steps/faq.step";
import { SEOStep } from "./steps/seo.step";
import { QAStep } from "./steps/qa.step";

/** Content steps may fail softly — pipeline continues with fallbacks */
const RESILIENT_STEP_IDS = new Set([
  "hero",
  "about",
  "services",
  "faq",
  "seo",
]);

const SEQUENTIAL_PREFIX: PipelineStep<PipelineContext>[] = [
  new BusinessStep(),
  new BrandStep(),
  new PlannerStep(),
];

/** Run in parallel after planner — independent inputs, merged before SEO. */
const PARALLEL_CONTENT: PipelineStep<PipelineContext>[] = [
  new HeroStep(),
  new AboutStep(),
  new ServicesStep(),
  new FAQStep(),
];

const SEQUENTIAL_SUFFIX: PipelineStep<PipelineContext>[] = [
  new SEOStep(),
  new QAStep(),
];

/** Product diagram order (legacy flat list) */
export const pipeline: PipelineStep<PipelineContext>[] = [
  ...SEQUENTIAL_PREFIX,
  ...PARALLEL_CONTENT,
  ...SEQUENTIAL_SUFFIX,
];

export { PipelineError } from "./pipeline-error";
export {
  emitPipelineEvent,
  setPipelineEventHandler,
  runWithPipelineEventSink,
  type PipelineEvent,
  type PipelineEventHandler,
  type PipelineEventType,
} from "./events";

/** @deprecated Prefer `pipeline` */
export const PIPELINE_STEPS = pipeline;

type StepRunResult =
  | { ok: true; context: PipelineContext; log: PipelineLog }
  | { ok: false; err: unknown; log: PipelineLog };

function createInitialContext(
  input: BusinessFormInput,
  options: EngineRunOptions,
  events: PipelineEvent[],
  onProgress?: (p: PipelineProgress) => void,
  onEvent?: PipelineEventHandler,
): PipelineContext {
  const runId =
    options.runId ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const category = (input.category || "").trim();
  const tradeHint = [
    input.businessName,
    category,
    input.location,
    input.description,
    input.services,
  ]
    .filter(Boolean)
    .join(" ");
  const tradeKey = detectTrade(tradeHint);
  const industryId = detectIndustry(tradeHint);
  const industryPack = getIndustryPack(industryId);
  const industryBrief = industryPackBrief(
    industryPack,
    input.location.trim(),
  );

  const dna = normalizeBusinessDna(
    {},
    {
      industry: category || industryPack.label || tradeKey,
      location: input.location.trim(),
      services: input.services,
    },
  );

  const business = seedBusinessFromInput(
    input,
    dna,
    category || industryPack.label || tradeKey,
  );
  const branding = seedBranding(dna);
  const website = seedWebsiteShell({ runId, business, branding });
  const generationProfile = resolveGenerationProfile(options);

  return {
    business,
    branding,
    website,
    logs: [],
    telemetry: [],
    meta: {
      input,
      options: { ...options, runId, generationMode: generationProfile.mode },
      runId,
      onProgress,
      onEvent,
      events,
      category,
      tradeKey,
      industryId,
      industryPack,
      industryBrief,
      tradeHint,
      dna,
      liveDna: dna,
      brief: briefFromDna(input, dna, tradeHint, industryId),
      personalityBrief: "",
      copySeedBrief: industryBrief,
      generationProfile,
    },
  };
}

function emit(
  ctx: PipelineContext,
  type: PipelineEventType,
  payload: Omit<PipelineEvent, "type" | "at" | "runId"> = {},
): void {
  emitPipelineEvent(type, { runId: ctx.meta.runId, ...payload });
}

async function runSingleStep(
  context: PipelineContext,
  step: PipelineStep<PipelineContext>,
): Promise<StepRunResult> {
  emit(context, "step:start", { step: step.id });

  const startedMs = Date.now();
  const startedIso = new Date(startedMs).toISOString();

  const tracked = await runWithStageRetryScope(step.id, () =>
    runWithAttemptUsage(async () => {
      try {
        return {
          ok: true as const,
          context: await step.run(context),
        };
      } catch (err) {
        return { ok: false as const, err };
      }
    }),
  );

  const finishedMs = Date.now();
  const finishedIso = new Date(finishedMs).toISOString();
  const duration = finishedMs - startedMs;
  const { tokens, promptTokens, completionTokens, cost } = tracked;
  const retries = stageRetryCount(step.id);

  if (!tracked.value.ok) {
    const err = tracked.value.err;
    const reason =
      err instanceof PipelineError
        ? err.failure.reason
        : err instanceof Error
          ? err.message
          : String(err ?? "Unknown error");

    const log: PipelineLog = {
      step: step.id,
      started: startedIso,
      finished: finishedIso,
      duration,
      tokens,
      promptTokens,
      completionTokens,
      cost,
      retries,
      cacheHit: false,
      status: "error",
    };

    recordStageTelemetry({
      stage: step.id,
      started: startedIso,
      finished: finishedIso,
      durationMs: duration,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      costUsd: cost,
      retries,
      cacheHit: false,
      status: "error",
    });

    emit(context, "step:error", {
      step: step.id,
      duration,
      tokens,
      promptTokens,
      completionTokens,
      cost,
      reason,
    });

    return { ok: false, err, log };
  }

  const log: PipelineLog = {
    step: step.id,
    started: startedIso,
    finished: finishedIso,
    duration,
    tokens,
    promptTokens,
    completionTokens,
    cost,
    retries,
    cacheHit: false,
    status: "success",
  };

  recordStageTelemetry({
    stage: step.id,
    started: startedIso,
    finished: finishedIso,
    durationMs: duration,
    inputTokens: promptTokens,
    outputTokens: completionTokens,
    costUsd: cost,
    retries,
    cacheHit: false,
    status: "success",
  });

  const nextContext = appendLog(tracked.value.context, log);
  emit(context, "step:success", {
    step: step.id,
    duration,
    tokens,
    promptTokens,
    completionTokens,
    cost,
  });

  return {
    ok: true,
    context: {
      ...nextContext,
      meta: {
        ...nextContext.meta,
        events: context.meta.events,
        onEvent: context.meta.onEvent,
      },
    },
    log,
  };
}

function handleStepFailure(
  context: PipelineContext,
  step: PipelineStep<PipelineContext>,
  result: Extract<StepRunResult, { ok: false }>,
): PipelineContext {
  context = appendLog(context, result.log);

  if (RESILIENT_STEP_IDS.has(step.id)) {
    console.warn(
      `[pipeline-soft-continue] ${step.id} failed — continuing`,
      result.err instanceof Error ? result.err.message : result.err,
    );
    return context;
  }

  throw result.err instanceof PipelineError
    ? result.err
    : PipelineError.fromUnknown(step.id, result.err);
}

async function runParallelContentSteps(
  context: PipelineContext,
  steps: PipelineStep<PipelineContext>[],
): Promise<PipelineContext> {
  console.info(
    "[pipeline-v2] parallel content wave:",
    steps.map((s) => s.id).join(", "),
  );

  const outcomes = await Promise.all(
    steps.map(async (step) => {
      const fork = cloneForParallelStep(context);
      fork.meta.events = context.meta.events;
      fork.meta.onEvent = context.meta.onEvent;
      fork.meta.onProgress = context.meta.onProgress;
      const result = await runSingleStep(fork, step);
      return { step, result };
    }),
  );

  const mergedResults: Array<{
    stepId: string;
    ctx: PipelineContext;
    log: PipelineLog;
  }> = [];

  for (const { step, result } of outcomes) {
    if (result.ok) {
      mergedResults.push({
        stepId: step.id,
        ctx: result.context,
        log: result.log,
      });
      continue;
    }

    context = handleStepFailure(context, step, result);
  }

  if (mergedResults.length) {
    context = mergeParallelContentResults(context, mergedResults);
    context = {
      ...context,
      meta: {
        ...context.meta,
        events: context.meta.events,
        onEvent: context.meta.onEvent,
      },
    };
  }

  return context;
}

export async function runPipeline(
  input: BusinessFormInput,
  options: EngineRunOptions = {},
  onProgress?: (p: PipelineProgress) => void,
  onEvent?: PipelineEventHandler,
): Promise<Website> {
  const events: PipelineEvent[] = [];
  const telemetryCollector = new StageTelemetryCollector();

  return runWithStageTelemetryCollector(telemetryCollector, () =>
    runWithPipelineEventSink(
    (event) => {
      events.push(event);
      onEvent?.(event);
    },
    async () => {
      let context = createInitialContext(
        input,
        options,
        events,
        onProgress,
        onEvent,
      );

      emit(context, "pipeline:start");

      for (const step of SEQUENTIAL_PREFIX) {
        const result = await runSingleStep(context, step);
        if (!result.ok) {
          context = handleStepFailure(context, step, result);
          continue;
        }
        context = result.context;
      }

      context = await runParallelContentSteps(context, PARALLEL_CONTENT);

      for (const step of SEQUENTIAL_SUFFIX) {
        const result = await runSingleStep(context, step);
        if (!result.ok) {
          context = handleStepFailure(context, step, result);
          continue;
        }
        context = result.context;
      }

      emit(context, "pipeline:complete");

      const telemetry = telemetryCollector.records;
      context = { ...context, telemetry };

      const usage = summarizePipelineUsage(context.logs, telemetry);
      console.info("[pipeline-usage]", JSON.stringify(usage));

      const website = {
        ...context.website,
        crestis: {
          ...context.website.crestis,
          usage,
          telemetry,
          generationMode: context.meta.generationProfile?.mode,
        },
      };

      if (
        !website.business?.name ||
        !website.branding ||
        !Array.isArray(website.pages) ||
        website.pages.length === 0 ||
        !website.seo ||
        !website.theme
      ) {
        throw new PipelineError("pipeline", {
          module: "pipeline",
          attempts: 0,
          reason: "Incomplete Website after orchestrator",
        });
      }

      return website;
    },
  ),
  );
}
