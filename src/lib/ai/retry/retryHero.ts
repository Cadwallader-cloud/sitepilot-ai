/**
 * Hero — await retryHero(ctx) | await retry(generateHero, validateHero, …)
 */

import { generateHeroSection } from "../../ai-engine/content-generator";
import { runHeroPipeline } from "../../ai-engine/hero-pipeline";
import type { EngineContext } from "../../ai-engine/types";
import type { Hero } from "../../website";
import { validateHero } from "../../validation/validate";
import type { HeroInput } from "../../validation/hero";
import type { PipelineContext } from "../orchestrator/context";
import { prepareHeroRun, type HeroSectionRun } from "../context";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  softRetryResult,
  type RetryResult,
} from "./retry";
import { heroInputFallback } from "./section-fallbacks";

export type RetryHeroFromContext = {
  hero: Hero;
  heroInput: HeroInput;
  engineCtx: EngineContext;
  agentCtx: {
    ctx: EngineContext;
    brief: NonNullable<PipelineContext["meta"]["brief"]>;
    plan: NonNullable<PipelineContext["meta"]["plan"]>;
  };
  heroResult: NonNullable<PipelineContext["meta"]["heroResult"]>;
};

/** Classic: await retry(generateHero, validateHero, { module: "Hero" }) */
export async function retryHero(
  generateHero: () => Promise<unknown>,
  maxAttempts?: number,
): Promise<RetryResult<HeroInput>>;

/** Orchestrator: await retryHero(run) */
export async function retryHero(
  run: HeroSectionRun,
): Promise<RetryHeroFromContext>;

/** @deprecated Prefer HeroSectionRun from Context Manager */
export async function retryHero(
  ctx: PipelineContext,
): Promise<RetryHeroFromContext>;

export async function retryHero(
  arg: (() => Promise<unknown>) | HeroSectionRun | PipelineContext,
  maxAttempts = DEFAULT_SECTION_MAX_ATTEMPTS,
): Promise<RetryResult<HeroInput> | RetryHeroFromContext> {
  if (typeof arg === "function") {
    return retry<HeroInput>(arg, validateHero, {
      module: "Hero",
      maxAttempts,
    });
  }

  const run = "hero" in arg ? arg : prepareHeroRun(arg);
  const ctx = run.pipeline;
  void run.hero;
  const { meta } = ctx;
  if (!meta.plan || !meta.selection) {
    throw new Error("ORCHESTRATOR:hero requires plan");
  }

  const avoid = meta.options.previous;
  let heroResult = await runHeroPipeline({
    businessName: meta.input.businessName,
    location: meta.input.location,
    category: meta.category || meta.industryPack.label || meta.tradeKey,
    services: meta.input.services,
    description: meta.input.description || "",
    phone: meta.input.phone,
    dna: meta.liveDna,
    plan: meta.plan,
    templateBrief: meta.selection.copyBrief,
    personalityBrief: meta.personalityBrief,
    industryBrief: meta.copySeedBrief,
    userEmail: meta.options.userEmail,
    forbiddenHeadline: avoid?.headline || avoid?.heroTitle || undefined,
    regenerate: meta.options.regenerate,
    onProgress: (p) =>
      meta.onProgress?.({
        stage: p.stage,
        label: p.label,
      }),
  });

  const engineCtx: EngineContext = {
    input: meta.input,
    options: { ...meta.options, runId: meta.runId, previous: avoid },
    runId: meta.runId,
    brief: meta.brief,
    plan: meta.plan,
  };
  const agentCtx = { ctx: engineCtx, brief: meta.brief, plan: meta.plan };

  let heroAttempt = 0;
  const generateHero = async () => {
    heroAttempt += 1;
    if (heroAttempt === 1) return heroResult.hero;
    meta.onProgress?.({
      stage: "hero_retry",
      label: `Hero retry #${heroAttempt}`,
    });
    return generateHeroSection(agentCtx);
  };

  const heroRetry = await retry<HeroInput>(generateHero, validateHero, {
    module: "Hero",
    userEmail: meta.options.userEmail,
    runId: meta.runId,
    maxAttempts,
  });
  const heroInput = softRetryResult(
    heroRetry,
    heroInputFallback(
      {
        businessName: meta.input.businessName,
        category: meta.category || meta.industryPack.label || meta.tradeKey,
        location: meta.input.location,
        services: meta.input.services,
        description: meta.input.description,
      },
      heroResult.hero,
    ),
  ).data;

  heroResult = {
    ...heroResult,
    hero: { ...heroResult.hero, ...heroInput },
    final: heroInput.headline || heroResult.final,
  };

  const hero: Hero = {
    headline: heroResult.hero.headline,
    subheadline: heroResult.hero.subheadline,
    primaryCTA: heroResult.hero.primaryCTA,
    secondaryCTA: heroResult.hero.secondaryCTA,
    trustBar: heroResult.hero.trustBar ?? [],
  };

  return {
    hero,
    heroInput,
    engineCtx,
    agentCtx,
    heroResult,
  };
}
