/**
 * Context Builder — typed section views over PipelineContext.
 *
 * Each builder returns a strictly typed context object for one agent.
 * Uses ContextCache so business / branding / planner are built once per bag.
 */

import type { PipelineContext } from "../orchestrator/context";
import {
  createContextCache,
  type ContextCache,
} from "./context-cache";
import { selectShared, type SharedContext } from "./shared";
import { selectAbout, type AboutContext } from "./selectors/about.selector";
import { selectFAQ, type FAQContext } from "./selectors/faq.selector";
import { selectHero, type HeroContext } from "./selectors/hero.selector";
import { selectQA, type QAContext } from "./selectors/qa.selector";
import { selectSEO, type SEOContext } from "./selectors/seo.selector";
import {
  selectServices,
  type ServicesContext,
} from "./selectors/services.selector";

export type BuiltContext = {
  ctx: PipelineContext;
  /** Memoized section views for this pipeline bag. */
  cache: ContextCache;
  /** Core bag shared by every section: business, planner, branding */
  shared: SharedContext;
  hero: HeroContext;
  about: AboutContext;
  services: ServicesContext;
  faq: FAQContext;
  seo: SEOContext;
  /** Lazy: QA only — full website (throws if prerequisites missing). */
  qa: () => QAContext;
};

export function buildHeroContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): HeroContext {
  return cache?.hero ?? selectHero(ctx);
}

export function buildAboutContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): AboutContext {
  return cache?.about ?? selectAbout(ctx);
}

export function buildServicesContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): ServicesContext {
  return cache?.services ?? selectServices(ctx);
}

export function buildFAQContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): FAQContext {
  return cache?.faq ?? selectFAQ(ctx);
}

export function buildSEOContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): SEOContext {
  return cache?.seo ?? selectSEO(ctx);
}

/** Full website view — only QA agent sees everything (throws if prerequisites missing). */
export function buildQAContext(
  ctx: PipelineContext,
  cache?: ContextCache,
): QAContext {
  return cache?.qa ?? selectQA(ctx);
}

/**
 * Build all section contexts for the current pipeline bag.
 * `qa` is a thunk so early steps can call `buildContext` without requiring SEO/content.
 */
export function buildContext(ctx: PipelineContext): BuiltContext {
  const cache = createContextCache(ctx);
  return {
    ctx,
    cache,
    shared: cache.shared,
    hero: cache.hero,
    about: cache.about,
    services: cache.services,
    faq: cache.faq,
    seo: cache.seo,
    qa: () => cache.qa,
  };
}
