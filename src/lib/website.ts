/**
 * Crestis Website Schema v2 — canonical multi-page JSON.
 *
 * Stored in Supabase `projects.site` (alongside legacy flat WebsiteJson).
 * Never HTML. Never React. Only JSON.
 *
 * AI write ownership (see `website-ownership.ts`):
 *   Business Analyzer → business
 *   Brand Personality → branding
 *   Website Planner   → pages
 *   Hero / About / Services / FAQ Generators → section.data
 *   SEO Generator     → seo
 *   Theme Engine      → theme
 * Crestis owns: metadata, navigation, settings, crestis
 */

import type { BrandPersonality } from "./brand-personality";
import type { BusinessDna } from "./business-dna";
import type { CompetitorIntelligence } from "./competitor-intelligence";
import {
  colorsForPalette,
  normalizeDesignSystem,
} from "./design-system";
import {
  emptySeoMemory,
  normalizeSeoMemory,
  type SeoMemory,
} from "./seo-memory";
import type {
  FaqItem,
  GeneratedSite,
  SeoBlock,
  ServiceItem,
  SiteImages,
  SiteLayoutSection,
} from "./site-types";
import type { WebsiteJson, WebsiteProject } from "./website-json";
import { isWebsiteJson, toGeneratedSite, toWebsiteJson } from "./website-json";
import type { GenerationUsage } from "./usage";
import {
  isThemePresetId,
  resolveThemePresetOrNull,
  themeBuildMeta,
} from "@/theme";
import {
  DEFAULT_TEMPLATE_BLOCKS,
  normalizeTemplateBlocks,
  type TemplateBlocks,
} from "./template-engine";

// ── Top level ────────────────────────────────────────────────────────

export interface Website {
  metadata: Metadata;
  business: Business;
  branding: Branding;
  navigation: Navigation;
  pages: Page[];
  seo: SEO;
  theme: WebsiteTheme;
  settings: Settings;
  /** Crestis engine bridge (images, layout, SEO memory, diagnostics) */
  crestis?: CrestisRuntime;
}

// ── Metadata ─────────────────────────────────────────────────────────

export interface Metadata {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  language: string;
  status: "draft" | "published";
}

function newWebsiteId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeMetadata(
  raw: unknown,
  opts?: {
    id?: string;
    projectId?: string;
    version?: number;
    language?: string;
    status?: Metadata["status"];
    /** Preserve createdAt when refreshing */
    createdAt?: string;
  },
): Metadata {
  const now = new Date().toISOString();
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const legacyLocale =
    typeof row.locale === "string" ? row.locale : undefined;
  const legacyRunId =
    typeof row.runId === "string" ? row.runId : undefined;

  const statusRaw = String(row.status ?? opts?.status ?? "draft");
  const status: Metadata["status"] =
    statusRaw === "published" ? "published" : "draft";

  const versionNum = Number(row.version ?? opts?.version ?? 1);

  return {
    id:
      (typeof row.id === "string" && row.id.trim()) ||
      opts?.id ||
      legacyRunId ||
      newWebsiteId(),
    projectId:
      (typeof row.projectId === "string" && row.projectId.trim()) ||
      opts?.projectId ||
      "",
    createdAt:
      (typeof row.createdAt === "string" && row.createdAt) ||
      opts?.createdAt ||
      now,
    updatedAt: now,
    version:
      Number.isFinite(versionNum) && versionNum >= 1
        ? Math.floor(versionNum)
        : 1,
    language:
      (typeof row.language === "string" && row.language.trim()) ||
      opts?.language ||
      legacyLocale ||
      "en",
    status,
  };
}

/** Stamp project linkage / publish status onto Website.metadata */
export function stampWebsiteMetadata(
  site: Website,
  patch: {
    projectId?: string;
    status?: Metadata["status"];
    bumpVersion?: boolean;
    language?: string;
  } = {},
): Website {
  const prev = normalizeMetadata(site.metadata);
  return {
    ...site,
    metadata: normalizeMetadata(prev, {
      id: prev.id,
      projectId: patch.projectId ?? prev.projectId,
      createdAt: prev.createdAt,
      language: patch.language ?? prev.language,
      status: patch.status ?? prev.status,
      version: patch.bumpVersion ? prev.version + 1 : prev.version,
    }),
  };
}

// ── Business ─────────────────────────────────────────────────────────

