/**
 * Shared pipeline context for Crestis orchestrator steps.
 *
 * Schema v2 ownership surface:
 *   business / branding / website / logs
 * Engine scratch lives in meta (not stored Website JSON).
 */

import {
  dnaToDesignTone,
  type BusinessDna,
} from "../../business-dna";
import type { BrandPersonality } from "../../brand-personality";
import type { BusinessFormInput } from "../../business-form";
import {
  faqThemesFromPack,
  type IndustryId,
  type IndustryPack,
} from "../../industries";
import {
  getTemplate,
  resolveTemplateId,
  resolveVariant,
  sectionsFromTemplateLabels,
  type TemplateId,
} from "../../template-library";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  EngineRunOptions,
  EngineStageName,
  SeoDraft,
  WebsitePlan,
} from "../../ai-engine/types";
import type { SeoPlan } from "../../ai-engine/seo-planner";
import type { AboutPipelineResult } from "../../ai-engine/about-pipeline";
import type { HeroPipelineResult } from "../../ai-engine/hero-pipeline";
import type { TemplateSelection } from "../../ai-engine/template-selector";
import {
  normalizeMetadata,
  type Branding,
  type Business,
  type Page,
  type Website,
} from "../../website";
import { DEFAULT_TEMPLATE_BLOCKS } from "../../template-engine";
import type { PromptContextCache } from "../context/prompt-context-cache";
import {
  resolveGenerationProfile,
  type GenerationModeProfile,
} from "../generation-mode";
import type { StageTelemetryRecord } from "../telemetry/stage-telemetry";
export {
  buildPromptContextCache,
  ensurePromptCache,
  formatPromptContextBlock,
  type PromptContextCache,
  type PromptContextFields,
} from "../context/prompt-context-cache";
export {
  resolveGenerationMode,
  resolveGenerationProfile,
  profileForMode,
  GENERATION_MODE_DEFAULT,
  type GenerationMode,
  type GenerationModeProfile,
} from "../generation-mode";

/** Profile for this bag — falls back to options.generationMode or Balanced. */
export function getGenerationProfile(ctx: PipelineContext): GenerationModeProfile {
  return (
    ctx.meta.generationProfile ??
    resolveGenerationProfile(ctx.meta.options)
  );
}

export type PipelineProgress = {
  stage: EngineStageName;
  label: string;
};

export type SimplePlanAi = {
  pageType?: string;
  conversionGoal?: string;
  template?: string;
  variant?: string;
  /** @deprecated legacy */
  style?: string;
  stickyCTA?: boolean;
  floatingPhone?: boolean;
  recommendedBlocks?: string[];
  removedBlocks?: string[];
  notes?: string[];
  sections?: unknown;
};

export interface PipelineLog {
  step: string;
  /** ISO timestamp when the step started */
  started: string;
  /** ISO timestamp when the step finished */
  finished: string;
  /** Wall-clock ms for the step */
  duration: number;
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  /** Estimated USD */
  cost: number;
  retries: number;
  cacheHit: boolean;
  status: "success" | "error";
}

export function appendLog(
  ctx: PipelineContext,
  entry: PipelineLog,
): PipelineContext {
  console.info("[pipeline-step]", JSON.stringify(entry));
  return {
    ...ctx,
    logs: [...ctx.logs, entry],
  };
}

/** Engine-only scratch — not part of Website JSON */
export type PipelineMeta = {
  input: BusinessFormInput;
  options: EngineRunOptions;
  runId: string;
  onProgress?: (p: PipelineProgress) => void;

  category: string;
  tradeKey: string;
  industryId: IndustryId;
  industryPack: IndustryPack;
  industryBrief: string;
  tradeHint: string;

  dna: BusinessDna;
  liveDna: BusinessDna;
  brief: BusinessBrief;
  personality?: BrandPersonality;
  personalityBrief: string;

  plan?: WebsitePlan;
  selection?: TemplateSelection;
  templateId?: TemplateId;
  seoPlan?: SeoPlan;
  copySeedBrief: string;

  /** Core prompt fields — built once after brand, shared across parallel steps */
  promptCache?: PromptContextCache;

  /** Resolved Fast / Balanced / Premium profile for this run */
  generationProfile?: GenerationModeProfile;

  engineCtx?: EngineContext;
  agentCtx?: { ctx: EngineContext; brief: BusinessBrief; plan: WebsitePlan };

  heroResult?: HeroPipelineResult;
  aboutResult?: AboutPipelineResult;
  content?: ContentDraft;
  seo?: SeoDraft;

  /** Lifecycle events for this run */
  events: import("./events").PipelineEvent[];
  onEvent?: import("./events").PipelineEventHandler;
};

