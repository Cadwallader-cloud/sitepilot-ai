/**
 * CRESTIS Website JSON — flat homepage model (legacy + renderer bridge).
 *
 * Prefer `Website` from `./website` (Schema v2) for storage.
 * Flat shape remains the assemble intermediate and GeneratedSite source.
 *
 * {
 *   "business": {},
 *   "theme": {},
 *   "seo": {},
 *   "hero": {},
 *   "about": {},
 *   "services": [],
 *   "projects": [],
 *   "faq": [],
 *   "testimonials": [],
 *   "contact": {}
 * }
 */

import type { BusinessDna } from "./business-dna";
import type { CompetitorIntelligence } from "./competitor-intelligence";
import type { DesignSystem } from "./design-system";
import type { UxPlan } from "./ux-plan";
import { normalizeDesignSystem } from "./design-system";
import type {
  FaqItem,
  GeneratedSite,
  SeoBlock,
  ServiceItem,
  SiteImages,
  SiteLayoutSection,
  SiteTheme,
} from "./site-types";

export type WebsiteBusiness = {
  name: string;
  location: string;
  category?: string;
  subcategory?: string;
  description?: string;
  /** Layer 1 Business DNA — brain of the site */
  dna?: BusinessDna;
  /** Brand Personality Engine v1 — shared voice law */
  personality?: import("./brand-personality").BrandPersonality;
  /** Layer 2 Competitor Intelligence */
  competitors?: CompetitorIntelligence;
};

export type WebsiteProject = {
  title: string;
  image: string;
  description?: string;
};

export type WebsiteThemeJson = SiteTheme &
  DesignSystem & {
    images: SiteImages;
  };

export type WebsiteJson = {
  business: WebsiteBusiness;
  theme: WebsiteThemeJson;
  seo: SeoBlock;
  hero: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
    trustBar?: string[];
  };
  about: {
    title: string;
    text: string;
    paragraphs?: string[];
    highlights?: string[];
  };
  services: ServiceItem[];
  projects: WebsiteProject[];
  faq: FaqItem[];
  testimonials: {
    name: string;
    text: string;
    demo: boolean;
  }[];
  /** Final CTA band */
  cta?: {
    headline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  /** Per-site SEO Memory — used keywords/entities/locations/headlines/CTAs */
  seoMemory?: import("./seo-memory").SeoMemory;
  /** UX Planner sections + Website Planner strategy */
  layout?: {
    sections: SiteLayoutSection[];
    ux?: {
      nicheKey: string;
      rationale: string[];
    };
    strategy?: {
      style?: string;
      template?: string;
      variant?: "A" | "B" | "C";
      tone: string;
      goal: string;
      targetAudience: string;
      positioning: string;
      trustSignals: string[];
      ctaStrategy: string;
      colorDirection: string;
      pageType?: string;
      stickyCTA?: boolean;
      floatingPhone?: boolean;
      recommendedBlocks?: string[];
      removedBlocks?: string[];
      notes?: string[];
    };
  };
  /** Quality Reviewer scores (optional meta) */
  quality?: {
    heroScore: number;
    headlineQuality?: number;
    seoScore: number;
    trustScore?: number;
    ctaScore: number;
    callToAction?: number;
    readability?: number;
    professionalAppearance?: number;
    overall: number;
    reasons?: { section: string; score: number; reason: string }[];
    issues: string[];
    regeneratedSections?: string[];
  };
  /** Layer 7 — CRO AI (conversion only — not beauty) */
  cro?: {
    willCall: number;
    willSubmitForm: number;
    trustEnough: number;
    overallConversion: number;
    blockers: string[];
    patched: string[];
    verdict: string;
  };
  /** Layer 8 — QA AI (dimensions + section scores + auto-rewrites) */
  qa?: {
    design: number;
    content: number;
    trust: number;
    seo: number;
    mobile: number;
    readability: number;
    conversion: number;
    overall: number;
    sections: {
      hero: number;
      about: number;
      services: number;
      faq: number;
      cta: number;
      seo: number;
    };
    reasons: { section: string; score: number; reason: string }[];
    issues: string[];
    rewritten: string[];
    passed: boolean;
  };
  /** Layer 9 — Human Detector */
  human?: {
    looksAiGenerated: "YES" | "NO";
    aiLikelihood: number;
    tells: string[];
    verdict: string;
    rewritten: string[];
    finalLooksAiGenerated: "YES" | "NO";
  };
  /** Layer 10 — Final Score card */
  scores?: {
    quality: number;
    seo: number;
    conversion: number;
    trust: number;
    design: number;
    humanScore: number;
  };
};