export interface Business {
  name: string;
  category: string;
  subcategory: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  description: string;
  services: string[];
  /** Crestis Layer 1 — site brain (not public Business fields) */
  dna?: BusinessDna;
  /** Brand Personality Engine profile */
  personality?: BrandPersonality;
  /** Competitor Intelligence */
  competitors?: CompetitorIntelligence;
}

function parseServiceNames(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && "title" in item) {
          return String((item as { title?: string }).title ?? "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeService(raw: unknown, _index: number): Service {
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  // Empty title must stay empty — Zod / acceptance criteria reject it
  const title = String(row.title ?? "").trim();
  const description = String(row.description ?? "").trim();
  const benefitsRaw = Array.isArray(row.benefits)
    ? row.benefits
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const benefitDefaults = [
    "Clear pricing",
    "Reliable work",
    "Local support",
  ];
  const benefits = [...benefitsRaw];
  while (benefits.length < 3) {
    benefits.push(benefitDefaults[benefits.length] || "Quality service");
  }

  const icon = String(row.icon ?? "").trim() || "wrench";
  const featured =
    row.featured === true || row.priority === "featured";
  const cta = String(row.cta ?? "").trim();

  return {
    title,
    description,
    benefits,
    icon,
    featured,
    ...(cta ? { cta } : {}),
  };
}

function normalizeServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return [];
  const items = raw.map((item, i) => normalizeService(item, i));
  let seenFeatured = false;
  const normalized = items.map((s) => {
    if (!s.featured) return s;
    if (seenFeatured) return { ...s, featured: false };
    seenFeatured = true;
    return s;
  });
  if (!seenFeatured && normalized.length > 0) {
    normalized[0] = { ...normalized[0], featured: true };
  }
  return normalized;
}

function servicesToFlatItems(services: Service[]): ServiceItem[] {
  return services.map((s) => ({
    title: s.title,
    description: s.description,
    benefits: s.benefits,
    icon: s.icon,
    featured: s.featured,
    ...(s.cta ? { cta: s.cta } : {}),
    priority: s.featured ? ("featured" as const) : ("secondary" as const),
  }));
}

function normalizeFaq(raw: unknown): FAQ | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const question = String(row.question ?? "").trim();
  const answer = String(row.answer ?? "").trim();
  if (!question || !answer) return null;
  return {
    question,
    answer,
    category: String(row.category ?? "").trim() || "General",
  };
}

function normalizeFaqs(raw: unknown): FAQ[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeFaq).filter((f): f is FAQ => Boolean(f));
}

function faqsToFlatItems(faqs: FAQ[]): FaqItem[] {
  return faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
    category: f.category,
  }));
}

function normalizeContact(raw: unknown, fallback?: {
  phone?: string;
  email?: string;
  address?: string;
}): Contact {
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const phone =
    String(row.phone ?? fallback?.phone ?? "").trim();
  const email =
    String(row.email ?? fallback?.email ?? "").trim();
  const address =
    String(row.address ?? fallback?.address ?? "").trim() || undefined;
  const hours = Array.isArray(row.hours)
    ? row.hours.map(String).map((s) => s.trim()).filter(Boolean)
    : undefined;
  const map =
    String(row.map ?? "").trim() ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : undefined);

  return {
    phone,
    email,
    address,
    hours: hours?.length ? hours : undefined,
    map,
    form: row.form === false ? false : true,
  };
}

// ── Branding ─────────────────────────────────────────────────────────

export type BrandingStyle = "modern" | "premium" | "minimal" | "classic";

export interface Branding {
  tone: string;
  personality: string[];
  colors: string[];
  fonts: string[];
  logo?: string;
  style: BrandingStyle;
}

function uniqueStrings(values: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const s = String(raw ?? "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function mapBrandingStyle(params: {
  siteStyle?: string;
  designTheme?: string;
  planStyle?: string;
}): BrandingStyle {
  const blob = [params.designTheme, params.siteStyle, params.planStyle]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\b(premium|luxury|bold)\b/.test(blob)) return "premium";
  if (/\b(minimal|clean|clinical)\b/.test(blob)) return "minimal";
  if (/\b(classic|professional|traditional)\b/.test(blob)) return "classic";
  if (/\bmodern\b/.test(blob)) return "modern";
  if (params.siteStyle === "bold") return "premium";
  if (params.siteStyle === "clean") return "minimal";
  if (params.siteStyle === "professional") return "classic";
  return "modern";
}

