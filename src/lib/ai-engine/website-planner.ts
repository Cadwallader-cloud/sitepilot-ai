/**
 * Crestis Website Planner — Template Library selection
 * AI picks template + variant + sections. Never invents design.
 */

import type { CompetitorIntelligence } from "../competitor-intelligence";
import { pickVariationAngle } from "../openai-prompt";
import {
  getTemplate,
  resolveTemplateId,
  resolveVariant,
  sectionsFromTemplateLabels,
} from "../template-library";
import {
  detectIndustry,
  faqThemesFromPack,
  getIndustryPack,
} from "../industries";
import { detectTrade } from "../trade-images";
import type { UxPlan } from "../ux-plan";
import { completeJsonObject } from "./openai-json";
import { PLANNER_SYSTEM, plannerUser } from "./prompts/planner";
import type { BusinessBrief, EngineContext, WebsitePlan } from "./types";

function faqThemesForTrade(
  tradeKey: string,
  brief: BusinessBrief,
): string[] {
  const pack = getIndustryPack(
    brief.industryId || detectIndustry(`${tradeKey} ${brief.niche}`),
  );
  if (pack.id !== "general") {
    return faqThemesFromPack(pack, brief.city, brief.customerPains.slice(0, 2));
  }
  const city = brief.city;
  const pains = brief.customerPains.slice(0, 2).map((p) => `Address: ${p}`);
  return [
    ...pains,
    `Pricing / quotes in ${city}`,
    `What makes this ${brief.niche} business different`,
    `Service area / ${city} coverage`,
    "How booking works",
  ].slice(0, 6);
}

type PlannerAi = {
  pageType?: string;
  conversionGoal?: string;
  template?: string;
  variant?: string;
  style?: string;
  stickyCTA?: boolean;
  floatingPhone?: boolean;
  recommendedBlocks?: string[];
  removedBlocks?: string[];
  notes?: string[];
  sections?: unknown;
};

