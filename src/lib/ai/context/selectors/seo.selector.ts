/**
 * SEO section context — isolated view + ownership write-back.
 *
 * SEO sees ONLY:
 *   { business, hero, about, services, faq, planner }
 *
 * No existing SEO block, footer, branding, or meta scratch.
 */

import type {
  About,
  Business,
  FAQ,
  Hero,
  Service,
} from "../../../website";
import type { WebsitePlan } from "../../../ai-engine/types";
import { applySeoPatch } from "../../../website-ownership";
import type { RetrySEOFromContext } from "../../retry/retrySEO";
import type { PipelineContext } from "../../orchestrator/context";
import type { SharedContext } from "../shared";
import { findHeroData } from "./hero.selector";

export const SEO_CONTEXT_KEYS = [
  "business",
  "hero",
  "about",
  "services",
  "faq",
  "planner",
] as const;

export type SEOContext = {
  business: Business;
  hero: Hero | null;
  about: About | null;
  services: Service[];
  faq: FAQ[];
  planner: WebsitePlan | undefined;
};

function homePage(ctx: PipelineContext) {
  return (
    ctx.website.pages.find((p) => p.id === "home" || p.slug === "/") ??
    ctx.website.pages[0]
  );
}

function findAboutData(ctx: PipelineContext): About | null {
  const section = homePage(ctx)?.sections.find((s) => s.type === "about");
  return section?.data ? (section.data as About) : null;
}

function findServicesItems(ctx: PipelineContext): Service[] {
  const section = homePage(ctx)?.sections.find((s) => s.type === "services");
  const data = section?.data as { items?: Service[] } | undefined;
  return data?.items ? [...data.items] : [];
}

function findFaqItems(ctx: PipelineContext): FAQ[] {
  const section = homePage(ctx)?.sections.find((s) => s.type === "faq");
  const data = section?.data as { items?: FAQ[] } | undefined;
  return data?.items ? [...data.items] : [];
}

/** SEO-only slice — reads content sections, never website.seo / footer / branding. */
export function selectSEO(
  ctx: PipelineContext,
  shared?: SharedContext,
): SEOContext {
  const core = shared ?? {
    business: ctx.business,
    planner: ctx.meta.plan,
    branding: ctx.branding,
  };
  return {
    business: core.business,
    hero: findHeroData(ctx),
    about: findAboutData(ctx),
    services: findServicesItems(ctx),
    faq: findFaqItems(ctx),
    planner: core.planner,
  };
}

export function applySEOResult(
  ctx: PipelineContext,
  result: RetrySEOFromContext,
): PipelineContext {
  return {
    ...ctx,
    website: applySeoPatch(ctx.website, result.seo),
    meta: {
      ...ctx.meta,
      seo: result.seoDraft,
    },
  };
}