/** Detect nested Website JSON vs legacy flat GeneratedSite */
export function isWebsiteJson(value: unknown): value is WebsiteJson {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.business === "object" &&
    v.business !== null &&
    typeof (v.business as { name?: string }).name === "string" &&
    typeof v.hero === "object" &&
    typeof v.seo === "object" &&
    Array.isArray(v.services)
  );
}

/** Flat renderer model ← Website JSON (or legacy flat site) */
export function toGeneratedSite(
  raw: WebsiteJson | GeneratedSite | Record<string, unknown>,
): GeneratedSite {
  if (isWebsiteJson(raw)) {
    const design: DesignSystem = normalizeDesignSystem({
      theme: raw.theme.theme,
      palette: raw.theme.palette,
      font: raw.theme.font,
      spacing: raw.theme.spacing,
      borderRadius: raw.theme.borderRadius,
      animation: raw.theme.animation,
      imageStyle: raw.theme.imageStyle,
      sectionStyle: raw.theme.sectionStyle,
    });

    const images: SiteImages = raw.theme.images?.hero
      ? raw.theme.images
      : {
          hero: raw.projects[0]?.image || "",
          gallery: raw.projects.map((p) => p.image).filter(Boolean),
        };

    return {
      businessName: raw.business.name,
      hero: raw.hero,
      about: raw.about,
      services: raw.services,
      testimonials: raw.testimonials,
      faq: raw.faq,
      cta: raw.cta ?? {
        headline: raw.hero.primaryCTA || raw.hero.headline || "Get started",
        primaryCTA: raw.hero.primaryCTA || "Contact us",
        secondaryCTA: raw.hero.secondaryCTA || "",
      },
      contact: raw.contact,
      seo: raw.seo,
      theme: {
        primary: raw.theme.primary,
        accent: raw.theme.accent,
        style: raw.theme.style,
      },
      images,
      layout: raw.layout,
      design,
      quality: raw.quality,
      cro: raw.cro,
      qa: raw.qa,
      human: raw.human,
      scores: raw.scores,
      seoMemory: raw.seoMemory,
    };
  }

  // Legacy flat GeneratedSite
  const flat = raw as GeneratedSite;
  return {
    ...flat,
    businessName: flat.businessName || "Your Business",
    hero: flat.hero,
    about: flat.about,
    services: flat.services ?? [],
    testimonials: flat.testimonials ?? [],
    faq: flat.faq ?? [],
    cta: flat.cta ?? {
      headline: flat.hero?.primaryCTA || flat.hero?.headline || "Get started",
      primaryCTA: flat.hero?.primaryCTA || "Contact us",
      secondaryCTA: flat.hero?.secondaryCTA || "",
    },
    contact: flat.contact,
    seo: flat.seo,
    theme: flat.theme,
    images: flat.images,
    layout: flat.layout,
    design: flat.design,
    quality: flat.quality,
    cro: flat.cro,
    qa: flat.qa,
    human: flat.human,
    scores: flat.scores,
    seoMemory: flat.seoMemory,
  };
}

/** Website JSON ← flat GeneratedSite (for save / migrate) */
export function toWebsiteJson(site: GeneratedSite, location = ""): WebsiteJson {
  const design = normalizeDesignSystem(site.design);
  const projects: WebsiteProject[] = (site.images.gallery?.length
    ? site.images.gallery
    : [site.images.hero]
  )
    .filter(Boolean)
    .map((image, i) => ({
      title: `Project ${i + 1}`,
      image,
    }));

  return {
    business: {
      name: site.businessName,
      location: location || site.contact.address || "",
    },
    theme: {
      primary: site.theme.primary,
      accent: site.theme.accent,
      style: site.theme.style,
      ...design,
      images: site.images,
    },
    seo: site.seo,
    hero: site.hero,
    about: site.about,
    services: site.services,
    projects,
    faq: site.faq,
    testimonials: site.testimonials,
    cta: site.cta,
    contact: site.contact,
    seoMemory: site.seoMemory,
    layout: site.layout,
    quality: site.quality,
    cro: site.cro,
    qa: site.qa,
    human: site.human,
    scores: site.scores,
  };
}

/** Ensure anything loaded from Supabase becomes canonical Website JSON */
export function ensureWebsiteJson(
  raw: unknown,
  fallbackLocation = "",
): WebsiteJson {
  if (isWebsiteJson(raw)) return raw;
  if (raw && typeof raw === "object") {
    return toWebsiteJson(toGeneratedSite(raw as GeneratedSite), fallbackLocation);
  }
  throw new Error("INVALID_WEBSITE_JSON");
}
