/**
 * Hero section context — isolated view + ownership write-back.
 *
 * Hero sees ONLY:
 *   { business, branding, planner, audience, location, goal }
 *
 * No FAQ, footer, SEO, or other website sections.
 */

import type { Hero } from "../../../website";
import type { Branding, Business } from "../../../website";
import type { WebsitePlan } from "../../../ai-engine/types";
import { applyHeroDataPatch } from "../../../website-ownership";
import type { RetryHeroFromContext } from "../../retry/retryHero";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";

export const HERO_CONTEXT_KEYS = [
  "business",
  "branding",
  "planner",
  "audience",
  "location",
  "goal",
] as const;

export type HeroContext = {
  business: Business;
  branding: Branding;
  planner: WebsitePlan | undefined;
  audience: string[];
  location: string;
  goal: string;
};

function audienceFrom(ctx: PipelineContext): string[] {
  const plan = ctx.meta.plan;
  const audienceFromPlan = plan?.targetAudience?.trim();
  if (audienceFromPlan) return [audienceFromPlan];
  if (ctx.meta.liveDna?.targetAudience?.length) {
    return [...ctx.meta.liveDna.targetAudience];
  }
  if (ctx.meta.brief?.idealCustomer) {
    return [ctx.meta.brief.idealCustomer];
  }
  return [];
}

function locationFrom(ctx: PipelineContext): string {
  return (
    ctx.business.location?.trim() ||
    ctx.meta.input.location?.trim() ||
    ctx.meta.brief?.city?.trim() ||
    ""
  );
}

function goalFrom(ctx: PipelineContext): string {
  const plan = ctx.meta.plan;
  return (
    plan?.goal?.trim() ||
    ctx.meta.liveDna?.primaryGoal?.trim() ||
    ctx.meta.brief?.offerPromise?.trim() ||
    ""
  );
}

/** Hero-only slice — never reads FAQ / footer / SEO from website. */
export function selectHero(
  ctx: PipelineContext,
  shared?: SharedContext,
): HeroContext {
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    business: core.business,
    branding: core.branding,
    planner: core.planner,
    audience: audienceFrom(ctx),
    location: locationFrom(ctx),
    goal: goalFrom(ctx),
  };
}

export function applyHeroResult(
  ctx: PipelineContext,
  result: RetryHeroFromContext,
): PipelineContext {
  return {
    ...ctx,
    website: applyHeroDataPatch(ctx.website, result.hero),
    meta: {
      ...ctx.meta,
      engineCtx: result.engineCtx,
      agentCtx: result.agentCtx,
      heroResult: result.heroResult,
    },
  };
}

/** @internal Used by tests / write-back — not part of HeroContext */
export function findHeroData(ctx: PipelineContext): Hero | null {
  const home =
    ctx.website.pages.find((p) => p.id === "home" || p.slug === "/") ??
    ctx.website.pages[0];
  const section = home?.sections.find((s) => s.type === "hero");
  return section?.data ? (section.data as Hero) : null;
}