function brandingFromFlat(flat: WebsiteJson): Branding {
  const profile = flat.business.personality;
  const design = normalizeDesignSystem(flat.theme);
  const palette = colorsForPalette(design.palette);

  const tone =
    profile
      ? `${profile.voice}, ${profile.energy.toLowerCase()} energy`
      : flat.layout?.strategy?.tone?.trim() || "Professional and clear";

  const personality = uniqueStrings(
    profile
      ? [
          profile.archetype,
          profile.voice,
          profile.energy,
          profile.emotion,
          profile.writingStyle,
          ...profile.traits,
        ]
      : flat.business.dna?.brandPersonality ?? [],
  );

  return {
    tone,
    personality,
    colors: uniqueStrings([
      flat.theme.primary,
      flat.theme.accent,
      palette.primary,
      palette.accent,
    ]),
    fonts: uniqueStrings([design.font]),
    logo: undefined,
    style: mapBrandingStyle({
      siteStyle: flat.theme.style,
      designTheme: design.theme,
      planStyle: flat.layout?.strategy?.style,
    }),
  };
}

// ── Navigation ───────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
}

export interface Navigation {
  logo: string;
  links: NavItem[];
  cta: string;
}

function navFromFlat(flat: WebsiteJson): Navigation {
  const sections = flat.layout?.sections ?? [];
  const links: NavItem[] = sections
    .filter((s) => s.id !== "hero")
    .slice(0, 6)
    .map((s) => ({
      label: s.label || sectionLabel(s.id),
      href: `#${s.id}`,
    }));

  return {
    logo: flat.business.name.trim() || "Logo",
    links,
    cta:
      flat.hero.primaryCTA?.trim() ||
      flat.cta?.primaryCTA?.trim() ||
      "Get a quote",
  };
}

// ── Pages & sections ─────────────────────────────────────────────────

export type SectionType =
  | "hero"
  | "about"
  | "services"
  | "projects"
  | "gallery"
  | "faq"
  | "testimonials"
  | "cta"
  | "contact"
  | "trust";

export interface Hero {
  headline: string;
  subheadline: string;
  primaryCTA: string;
  secondaryCTA?: string;
  backgroundImage?: string;
  trustBar: string[];
}

/** @deprecated Use Hero */
export type HeroSectionData = Hero;

export interface About {
  title: string;
  paragraphs: string[];
  highlights: string[];
}

/** @deprecated Use About */
export type AboutSectionData = About;

export interface Service {
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  featured: boolean;
  cta?: string;
}

export interface ServicesSectionData {
  items: Service[];
}

export interface ProjectsSectionData {
  items: WebsiteProject[];
}

