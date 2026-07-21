import type { DesignSystem } from "./design-system";

export type SiteTheme = {
  primary: string;
  accent: string;
  style: "bold" | "clean" | "professional";
};

export type { DesignSystem };

export type SiteImages = {
  hero: string;
  gallery: string[];
};

/** Services list item — Website JSON only */
export type ServiceItem = {
  title: string;
  /** Short service description (≤35 words) */
  description: string;
  /** Exactly 3 outcome benefit lines */
  benefits?: string[];
  /** Lucide-style icon name (Crestis renders — never AI SVG) */
  icon?: string;
  /** One primary / most profitable offer */
  featured?: boolean;
  /**
   * Service Prioritizer hierarchy:
   * featured = hero service block
   * secondary = standard cards
   * optional = compact list
   */
  priority?: "featured" | "secondary" | "optional";
};

/** FAQ list item — Website JSON only */
export type FaqItem = {
  question: string;
  answer: string;
  /** Pricing | Timeline | Trust | Process | Location | Service */
  category?: string;
};

/** Layer 6 — JSON-LD LocalBusiness fields (Crestis-validated, no fake ratings) */
export type SeoSchemaBlock = {
  "@type":
    | "LocalBusiness"
    | "HomeAndConstructionBusiness"
    | "ProfessionalService"
    | "MedicalBusiness"
    | "FoodEstablishment"
    | "LegalService"
    | "Electrician"
    | "Plumber"
    | "RoofingContractor"
    | "GeneralContractor"
    | "Dentist"
    | "Attorney"
    | "Restaurant"
    | "Organization";
  name: string;
  description: string;
  telephone?: string;
  email?: string;
  areaServed?: string;
  priceRange?: string;
  address?: {
    "@type"?: "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
};

/** Layer 6 — in-page anchors for Google + UX */
export type SeoInternalLink = {
  anchor: string;
  href: string;
};

/** SEO block — Website JSON only (SEO Generator v1) */
export type SeoBlock = {
  title: string;
  description: string;
  keywords: string[];
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** One natural local SEO phrase, e.g. "dentist in Austin" */
  localSeoPhrase?: string;
  /** Homepage slug (usually "/") */
  slug?: string;
  /** Canonical path (usually "/") */
  canonical?: string;
  /** Semantic entities for niche */
  entities?: string[];
  /** SEO Generator self-score 0–100 */
  seoScore?: number;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    imageSuggestion?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    imageSuggestion?: string;
  };
  imageSeo?: {
    filename?: string;
    alt?: string;
    caption?: string;
    title?: string;
  };
  /** schema.org LocalBusiness (no aggregateRating) */
  schema?: SeoSchemaBlock;
  /** In-page internal links (#services, #faq, …) */
  internalLinks?: SeoInternalLink[];
};

/** STRICT content schema — design-agnostic Website JSON */
export type WebsiteContent = {
  hero: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
    /** Hero Generator trust bar — only valid signals from input */
    trustBar?: string[];
  };
  about: {
    title: string;
    text: string;
    /** About Generator v1 paragraphs (joined into text for compat) */
    paragraphs?: string[];
    /** Exactly 3 trust/value highlights */
    highlights?: string[];
  };
  /** 3–6 service cards from Services Generator v1 */
  services: ServiceItem[];
  testimonials: {
    name: string;
    text: string;
    /** true = AI demo example; false = real customer review only */
    demo: boolean;
  }[];
  /** [{ "question": "", "answer": "" }] */
  faq: FaqItem[];
  /** Final CTA band JSON */
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
  /** SEO + Open Graph + local phrase */
  seo: SeoBlock;
};

/** Section plan from Website Planner — drives renderer order (JSON only) */
export type SiteLayoutSection = {
  id:
    | "hero"
    | "services"
    | "why_us"
    | "about"
    | "trust"
    | "projects"
    | "gallery"
    | "menu"
    | "testimonials"
    | "faq"
    | "cta"
    | "contact";
  label: string;
};

/** Renderer model = AI content + businessName + design assets */
export type GeneratedSite = WebsiteContent & {
  businessName: string;
  theme: SiteTheme;
  images: SiteImages;
  /** UX Planner sections + strategy meta */
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
  /**
   * Design Planner tokens:
   * Visual AI: theme, palette, font, radius, spacing, imageStyle, sectionStyle
   */
  design?: DesignSystem;
  /**
   * Quality Reviewer scores (0–100) + reasons for scores under 85
   */
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
  /** Layer 7 — CRO AI (Call / form / trust) */
  cro?: {
    willCall: number;
    willSubmitForm: number;
    trustEnough: number;
    overallConversion: number;
    blockers: string[];
    patched: string[];
    verdict: string;
  };
  /** Layer 8 — QA AI */
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
  /** Layer 10 — Final Score */
  scores?: {
    quality: number;
    seo: number;
    conversion: number;
    trust: number;
    design: number;
    humanScore: number;
  };
  /** Per-site SEO Memory — used keywords/entities/locations/headlines/CTAs */
  seoMemory?: import("./seo-memory").SeoMemory;
  /** Canonical Website Schema v2 (preferred for persistence) */
  website?: import("./website").Website;
};

export type GenerateSource = "ai";

export type GenerateResult = {
  site: GeneratedSite;
  source: GenerateSource;
  /** Supabase project id when save succeeds */
  projectId?: string;
};

export function getBusinessName(site: GeneratedSite): string {
  return (
    site.businessName ||
    site.seo.title ||
    getHero(site).headline ||
    "Your Business"
  );
}

type LegacyHero = {
  headline?: string;
  subheadline?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  trustBar?: string[];
};

/** Normalize hero — supports new + legacy title/subtitle/cta fields */
export function getHero(site: { hero: LegacyHero; contact?: { phone?: string } }) {
  const h = site.hero ?? {};
  const headline = (h.headline || h.title || "").trim();
  const subheadline = (h.subheadline || h.subtitle || "").trim();
  const primaryCTA = (h.primaryCTA || h.cta || "").trim();
  const secondaryCTA = (
    h.secondaryCTA ||
    (site.contact?.phone ? `Call ${site.contact.phone}` : "") ||
    ""
  ).trim();
  const trustBar = Array.isArray(h.trustBar)
    ? h.trustBar.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 5)
    : [];
  return { headline, subheadline, primaryCTA, secondaryCTA, trustBar };
}
