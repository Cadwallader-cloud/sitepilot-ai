/**
 * Crestis orchestrator pipeline
 *
 *   User
 *    ↓
 *   Business Analyzer
 *    ↓
 *   Brand Personality
 *    ↓
 *   Website Planner
 *    ↓
 *   Hero → About → Services → FAQ → SEO
 *    ↓
 *   QA
 *    ↓
 *   Website JSON
 *
 * Events:
 *   pipeline:start → step:start → step:retry* → step:success|step:error → pipeline:complete
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
  type PipelineContext,
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
import { PipelineError } from "./pipeline-error";
import { BusinessStep } from "./steps/business.step";
import { BrandStep } from "./steps/brand.step";
import { PlannerStep } from "./steps/planner.step";
import { HeroStep } from "./steps/hero.step";
import { AboutStep } from "./steps/about.step";
import { ServicesStep } from "./steps/services.step";
import { FAQStep } from "./steps/faq.step";
import { SEOStep } from "./steps/seo.step";
import { QAStep } from "./steps/qa.step";

export { PipelineError } from "./pipeline-error";
export {
  emitPipelineEvent,
  setPipelineEventHandler,
  runWithPipelineEventSink,
  type PipelineEvent,
  type PipelineEventHandler,
  type PipelineEventType,
} from "./events";

/** Product diagram order */
export const pipeline: PipelineStep<PipelineContext>[] = [
  new BusinessStep(),
  new BrandStep(),
  new PlannerStep(),
  new HeroStep(),
  new AboutStep(),
  new ServicesStep(),
  new FAQStep(),
  new SEOStep(),
  new QAStep(),
];

/** @deprecated Prefer `pipeline` */
export const PIPELINE_STEPS = pipeline;

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

  return {
    business,
    branding,
    website,
    logs: [],
    meta: {
      input,
      options: { ...options, runId },
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

export async function runPipeline(
  input: BusinessFormInput,
  options: EngineRunOptions = {},
  onProgress?: (p: PipelineProgress) => void,
  onEvent?: PipelineEventHandler,
): Promise<Website> {
  const events: PipelineEvent[] = [];

  return runWithPipelineEventSink(
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

      for (const step of pipeline) {
        emit(context, "step:start", { step: step.id });

        const started = Date.now();
        const tracked = await runWithAttemptUsage(async () => {
          try {
            return {
              ok: true as const,
              context: await step.run(context),
            };
          } catch (err) {
            return { ok: false as const, err };
          }
        });

        const duration = Date.now() - started;
        const { tokens, cost } = tracked;

        if (!tracked.value.ok) {
          const err = tracked.value.err;
          const reason =
            err instanceof PipelineError
              ? err.failure.reason
              : err instanceof Error
                ? err.message
                : String(err ?? "Unknown error");

          context = appendLog(context, {
            step: step.id,
            duration,
            tokens,
            cost,
            status: "error",
          });
          emit(context, "step:error", {
            step: step.id,
            duration,
            tokens,
            cost,
            reason,
          });
          throw PipelineError.fromUnknown(step.id, err);
        }

        context = appendLog(tracked.value.context, {
          step: step.id,
          duration,
          tokens,
          cost,
          status: "success",
        });
        // Keep the shared events array reference on meta
        context = {
          ...context,
          meta: { ...context.meta, events, onEvent },
        };
        emit(context, "step:success", {
          step: step.id,
          duration,
          tokens,
          cost,
        });
      }

      emit(context, "pipeline:complete");

      // Schema v2 Website — fully assembled by QA step
      const website = context.website;
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
  );
}