export interface PipelineContext {
  business: Business;
  branding: Branding;
  website: Website;
  logs: PipelineLog[];
  telemetry: StageTelemetryRecord[];
  meta: PipelineMeta;
}

export interface PipelineStep<TContext = PipelineContext> {
  id: string;
  run(context: TContext): Promise<TContext>;
}

export type PipelineStepClass<TContext = PipelineContext> = new () => PipelineStep<TContext>;

/** Sync top-level business → website.business */
export function syncBusiness(ctx: PipelineContext): PipelineContext {
  return {
    ...ctx,
    website: { ...ctx.website, business: ctx.business },
  };
}

/** Sync top-level branding → website.branding */
export function syncBranding(ctx: PipelineContext): PipelineContext {
  return {
    ...ctx,
    website: { ...ctx.website, branding: ctx.branding },
  };
}

function parseServiceList(raw: string): string[] {
  return raw
    .split(/[,;•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function seedBusinessFromInput(
  input: BusinessFormInput,
  dna: BusinessDna,
  category: string,
): Business {
  const services = parseServiceList(input.services);
  return {
    name: input.businessName.trim(),
    category: category || dna.industry || "Business",
    subcategory: dna.subcategory || "",
    location: input.location.trim(),
    phone: input.phone.trim() || undefined,
    email: input.email.trim() || undefined,
    description: (input.description || "").trim() || dna.brandPosition || "",
    services: services.length ? services : [dna.industry].filter(Boolean),
    dna,
  };
}

export function seedBranding(dna: BusinessDna): Branding {
  return {
    tone: dna.tone || "Professional and clear",
    personality: dna.brandPersonality.slice(0, 6),
    colors: [],
    fonts: [],
    style: "modern",
  };
}

function stubSection(type: string, data: Record<string, unknown> = {}): Page["sections"][number] {
  return { id: type, type, enabled: true, data };
}

export function seedWebsiteShell(params: {
  runId: string;
  business: Business;
  branding: Branding;
}): Website {
  const { runId, business, branding } = params;
  const home: Page = {
    id: "home",
    slug: "/",
    title: "Home",
    sections: [
      stubSection("hero", {
        headline: "",
        subheadline: "",
        primaryCTA: "",
        trustBar: [],
      }),
      stubSection("about", {
        title: "",
        paragraphs: [],
        highlights: [],
      }),
      stubSection("services", { items: [] }),
      stubSection("faq", { items: [] }),
      stubSection("testimonials", { items: [] }),
      stubSection("cta", {
        headline: "",
        primaryCTA: "",
        secondaryCTA: "",
      }),
      stubSection("contact", {
        phone: business.phone ?? "",
        email: business.email ?? "",
        address: business.location,
        form: true,
      }),
    ],
  };

  return {
    metadata: normalizeMetadata(
      {},
      { id: runId, projectId: "", status: "draft", language: "en" },
    ),
    business,
    branding,
    navigation: {
      logo: business.name || "Logo",
      links: [
        { label: "About", href: "#about" },
        { label: "Services", href: "#services" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Get a quote",
    },
    pages: [home],
    seo: {
      title: "",
      description: "",
      keywords: [],
      canonical: "/",
      schema: null,
      openGraph: null,
      twitter: null,
    },
    theme: {
      id: "local-service-standard",
      blocks: DEFAULT_TEMPLATE_BLOCKS,
    },
    settings: {
      analytics: true,
      cookies: true,
      liveChat: false,
      animations: true,
      lazyLoad: true,
    },
    crestis: {
      engine: "simple",
    },
  };
}

export function briefFromDna(
  input: BusinessFormInput,
  dna: BusinessDna,
  tradeHint: string,
  industryId?: IndustryId,
): BusinessBrief {
  const serviceFocus = input.services
    .split(/[,;•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    dna,
    industryId,
    niche: dna.subcategory || dna.industry,
    tradeHint,
    city: input.location.trim(),
    localeNote: `Serving ${input.location.trim()}`,
    tone: dnaToDesignTone(dna),
    customerPains: dna.targetAudience.map(
      (a) => `Needs trusted help as ${a.toLowerCase()}`,
    ),
    uniqueAngle: `${dna.brandPosition} ${dna.industry} for ${dna.targetAudience[0] || "local customers"} in ${input.location.trim()}`,
    serviceFocus: serviceFocus.length
      ? serviceFocus
      : [dna.subcategory, dna.industry].filter(Boolean),
    offerPromise: dna.cta,
  };
}

export function planFromAi(
  dna: BusinessDna,
  ai: SimplePlanAi,
  pack: IndustryPack,
  city: string,
): WebsitePlan {
  const hints = {
    industry: dna.industry,
    tradeKey: pack.id,
    subcategory: dna.subcategory,
    brandPosition: dna.brandPosition,
    tone: dna.tone,
    websiteStyle: dna.websiteStyle,
  };

  const templateId = resolveTemplateId(
    ai.template || pack.preferredTemplate || ai.style || dna.websiteStyle,
    hints,
  );
  const template = getTemplate(templateId);
  const variant = resolveVariant(
    ai.variant || pack.heroRules.shellHint,
    template,
  );
  const sections = sectionsFromTemplateLabels(
    Array.isArray(ai.sections) && ai.sections.length > 0
      ? ai.sections
      : pack.siteStructure.sections,
    template,
  );

  const ctaPrimary =
    dna.ctaOptions.length > 0 ? dna.ctaOptions : pack.ctas.primary;
  const ctaList = ctaPrimary.slice(0, 3).join(" · ");

  const conversionGoal =
    String(ai.conversionGoal ?? "").trim() || dna.primaryGoal || "Lead";

  const pageType = String(ai.pageType ?? "").trim() || "Business";

  const notes = Array.isArray(ai.notes)
    ? ai.notes.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : [];
  const recommendedBlocks = Array.isArray(ai.recommendedBlocks)
    ? ai.recommendedBlocks.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : [];
  const removedBlocks = Array.isArray(ai.removedBlocks)
    ? ai.removedBlocks.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 12)
    : [];

  const phoneIntent =
    pack.siteStructure.floatingPhone ||
    /call|phone|emergency/i.test(
      `${conversionGoal} ${dna.conversionStrategy} ${dna.customerIntent}`,
    );

  return {
    template: templateId,
    variant,
    style: template.styleBucket,
    pageType,
    tone: dna.tone || pack.textStyle.voice || "Confident",
    goal: conversionGoal,
    targetAudience: dna.targetAudience.join(", ") || "Local customers",
    positioning:
      `${dna.brandPosition}${dna.advantages[0] ? ` — ${dna.advantages[0]}` : ""}` ||
      "Local expert",
    trustSignals: dna.trustSignals.slice(0, 6),
    ctaStrategy: `Industry pack CTAs: ${ctaList}. Secondary: ${pack.ctas.secondary.slice(0, 2).join(" · ")}. Conversion: ${dna.conversionStrategy}. Intent: ${dna.customerIntent}. Template: ${templateId} / ${variant}.`,
    colorDirection: template.visual.palette,
    sections,
    stickyCTA:
      typeof ai.stickyCTA === "boolean"
        ? ai.stickyCTA
        : pack.siteStructure.stickyCTA,
    floatingPhone:
      typeof ai.floatingPhone === "boolean" ? ai.floatingPhone : phoneIntent,
    recommendedBlocks,
    removedBlocks,
    notes,
    heroApproach: [
      `Pack ${pack.id}: ${pack.heroRules.headlinePattern}.`,
      `Must include: ${pack.heroRules.mustInclude.join(", ")}.`,
      `Avoid: ${pack.heroRules.avoid.join(", ")}.`,
      `Images: ${pack.imageGuidance.heroSubjects.join("; ")}.`,
      `Personality: ${dna.brandPersonality.join(", ")}.`,
    ].join(" "),
    aboutFocus: `${pack.sectionHints.about} Position: ${dna.brandPosition}. Advantages: ${dna.advantages.join(", ")}.`,
    serviceCount: 3,
    faqThemes: faqThemesFromPack(pack, city, [
      dna.customerIntent ? `Intent: ${dna.customerIntent}` : "",
    ].filter(Boolean)),
    ctaStyle: ctaPrimary[0] || dna.cta,
    testimonialAngle: `Local demo reviews — voice ${pack.textStyle.voice}; trust: ${dna.trustSignals.join(", ") || "reliability"}`,
  };
}
