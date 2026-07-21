import type { BusinessDna } from "../business-dna";
import type { BusinessFormInput } from "../business-form";
import type { CompetitorIntelligence } from "../competitor-intelligence";
import type { UxPlan } from "../ux-plan";
import type { DesignSystem } from "../design-system";
import type {
  GeneratedSite,
  SiteImages,
  SiteLayoutSection,
  SiteTheme,
  WebsiteContent,
} from "../site-types";
import type { WebsiteJson as CanonicalWebsiteJson } from "../website-json";

/** Crestis AI Engine V2 — OpenAI builds DATA, Crestis builds the SITE */

export type EngineAvoidCopy = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  aboutText?: string;
  /** aliases for new hero fields */
  headline?: string;
  subheadline?: string;
  primaryCTA?: string;
};

export type EngineRunOptions = {
  userEmail?: string | null;
  regenerate?: boolean;
  previous?: EngineAvoidCopy;
  /** Stable-ish id for image/theme variation */
  runId?: string;
  /**
   * When true (default), generate labeled DEMO example reviews for preview.
   * Live sites must not present these as real — renderer hides demo:true.
   */
  demoTestimonials?: boolean;
  /** Real customer reviews from the business (never AI-invented) */
  customerTestimonials?: { name: string; text: string }[];
  /** Prior SEO Memory for this site (regenerate / iterate) */
  seoMemory?: import("../seo-memory").SeoMemory;
};

/**
 * Layer 1 output + derived fields for downstream stages.
 * `dna` is the site brain — copy agents must not invent strategy outside it.
 */
export type BusinessBrief = {
  /** Business DNA — Layer 1 brain */
  dna: BusinessDna;
  /** Brand Personality Engine v1 — voice law for all copy agents */
  personality?: import("../brand-personality").BrandPersonality;
  /** Industry Knowledge Pack id */
  industryId?: import("../industries").IndustryId;
  /** SEO Planner v1 — strategy before content; Final SEO Review uses it */
  seoPlan?: import("./seo-planner").SeoPlan;
  /** Service Prioritizer — hierarchy before Services Generator */
  servicePriority?: {
    featured: string;
    secondary: string[];
    optional: string[];
    orderedTitles: string[];
  };
  niche: string;
  tradeHint: string;
  city: string;
  localeNote: string;
  tone: "bold" | "clean" | "professional" | "warm" | "premium";
  customerPains: string[];
  uniqueAngle: string;
  serviceFocus: string[];
  positioning?: string;
  idealCustomer?: string;
  offerPromise?: string;
};

/** Stage 2 — Website Planner (strategy + structure — never copy/HTML) */
export type WebsitePlan = {
  /**
   * Crestis Template Library id (e.g. construction-premium).
   * Locks design tokens + allowed sections.
   */
  template: string;
  /** Hero shell variant A | B | C */
  variant: "A" | "B" | "C";
  /**
   * Legacy Style Library bucket derived from template (copy voice compat).
   * @deprecated Prefer template + templateCopyBrief
   */
  style:
    | "Luxury"
    | "Modern"
    | "Corporate"
    | "Friendly"
    | "Minimal"
    | "Construction"
    | "Medical";
  /** Landing | Business | Large */
  pageType: string;
  /** e.g. Premium, Bold, Warm */
  tone: string;
  /** e.g. Lead Generation, Bookings */
  goal: string;
  targetAudience: string;
  positioning: string;
  trustSignals: string[];
  ctaStrategy: string;
  /** Palette direction — locked from template visual */
  colorDirection: string;
  /** Ordered page skeleton */
  sections: SiteLayoutSection[];
  /** Sticky primary CTA on mobile */
  stickyCTA: boolean;
  /** Floating call button when phone intent is high */
  floatingPhone: boolean;
  recommendedBlocks: string[];
  removedBlocks: string[];
  notes: string[];
  /** Downstream content guidance (derived, not page copy) */
  heroApproach: string;
  aboutFocus: string;
  serviceCount: number;
  faqThemes: string[];
  ctaStyle: string;
  testimonialAngle: string;
};

/** Stage 3 — Content Generator (copy only, no SEO) */
export type ContentDraft = {
  hero: WebsiteContent["hero"];
  about: WebsiteContent["about"];
  services: WebsiteContent["services"];
  testimonials: WebsiteContent["testimonials"];
  faq: WebsiteContent["faq"];
  /** Final CTA band (independent section) */
  cta: {
    headline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  contact: WebsiteContent["contact"];
};

/** Layer 6 — SEO AI package flattened into Website JSON seo block */
export type SeoDraft = WebsiteContent["seo"];

/** Layer 5 — Visual AI (visual config JSON — never HTML) */
export type DesignPlan = {
  tradeKey: string;
  theme: SiteTheme;
  images: SiteImages;
  /** { theme, palette, font, radius, spacing, imageStyle, sectionStyle } */
  design: DesignSystem;
  /** Section order from UX Planner (Visual AI does not own this) */
  sectionOrder?: SiteLayoutSection[];
};

/** Stage 6 — Quality Reviewer */
export type QualityReview = {
  score: number;
  passed: boolean;
  notes: string[];
  patches: Partial<{
    hero: Partial<ContentDraft["hero"]>;
    about: Partial<ContentDraft["about"]>;
    seo: Partial<SeoDraft>;
  }>;
};

/** Final Website JSON contract — stored in Supabase, rendered by Next.js */
export type WebsiteJson = CanonicalWebsiteJson;

export type EngineContext = {
  input: BusinessFormInput;
  options: EngineRunOptions;
  runId: string;
  brief?: BusinessBrief;
  competitors?: CompetitorIntelligence;
  ux?: UxPlan;
  plan?: WebsitePlan;
  content?: ContentDraft;
  seo?: SeoDraft;
  design?: DesignPlan;
  review?: QualityReview;
  websiteJson?: WebsiteJson;
};

export type EngineStageName =
  | "business_analyzer"
  | "competitor_intelligence"
  | "ux_planner"
  | "website_planner"
  | "layout_selector_ai"
  | "template_selector"
  | "template_selector_ai"
  | "brand_personality"
  | "seo_planner"
  | "hero_headlines"
  | "hero_select"
  | "hero_refine"
  | "hero_retry"
  | "about_variants"
  | "about_select"
  | "about_retry"
  | "service_prioritizer"
  | "services_generator"
  | "services_retry"
  | "faq_generator"
  | "faq_retry"
  | "content_generator"
  | "theme_selector"
  | "theme_selector_ai"
  | "copywriting_engine"
  | "seo_generator"
  | "seo_ai"
  | "seo_retry"
  | "design_planner"
  | "visual_ai"
  | "cro_ai"
  | "content_review"
  | "content_review_healing"
  | "quality_reviewer"
  | "ai_quality_scorer"
  | "qa_ai"
  | "regenerate_sections"
  | "human_detector"
  | "final_score"
  | "json_validator"
  | "assemble";

export type { CompetitorIntelligence, UxPlan };
