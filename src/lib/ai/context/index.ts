export {
  buildContext,
  buildHeroContext,
  buildAboutContext,
  buildServicesContext,
  buildFAQContext,
  buildSEOContext,
  buildQAContext,
  type BuiltContext,
} from "./builder";
export {
  createContextCache,
  ContextCache,
  type ContextCacheKey,
} from "./context-cache";
export { selectShared, type SharedContext } from "./shared";

export {
  selectHero,
  applyHeroResult,
  findHeroData,
  HERO_CONTEXT_KEYS,
  type HeroContext,
} from "./selectors/hero.selector";

export {
  selectAbout,
  applyAboutResult,
  ABOUT_CONTEXT_KEYS,
  type AboutContext,
} from "./selectors/about.selector";

export {
  selectServices,
  applyServicesResult,
  SERVICES_CONTEXT_KEYS,
  type ServicesContext,
} from "./selectors/services.selector";

export {
  selectFAQ,
  applyFAQResult,
  FAQ_CONTEXT_KEYS,
  type FAQContext,
} from "./selectors/faq.selector";

export {
  selectSEO,
  applySEOResult,
  SEO_CONTEXT_KEYS,
  type SEOContext,
} from "./selectors/seo.selector";

export {
  selectQA,
  assertQAReady,
  applyQATheme,
  applyQAResult,
  QA_CONTEXT_KEYS,
  type QAContext,
  type QAThemePatch,
} from "./selectors/qa.selector";

export {
  estimateTokens,
  estimateJsonTokens,
  formatTokenEstimate,
  logSectionTokenEstimate,
  type ContextTokenEstimates,
} from "./estimate-tokens";

export {
  prepareHeroRun,
  prepareAboutRun,
  prepareServicesRun,
  prepareFAQRun,
  prepareSEORun,
  prepareQARun,
  type HeroSectionRun,
  type AboutSectionRun,
  type ServicesSectionRun,
  type FAQSectionRun,
  type SEOSectionRun,
  type QASectionRun,
} from "./section-run";
