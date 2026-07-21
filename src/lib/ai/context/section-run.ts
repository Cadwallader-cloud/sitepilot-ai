/**
 * Section runs — orchestrator entry points through Context Manager only.
 *
 *   Business → Cache → build*Context → log tokens → retry/generate
 */

import type { PipelineContext } from "../orchestrator/context";
import { createContextCache, type ContextCache } from "./context-cache";
import { logSectionTokenEstimate } from "./estimate-tokens";
import type { AboutContext } from "./selectors/about.selector";
import type { FAQContext } from "./selectors/faq.selector";
import type { HeroContext } from "./selectors/hero.selector";
import type { QAContext } from "./selectors/qa.selector";
import type { SEOContext } from "./selectors/seo.selector";
import type { ServicesContext } from "./selectors/services.selector";

export type HeroSectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  hero: HeroContext;
};

export type AboutSectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  about: AboutContext;
};

export type ServicesSectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  services: ServicesContext;
};

export type FAQSectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  faq: FAQContext;
};

export type SEOSectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  seo: SEOContext;
};

export type QASectionRun = {
  pipeline: PipelineContext;
  cache: ContextCache;
  qa: QAContext;
};

export function prepareHeroRun(ctx: PipelineContext): HeroSectionRun {
  const cache = createContextCache(ctx);
  const hero = cache.hero;
  logSectionTokenEstimate("Hero Context", hero);
  return { pipeline: ctx, cache, hero };
}

export function prepareAboutRun(ctx: PipelineContext): AboutSectionRun {
  const cache = createContextCache(ctx);
  const about = cache.about;
  logSectionTokenEstimate("About Context", about);
  return { pipeline: ctx, cache, about };
}

export function prepareServicesRun(ctx: PipelineContext): ServicesSectionRun {
  const cache = createContextCache(ctx);
  const services = cache.services;
  logSectionTokenEstimate("Services Context", services);
  return { pipeline: ctx, cache, services };
}

export function prepareFAQRun(ctx: PipelineContext): FAQSectionRun {
  const cache = createContextCache(ctx);
  const faq = cache.faq;
  logSectionTokenEstimate("FAQ Context", faq);
  return { pipeline: ctx, cache, faq };
}

export function prepareSEORun(ctx: PipelineContext): SEOSectionRun {
  const cache = createContextCache(ctx);
  const seo = cache.seo;
  logSectionTokenEstimate("SEO Context", seo);
  return { pipeline: ctx, cache, seo };
}

export function prepareQARun(ctx: PipelineContext): QASectionRun {
  const cache = createContextCache(ctx);
  const qa = cache.qa;
  logSectionTokenEstimate("QA Context", qa);
  return { pipeline: ctx, cache, qa };
}