function buildWebsitePlan(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  competitors?: CompetitorIntelligence;
  ux?: UxPlan;
  ai?: PlannerAi;
}): WebsitePlan {
  const { ctx, brief, competitors, ux } = params;
  const ai = params.ai ?? {};
  const tradeKey = detectTrade(brief.tradeHint || brief.niche);
  const seed = `${ctx.runId}:${brief.city}:${brief.niche}:${tradeKey}`;
  const dna = brief.dna;

  const templateId = resolveTemplateId(
    ai.template || ai.style || dna.websiteStyle,
    {
      industry: dna.industry,
      tradeKey: String(tradeKey),
      subcategory: dna.subcategory,
      brandPosition: dna.brandPosition,
      tone: dna.tone,
      websiteStyle: dna.websiteStyle,
    },
  );
  const template = getTemplate(templateId);
  const variant = resolveVariant(ai.variant, template);

  const sections = ux?.sections?.length
    ? ux.sections
    : sectionsFromTemplateLabels(
        ai.sections ??
          competitors?.superiorStructure ??
          template.allowedSections,
        template,
      );

  const tone = dna.tone || "Confident";
  const goal =
    String(ai.conversionGoal ?? "").trim() ||
    dna.primaryGoal ||
    "Lead Generation";
  const targetAudience =
    dna.targetAudience.join(", ") || `Local customers in ${brief.city}`;
  const positioning = dna.brandPosition || brief.uniqueAngle;
  const trustSignals = dna.trustSignals.slice(0, 6);
  const ctaStrategy = `Primary CTA: "${dna.cta}". Secondary: ${dna.secondaryGoal}. Template: ${templateId} / ${variant}.`;

  const aboutIsWhyUs = sections.some(
    (s) => s.id === "trust" || s.id === "why_us" || s.label === "Trust",
  );

  const angle = pickVariationAngle(seed);
  const descHook = ctx.input.description.trim().slice(0, 220);
  const heroApproach = [
    angle,
    `Template ${templateId} variant ${variant}.`,
    `${dna.industry} / ${dna.subcategory} in ${brief.city}.`,
    `Position: ${dna.brandPosition}.`,
    dna.brandPersonality.length
      ? `Personality: ${dna.brandPersonality.join(", ")}.`
      : "",
    descHook ? `Owner notes: ${descHook}` : "",
    competitors?.differentiationAngle
      ? `Beat market: ${competitors.differentiationAngle}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const phoneIntent = /call|phone|emergency/i.test(
    `${goal} ${dna.conversionStrategy} ${dna.customerIntent}`,
  );

  return {
    template: templateId,
    variant,
    style: template.styleBucket,
    pageType: String(ai.pageType ?? "").trim() || "Business",
    tone,
    goal,
    targetAudience,
    positioning,
    trustSignals,
    ctaStrategy,
    colorDirection: template.visual.palette,
    sections,
    stickyCTA: typeof ai.stickyCTA === "boolean" ? ai.stickyCTA : true,
    floatingPhone:
      typeof ai.floatingPhone === "boolean" ? ai.floatingPhone : phoneIntent,
    recommendedBlocks: Array.isArray(ai.recommendedBlocks)
      ? ai.recommendedBlocks
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
    removedBlocks: Array.isArray(ai.removedBlocks)
      ? ai.removedBlocks
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12)
      : [],
    notes: Array.isArray(ai.notes)
      ? ai.notes.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
      : [],
    heroApproach,
    aboutFocus: aboutIsWhyUs
      ? `Frame About as Why Choose Us for ${brief.city}. Position: ${dna.brandPosition}. Personality: ${dna.brandPersonality.join(", ")}.`
      : `Brand position: ${dna.brandPosition}. Audience: ${targetAudience}. Tone: ${dna.tone}.`,
    serviceCount: 3,
    faqThemes: faqThemesForTrade(String(tradeKey), brief),
    ctaStyle: ctaStrategy,
    testimonialAngle: `Demo local reviews for ${brief.city} ${dna.industry} — trust: ${trustSignals.join(", ") || "reliability"}`,
  };
}

/** Instant plan from DNA + UX — no GPT (fast path). */
export function planWebsiteCrestis(
  ctx: EngineContext,
  brief: BusinessBrief,
  competitors?: CompetitorIntelligence,
  ux?: UxPlan,
): WebsitePlan {
  return buildWebsitePlan({ ctx, brief, competitors, ux });
}

/**
 * Stage 2 — Website Planner
 * AI returns template / variant / sections JSON — never copy or design invent.
 */
export async function planWebsite(
  ctx: EngineContext,
  brief: BusinessBrief,
  competitors?: CompetitorIntelligence,
  ux?: UxPlan,
): Promise<WebsitePlan> {
  const tradeKey = detectTrade(brief.tradeHint || brief.niche);

  let ai: PlannerAi = {};
  try {
    ai = await completeJsonObject<PlannerAi>({
      stage: "website_planner",
      userEmail: ctx.options.userEmail,
      temperature: ctx.options.regenerate ? 0.7 : 0.45,
      system: PLANNER_SYSTEM,
      user: plannerUser({
        businessName: ctx.input.businessName,
        location: ctx.input.location,
        services: ctx.input.services,
        city: brief.city,
        tradeKey,
        dnaJson: JSON.stringify(brief.dna, null, 2),
        competitorJson: JSON.stringify(
          competitors
            ? {
                marketQuery: competitors.marketQuery,
                mode: competitors.mode,
                sources: competitors.sources,
                whatTheyDoWell: competitors.whatTheyDoWell,
                whatTheyDoPoorly: competitors.whatTheyDoPoorly,
                avoidPatterns: competitors.avoidPatterns,
                differentiationAngle: competitors.differentiationAngle,
                superiorStructure: competitors.superiorStructure,
                structureNotes: competitors.structureNotes,
                competitors: competitors.competitors.map((c) => ({
                  label: c.label,
                  name: c.name,
                  url: c.url,
                  strengths: c.strengths,
                  weaknesses: c.weaknesses,
                })),
              }
            : {},
          null,
          2,
        ),
        regenerate: ctx.options.regenerate,
      }),
    });
  } catch (error) {
    console.warn("Website Planner AI failed, using Crestis fallback:", error);
  }

  return buildWebsitePlan({ ctx, brief, competitors, ux, ai });
}
