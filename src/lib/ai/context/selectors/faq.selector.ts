/**
 * FAQ section context — isolated view + ownership write-back.
 *
 * FAQ sees ONLY:
 *   { business, services, location, branding }
 *
 * No FAQ items, hero, footer, SEO, or other website sections.
 */

import type { Branding, Business } from "../../../website";
import { applyFaqDataPatch } from "../../../website-ownership";
import type { RetryFAQFromContext } from "../../retry/retryFAQ";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";

export const FAQ_CONTEXT_KEYS = [
  "business",
  "services",
  "location",
  "branding",
] as const;

export type FAQContext = {
  business: Business;
  /** Service names from business (updated after Services step). */
  services: string[];
  location: string;
  branding: Branding;
};

function locationFrom(ctx: PipelineContext): string {
  return (
    ctx.business.location?.trim() ||
    ctx.meta.input.location?.trim() ||
    ctx.meta.brief?.city?.trim() ||
    ""
  );
}

/** FAQ-only slice — never reads FAQ / footer / SEO sections. */
export function selectFAQ(
  ctx: PipelineContext,
  shared?: SharedContext,
): FAQContext {
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    business: core.business,
    services: [...core.business.services],
    location: locationFrom(ctx),
    branding: core.branding,
  };
}

export function applyFAQResult(
  ctx: PipelineContext,
  result: RetryFAQFromContext,
): PipelineContext {
  return {
    ...ctx,
    website: applyFaqDataPatch(ctx.website, { items: result.faq }),
    meta: {
      ...ctx.meta,
      content: ctx.meta.content
        ? {
            ...ctx.meta.content,
            faq: result.draftItems,
          }
        : ctx.meta.content,
    },
  };
}
