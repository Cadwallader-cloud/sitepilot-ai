/**
 * About section context — isolated view + ownership write-back.
 *
 * About sees ONLY:
 *   { business, branding, hero, planner }
 *
 * No FAQ, footer, SEO, or other website sections.
 */

import type { Branding, Business, Hero } from "../../../website";
import type { WebsitePlan } from "../../../ai-engine/types";
import { applyAboutDataPatch } from "../../../website-ownership";
import type { RetryAboutFromContext } from "../../retry/retryAbout";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";
import { findHeroData } from "./hero.selector";

export const ABOUT_CONTEXT_KEYS = [
  "business",
  "branding",
  "hero",
  "planner",
] as const;

export type AboutContext = {
  business: Business;
  branding: Branding;
  /** Hero section output (null before hero step). */
  hero: Hero | null;
  planner: WebsitePlan | undefined;
};

/** About-only slice — reads hero section only, never FAQ / footer / SEO. */
export function selectAbout(
  ctx: PipelineContext,
  shared?: SharedContext,
): AboutContext {
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    business: core.business,
    branding: core.branding,
    hero: findHeroData(ctx),
    planner: core.planner,
  };
}

export function applyAboutResult(
  ctx: PipelineContext,
  result: RetryAboutFromContext,
): PipelineContext {
  return {
    ...ctx,
    website: applyAboutDataPatch(ctx.website, result.about),
    meta: {
      ...ctx.meta,
      aboutResult: result.aboutResult,
    },
  };
}