export interface GallerySectionData {
  images: string[];
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface FaqSectionData {
  items: FAQ[];
}

export interface TestimonialsSectionData {
  items: { name: string; text: string; demo: boolean }[];
}

export interface CtaSectionData {
  headline: string;
  primaryCTA: string;
  secondaryCTA: string;
}

export interface Contact {
  phone: string;
  email: string;
  address?: string;
  hours?: string[];
  map?: string;
  form: boolean;
}

/** @deprecated Use Contact */
export type ContactSectionData = Contact;

export type SectionDataMap = {
  hero: Hero;
  about: About;
  services: ServicesSectionData;
  projects: ProjectsSectionData;
  gallery: GallerySectionData;
  faq: FaqSectionData;
  testimonials: TestimonialsSectionData;
  cta: CtaSectionData;
  contact: Contact;
  trust: { items: string[] };
};

export interface Section {
  id: string;
  type: string;
  enabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/** @deprecated Use Section */
export type PageSection = Section;

export interface Page {
  id: string;
  slug: string;
  title: string;
  sections: Section[];
}

// ── SEO ──────────────────────────────────────────────────────────────

/** Loose SEO object bags — typed without `any` */
export type SeoJsonObject = Record<string, unknown>;

export interface SEO {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  schema: SeoJsonObject | null;
  openGraph: SeoJsonObject | null;
  twitter: SeoJsonObject | null;
}

// ── Theme ────────────────────────────────────────────────────────────

/** Persisted theme reference — full tokens resolved via Theme Engine at render. */
export interface WebsiteTheme {
  id: string;
  /** React template block picks — Theme Engine only (no HTML). */
  blocks: TemplateBlocks;
}

function themeFromFlat(flat: WebsiteJson): WebsiteTheme {
  const layoutPreset = flat.layout?.strategy?.template?.trim();
  if (layoutPreset && isThemePresetId(layoutPreset)) {
    return {
      id: layoutPreset,
      blocks: DEFAULT_TEMPLATE_BLOCKS,
    };
  }

  return {
    id: "local-service-standard",
    blocks: DEFAULT_TEMPLATE_BLOCKS,
  };
}

// ── Settings ─────────────────────────────────────────────────────────

export interface Settings {
  analytics: boolean;
  cookies: boolean;
  liveChat: boolean;
  animations: boolean;
  lazyLoad: boolean;
}

/** Crestis-only runtime fields — not part of public Settings */
export type CrestisRuntime = {
  stickyCTA?: boolean;
  floatingPhone?: boolean;
  pageType?: string;
  template?: string;
  variant?: "A" | "B" | "C";
  style?: string;
  engine?: "simple" | "deep";
  images?: SiteImages;
  layout?: WebsiteJson["layout"];
  seoMemory?: SeoMemory;
  quality?: WebsiteJson["quality"];
  cro?: WebsiteJson["cro"];
  qa?: WebsiteJson["qa"];
  human?: WebsiteJson["human"];
  scores?: WebsiteJson["scores"];
  usage?: GenerationUsage;
  generationMode?: import("./ai/generation-mode").GenerationMode;
  telemetry?: import("./ai/telemetry/stage-telemetry").StageTelemetryRecord[];
};

function settingsFromFlat(flat: WebsiteJson): Settings {
  const animation = normalizeDesignSystem(flat.theme).animation;
  return {
    analytics: true,
    cookies: true,
    liveChat: false,
    animations: animation !== "None",
    lazyLoad: true,
  };
}

function crestisFromFlat(
  flat: WebsiteJson,
  opts?: { engine?: "simple" | "deep" },
): CrestisRuntime {
  return {
    stickyCTA: flat.layout?.strategy?.stickyCTA,
    floatingPhone: flat.layout?.strategy?.floatingPhone,
    pageType: flat.layout?.strategy?.pageType,
    template: flat.layout?.strategy?.template,
    variant: flat.layout?.strategy?.variant,
    style: flat.layout?.strategy?.style,
    engine: opts?.engine ?? "simple",
    images: flat.theme.images,
    layout: flat.layout,
    seoMemory: flat.seoMemory
      ? normalizeSeoMemory(flat.seoMemory)
      : emptySeoMemory(),
    quality: flat.quality,
    cro: flat.cro,
    qa: flat.qa,
    human: flat.human,
    scores: flat.scores,
  };
}

// ── Type guards ──────────────────────────────────────────────────────

export function isWebsite(value: unknown): value is Website {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    v.business == null ||
    typeof v.business !== "object" ||
    !Array.isArray(v.pages) ||
    v.seo == null ||
    typeof v.seo !== "object" ||
    v.theme == null ||
    typeof v.theme !== "object" ||
    v.metadata == null ||
    typeof v.metadata !== "object"
  ) {
    return false;
  }
  const meta = v.metadata as Record<string, unknown>;
  // v2 Metadata, or legacy { schemaVersion: 2 }
  return (
    typeof meta.id === "string" ||
    typeof meta.version === "number" ||
    meta.schemaVersion === 2
  );
}

// ── Flat ↔ Website ───────────────────────────────────────────────────

function sectionLabel(id: string): string {
  const map: Record<string, string> = {
    hero: "Home",
    about: "About",
    services: "Services",
    projects: "Projects",
    gallery: "Gallery",
    faq: "FAQ",
    testimonials: "Reviews",
    cta: "Get started",
    contact: "Contact",
    trust: "Why us",
  };
  return map[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function homepageSectionsFromFlat(flat: WebsiteJson): Section[] {
  const order =
    flat.layout?.sections?.map((s) => s.id) ??
    ([
      "hero",
      "services",
      "about",
      "projects",
      "testimonials",
      "faq",
      "cta",
      "contact",
    ] as const);

  const byType: Partial<Record<SectionType, Section>> = {
    hero: {
      id: "hero",
      type: "hero",
      enabled: true,
      data: {
        headline: flat.hero.headline,
        subheadline: flat.hero.subheadline,
        primaryCTA: flat.hero.primaryCTA,
        secondaryCTA: flat.hero.secondaryCTA || undefined,
        backgroundImage: flat.theme.images?.hero || undefined,
        trustBar: Array.isArray(flat.hero.trustBar)
          ? flat.hero.trustBar.map(String).filter(Boolean)
          : [],
      },
    },
    about: {
      id: "about",
      type: "about",
      enabled: true,
      data: {
        title: flat.about.title,
        paragraphs: (() => {
          let paragraphs: string[] = [];
          if (Array.isArray(flat.about.paragraphs) && flat.about.paragraphs.length) {
            paragraphs = flat.about.paragraphs
              .map(String)
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            const text = flat.about.text?.trim() || "";
            if (text) {
              paragraphs = text
                .split(/\n\n+/)
                .map((s) => s.trim())
                .filter(Boolean);
            }
          }
          while (paragraphs.length < 2) {
            paragraphs.push(
              paragraphs[0] ||
                "We deliver clear work and honest local service.",
            );
          }
          return paragraphs.slice(0, 3);
        })(),
        highlights: (() => {
          const highlights = Array.isArray(flat.about.highlights)
            ? flat.about.highlights
                .map(String)
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          const defaults = ["Local team", "Clear quotes", "Reliable service"];
          while (highlights.length < 3) {
            highlights.push(defaults[highlights.length] || "Trusted work");
          }
          return highlights.slice(0, 3);
        })(),
      },
    },
    services: {
      id: "services",
      type: "services",
      enabled: true,
      data: { items: normalizeServices(flat.services) },
    },
    projects: {
      id: "projects",
      type: "projects",
      enabled: flat.projects.length > 0,
      data: { items: flat.projects },
    },
    gallery: {
      id: "gallery",
      type: "gallery",
      enabled: (flat.theme.images?.gallery?.length ?? 0) > 0,
      data: { images: flat.theme.images?.gallery ?? [] },
    },
    faq: {
      id: "faq",
      type: "faq",
      enabled: flat.faq.length > 0,
      data: { items: normalizeFaqs(flat.faq) },
    },
    testimonials: {
      id: "testimonials",
      type: "testimonials",
      enabled: flat.testimonials.length > 0,
      data: { items: flat.testimonials },
    },
    cta: {
      id: "cta",
      type: "cta",
      enabled: Boolean(flat.cta),
      data: flat.cta ?? {
        headline: flat.hero.primaryCTA || "Get started",
        primaryCTA: flat.hero.primaryCTA || "Contact us",
        secondaryCTA: flat.hero.secondaryCTA || "",
      },
    },
    contact: {
      id: "contact",
      type: "contact",
      enabled: true,
      data: normalizeContact(flat.contact, {
        phone: flat.contact.phone,
        email: flat.contact.email,
        address: flat.contact.address || flat.business.location,
      }),
    },
  };

  const seen = new Set<string>();
  const sections: Section[] = [];
  for (const id of order) {
    const key = id as SectionType;
    const section = byType[key];
    if (!section || seen.has(key)) continue;
    seen.add(key);
    sections.push(section);
  }
  for (const [key, section] of Object.entries(byType) as [
    SectionType,
    Section | undefined,
  ][]) {
    if (!section || seen.has(key)) continue;
    sections.push(section);
  }
  return sections;
}

/** Legacy flat WebsiteJson → Website v2 */
export function websiteFromFlat(
  flat: WebsiteJson,
  opts?: {
    engine?: "simple" | "deep";
    id?: string;
    projectId?: string;
    version?: number;
    status?: Metadata["status"];
    language?: string;
  },
): Website {
  const asSeoJson = (value: unknown): SeoJsonObject | null => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    return { ...(value as SeoJsonObject) };
  };

  return {
    metadata: normalizeMetadata(null, {
      id: opts?.id,
      projectId: opts?.projectId,
      version: opts?.version ?? 1,
      status: opts?.status ?? "draft",
      language: opts?.language ?? "en",
    }),
    business: {
      name: flat.business.name,
      category: flat.business.category?.trim() || "Local Business",
      subcategory: (() => {
        const industry = flat.business.dna?.industry?.trim() || "";
        const cat = flat.business.category?.trim() || "";
        if (industry && industry.toLowerCase() !== cat.toLowerCase()) {
          return industry;
        }
        return "";
      })(),
      location: flat.business.location,
      phone: flat.contact.phone?.trim() || undefined,
      email: flat.contact.email?.trim() || undefined,
      website: undefined,
      description: flat.business.description?.trim() || "",
      services: parseServiceNames(flat.services),
      dna: flat.business.dna,
      personality: flat.business.personality,
      competitors: flat.business.competitors,
    },
    branding: brandingFromFlat(flat),
    navigation: navFromFlat(flat),
    pages: [
      {
        id: "home",
        slug: flat.seo.slug || "/",
        title: flat.seo.title || flat.business.name,
        sections: homepageSectionsFromFlat(flat),
      },
    ],
    seo: {
      title: flat.seo.title,
      description: flat.seo.description,
      keywords: flat.seo.keywords ?? [],
      canonical: flat.seo.canonical || flat.seo.slug || "/",
      schema: asSeoJson(flat.seo.schema),
      openGraph:
        asSeoJson(flat.seo.openGraph) ??
        ({
          title: flat.seo.ogTitle || flat.seo.title,
          description: flat.seo.ogDescription || flat.seo.description,
        } satisfies SeoJsonObject),
      twitter:
        asSeoJson(flat.seo.twitter) ??
        ({
          title: flat.seo.ogTitle || flat.seo.title,
          description: flat.seo.ogDescription || flat.seo.description,
        } satisfies SeoJsonObject),
    },
    theme: themeFromFlat(flat),
    settings: settingsFromFlat(flat),
    crestis: crestisFromFlat(flat, opts),
  };
}

function findSection<T extends SectionType>(
  page: Page,
  type: T,
): { id: string; type: T; enabled: boolean; data: SectionDataMap[T] } | undefined {
  const found = page.sections.find((s) => s.type === type && s.enabled !== false);
  if (!found) return undefined;
  return {
    id: found.id,
    type,
    enabled: found.enabled !== false,
    data: found.data as SectionDataMap[T],
  };
}

function homePage(site: Website): Page {
  return (
    site.pages.find((p) => p.id === "home" || p.slug === "/" || !p.slug) ??
    site.pages[0]
  );
}

/** Website v2 → legacy flat WebsiteJson (renderer / save compat) */
export function flatFromWebsite(site: Website): WebsiteJson {
  const home = homePage(site);
  const hero = findSection(home, "hero")?.data;
  const about = findSection(home, "about")?.data;
  const services = servicesToFlatItems(
    findSection(home, "services")?.data?.items ?? [],
  );
  const projects = findSection(home, "projects")?.data?.items ?? [];
  const faq = faqsToFlatItems(findSection(home, "faq")?.data?.items ?? []);
  const testimonials =
    findSection(home, "testimonials")?.data?.items ?? [];
  const cta = findSection(home, "cta")?.data;
  const contactSection = findSection(home, "contact")?.data;
  const contactNormalized = normalizeContact(contactSection, {
    phone: site.business.phone,
    email: site.business.email,
    address: site.business.location,
  });
  const contact = {
    phone: contactNormalized.phone,
    email: contactNormalized.email,
    address: contactNormalized.address || site.business.location || "",
  };

  const seoBlock: SeoBlock = {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords,
    ogTitle:
      (typeof site.seo.openGraph?.title === "string"
        ? site.seo.openGraph.title
        : "") ||
      (typeof site.seo.twitter?.title === "string"
        ? site.seo.twitter.title
        : "") ||
      site.seo.title,
    ogDescription:
      (typeof site.seo.openGraph?.description === "string"
        ? site.seo.openGraph.description
        : "") ||
      (typeof site.seo.twitter?.description === "string"
        ? site.seo.twitter.description
        : "") ||
      site.seo.description,
    slug: site.seo.canonical || home.slug || "/",
    canonical: site.seo.canonical || home.slug || "/",
    schema: (site.seo.schema ?? undefined) as SeoBlock["schema"],
    openGraph: (site.seo.openGraph ?? undefined) as SeoBlock["openGraph"],
    twitter: (site.seo.twitter ?? undefined) as SeoBlock["twitter"],
  };

  const heroData: WebsiteJson["hero"] = hero
    ? {
        headline: hero.headline,
        subheadline: hero.subheadline,
        primaryCTA: hero.primaryCTA,
        secondaryCTA: hero.secondaryCTA || "",
        trustBar: Array.isArray(hero.trustBar) ? hero.trustBar : [],
      }
    : {
        headline: site.business.name,
        subheadline: "",
        primaryCTA: "Contact us",
        secondaryCTA: "",
        trustBar: [],
      };

  const crestis = site.crestis ?? {};
  const images = {
    hero:
      (typeof hero?.backgroundImage === "string" && hero.backgroundImage) ||
      crestis.images?.hero ||
      "",
    gallery: crestis.images?.gallery ?? [],
  };

  const layoutSections: SiteLayoutSection[] =
    crestis.layout?.sections ??
    home.sections
      .filter((s) => s.enabled)
      .map((s) => ({
        id: s.id,
        label: sectionLabel(s.id),
      }))
      .filter((s): s is SiteLayoutSection =>
        (
          [
            "hero",
            "services",
            "why_us",
            "about",
            "trust",
            "projects",
            "gallery",
            "menu",
            "testimonials",
            "faq",
            "cta",
            "contact",
          ] as const
        ).includes(s.id as SiteLayoutSection["id"]),
      );

  const siteStyle =
    site.branding.style === "premium"
      ? "bold"
      : site.branding.style === "minimal"
        ? "clean"
        : site.branding.style === "classic"
          ? "professional"
          : "clean";

  const resolved = resolveThemePresetOrNull(site.theme.id);
  const meta = resolved ? themeBuildMeta(resolved) : undefined;
  const design = meta
    ? meta.design
    : normalizeDesignSystem({
        theme: "Modern Premium",
        palette: "Dark Blue",
        font: (site.branding.fonts[0] || "Geist") as never,
        borderRadius: "Medium",
        spacing: "Medium",
      });

  return {
    business: {
      name: site.business.name,
      location: site.business.location,
      category: site.business.category,
      subcategory: site.business.subcategory || undefined,
      description: site.business.description,
      dna: site.business.dna,
      personality: site.business.personality,
      competitors: site.business.competitors,
    },
    theme: {
      primary: resolved?.palette.primary ?? site.branding.colors[0] ?? "#0f172a",
      accent: resolved?.palette.accent ?? site.branding.colors[1] ?? "#2563eb",
      style: siteStyle,
      ...design,
      images,
    },
    seo: seoBlock,
    hero: heroData,
    about: about
      ? {
          title: about.title,
          text: about.paragraphs.join("\n\n"),
          paragraphs: about.paragraphs,
          highlights: about.highlights,
        }
      : {
          title: `About ${site.business.name}`,
          text: site.business.description || "",
          paragraphs: site.business.description
            ? [site.business.description]
            : [],
          highlights: [],
        },
    services,
    projects,
    faq,
    testimonials,
    cta,
    contact,
    seoMemory: crestis.seoMemory
      ? normalizeSeoMemory(crestis.seoMemory)
      : undefined,
    layout: crestis.layout ?? {
      sections: layoutSections,
      strategy: {
        style: crestis.style,
        template: crestis.template,
        variant: crestis.variant,
        tone: "",
        goal: "",
        targetAudience: "",
        positioning: "",
        trustSignals: [],
        ctaStrategy: "",
        colorDirection: "",
        pageType: crestis.pageType,
        stickyCTA: crestis.stickyCTA,
        floatingPhone: crestis.floatingPhone,
      },
    },
    quality: crestis.quality,
    cro: crestis.cro,
    qa: crestis.qa,
    human: crestis.human,
    scores: crestis.scores,
    usage: crestis.usage,
  };
}

/** Normalize anything from Supabase → Website v2 */
export function ensureWebsite(
  raw: unknown,
  fallbackLocation = "",
  opts?: {
    engine?: "simple" | "deep";
    id?: string;
    projectId?: string;
    version?: number;
    status?: Metadata["status"];
    language?: string;
    bumpVersion?: boolean;
  },
): Website {
  if (isWebsite(raw)) {
    const meta = normalizeMetadata(raw.metadata, {
      id: opts?.id,
      projectId: opts?.projectId,
      version: opts?.version,
      status: opts?.status,
      language: opts?.language,
      createdAt: raw.metadata?.createdAt,
    });
    const legacySettings = raw.settings as Settings & Partial<CrestisRuntime>;
    const priorCrestis = raw.crestis ?? {};
    return {
      ...raw,
      seo: {
        title: String(raw.seo?.title ?? ""),
        description: String(raw.seo?.description ?? ""),
        keywords: Array.isArray(raw.seo?.keywords) ? raw.seo.keywords : [],
        canonical: String(raw.seo?.canonical ?? "/"),
        schema:
          raw.seo?.schema &&
          typeof raw.seo.schema === "object" &&
          !Array.isArray(raw.seo.schema)
            ? { ...(raw.seo.schema as SeoJsonObject) }
            : null,
        openGraph:
          raw.seo?.openGraph &&
          typeof raw.seo.openGraph === "object" &&
          !Array.isArray(raw.seo.openGraph)
            ? { ...(raw.seo.openGraph as SeoJsonObject) }
            : null,
        twitter:
          raw.seo?.twitter &&
          typeof raw.seo.twitter === "object" &&
          !Array.isArray(raw.seo.twitter)
            ? { ...(raw.seo.twitter as SeoJsonObject) }
            : null,
      },
      settings: {
        analytics: raw.settings?.analytics !== false,
        cookies: raw.settings?.cookies !== false,
        liveChat: raw.settings?.liveChat === true,
        animations: raw.settings?.animations !== false,
        lazyLoad: raw.settings?.lazyLoad !== false,
      },
      metadata: opts?.bumpVersion
        ? normalizeMetadata(meta, {
            id: meta.id,
            projectId: meta.projectId,
            createdAt: meta.createdAt,
            language: meta.language,
            status: meta.status,
            version: meta.version + 1,
          })
        : meta,
      crestis: {
        ...priorCrestis,
        stickyCTA: priorCrestis.stickyCTA ?? legacySettings.stickyCTA,
        floatingPhone:
          priorCrestis.floatingPhone ?? legacySettings.floatingPhone,
        pageType: priorCrestis.pageType ?? legacySettings.pageType,
        template: priorCrestis.template ?? legacySettings.template,
        variant: priorCrestis.variant ?? legacySettings.variant,
        style: priorCrestis.style ?? legacySettings.style,
        images: priorCrestis.images ?? legacySettings.images,
        layout: priorCrestis.layout ?? legacySettings.layout,
        quality: priorCrestis.quality ?? legacySettings.quality,
        cro: priorCrestis.cro ?? legacySettings.cro,
        qa: priorCrestis.qa ?? legacySettings.qa,
        human: priorCrestis.human ?? legacySettings.human,
        scores: priorCrestis.scores ?? legacySettings.scores,
        engine:
          opts?.engine ?? priorCrestis.engine ?? legacySettings.engine,
        seoMemory: normalizeSeoMemory(
          priorCrestis.seoMemory ??
            legacySettings.seoMemory ??
            (raw.seo as { memory?: unknown })?.memory,
        ),
      },
    };
  }
  if (raw && typeof raw === "object") {
    const embedded = (raw as { website?: unknown }).website;
    if (isWebsite(embedded)) {
      return ensureWebsite(embedded, fallbackLocation, opts);
    }
  }
  if (isWebsiteJson(raw)) {
    return websiteFromFlat(raw, opts);
  }
  if (raw && typeof raw === "object") {
    const flat = toWebsiteJson(
      toGeneratedSite(raw as GeneratedSite),
      fallbackLocation,
    );
    return websiteFromFlat(flat, opts);
  }
  throw new Error("INVALID_WEBSITE");
}

/** Renderer model from Website v2 or legacy shapes */
export function websiteToGeneratedSite(
  raw: Website | WebsiteJson | GeneratedSite | Record<string, unknown>,
): GeneratedSite {
  if (isWebsite(raw)) {
    const flat = flatFromWebsite(raw);
    return {
      ...toGeneratedSite(flat),
      seoMemory: flat.seoMemory,
      website: raw,
    };
  }
  const site = toGeneratedSite(raw);
  if (site.website && isWebsite(site.website)) return site;
  return site;
}

/** Persist / wire JSON — single Website schema in and out */
export function serializeWebsite(site: Website): string {
  return JSON.stringify(site);
}

export function deserializeWebsite(raw: string | unknown): Website {
  const parsed =
    typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  return ensureWebsite(parsed);
}
