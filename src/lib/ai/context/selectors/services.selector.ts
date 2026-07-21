/**
 * Services section context — isolated view + ownership write-back.
 *
 * Services sees ONLY:
 *   { business, planner, branding }
 *
 * No hero, FAQ, footer, SEO, or website section data.
 */

import type { Branding, Business } from "../../../website";
import type { WebsitePlan } from "../../../ai-engine/types";
import { applyServicesDataPatch } from "../../../website-ownership";
import type { RetryServicesFromContext } from "../../retry/retryServices";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";

export const SERVICES_CONTEXT_KEYS = [
  "business",
  "planner",
  "branding",
] as const;

export type ServicesContext = {
  business: Business;
  planner: WebsitePlan | undefined;
  branding: Branding;
};

/** Services-only slice — never reads FAQ / footer / SEO / sections. */
export function selectServices(
  ctx: PipelineContext,
  shared?: SharedContext,
): ServicesContext {
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    business: core.business,
    planner: core.planner,
    branding: core.branding,
  };
}

export function applyServicesResult(
  ctx: PipelineContext,
  result: RetryServicesFromContext,
): PipelineContext {
  let website = applyServicesDataPatch(ctx.website, {
    items: result.services,
  });

  website = {
    ...website,
    pages: website.pages.map((page) => {
      if (page.id !== "home" && page.slug !== "/") return page;
      return {
        ...page,
        sections: page.sections.map((section) => {
          if (section.type === "testimonials") {
            return {
              ...section,
              data: { items: result.content.testimonials },
            };
          }
          if (section.type === "cta") {
            return { ...section, data: result.content.cta };
          }
          if (section.type === "contact") {
            return {
              ...section,
              data: {
                phone: result.content.contact.phone,
                email: result.content.contact.email,
                address: result.content.contact.address,
                form: true,
              },
            };
          }
          return section;
        }),
      };
    }),
  };

  const business = {
    ...ctx.business,
    services: result.services.map((s) => s.title).filter(Boolean),
  };

  return {
    ...ctx,
    business,
    website: { ...website, business },
    meta: {
      ...ctx.meta,
      brief: result.brief,
      engineCtx: result.engineCtx,
      agentCtx: result.agentCtx,
      content: result.content,
    },
  };
}
