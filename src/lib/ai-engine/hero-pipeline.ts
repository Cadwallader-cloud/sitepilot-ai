/**
 * Crestis Hero Pipeline — single-pass (1 OpenAI call)
 *
 * Writes headline, subheadline, CTAs, and trust bar in one JSON response.
 */

import type { BusinessDna } from "../business-dna";
import type { PromptContextCache } from "../ai/context/prompt-context-cache";
import { completeJsonObject } from "./openai-json";
import { CRESTIS_SYSTEM } from "./prompts/system";
import { HERO_GENERATOR_BODY } from "./prompts/hero";
import { normalizeTrustBar } from "./content-generator";
import type { ContentDraft, WebsitePlan } from "./types";

export type HeroPipelineProgress = {
  stage: "hero_single" | "hero_retry";
  label: string;
};

export type HeroPipelineResult = {
  headlines: string[];
  selectedIndex: number;
  selectedHeadline: string;
  reason: string;
  original: string;
  improved: string;
  final: string;
  hero: ContentDraft["hero"];
};

const SINGLE_PASS_SYSTEM = `${CRESTIS_SYSTEM}

You write the complete Hero section for a local business in ONE pass.
Pick the strongest headline yourself — do not return multiple candidates.

${HERO_GENERATOR_BODY}

Return JSON only:
{
  "headline": "",
  "subheadline": "",
  "primaryCTA": "",
  "secondaryCTA": "",
  "trustBar": [],
  "reason": "Short note on why this hero fits (max 20 words)"
}

Rules:
- headline: specific, 5–9 words ideal, max 12, no clichés, mention city when natural
- subheadline: max 35 words; never repeats the headline
- trustBar: 3–5 items only from provided trust signals
- Never invent awards, years, or stats`;

function businessContext(params: {
  businessName: string;
  location: string;
  category: string;
  services: string;
  description: string;
  phone: string;
  dna: BusinessDna;
  plan: WebsitePlan;
  templateBrief: string;
  personalityBrief: string;
  industryBrief?: string;
  forbiddenHeadline?: string;
  promptCache?: PromptContextCache;
}): string {
  const personalityBrief = params.promptCache?.brand ?? params.personalityBrief;
  const dnaJson =
    params.promptCache?.dnaJson ?? JSON.stringify(params.dna, null, 2);

  return [
    personalityBrief,
    "",
    params.industryBrief || "",
    "",
    params.templateBrief,
    "",
    `Business Name: ${params.businessName}`,
    `Category: ${params.category}`,
    `Location: ${params.location}`,
    `Services: ${params.services}`,
    `Description: ${params.description || "(none)"}`,
    `Phone: ${params.phone || "(none)"}`,
    "",
    "Brand Profile:",
    dnaJson,
    "",
    "Website Plan:",
    JSON.stringify(
      {
        template: params.plan.template,
        variant: params.plan.variant,
        goal: params.plan.goal,
        ctaStrategy: params.plan.ctaStrategy,
        trustSignals: params.plan.trustSignals,
        heroApproach: params.plan.heroApproach,
      },
      null,
      2,
    ),
    params.forbiddenHeadline
      ? `FORBIDDEN headline (must differ): ${params.forbiddenHeadline}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Single-pass Hero — one OpenAI call for the full hero section. */
export async function runHeroPipeline(params: {
  businessName: string;
  location: string;
  category: string;
  services: string;
  description: string;
  phone: string;
  dna: BusinessDna;
  plan: WebsitePlan;
  templateBrief: string;
  personalityBrief: string;
  industryBrief?: string;
  userEmail?: string | null;
  forbiddenHeadline?: string;
  regenerate?: boolean;
  promptCache?: PromptContextCache;
  onProgress?: (p: HeroPipelineProgress) => void;
}): Promise<HeroPipelineResult> {
  const ctx = businessContext(params);

  params.onProgress?.({
    stage: "hero_single",
    label: "Hero",
  });

  const raw = await completeJsonObject<{
    headline?: string;
    subheadline?: string;
    primaryCTA?: string;
    secondaryCTA?: string;
    trustBar?: string[];
    reason?: string;
  }>({
    stage: "hero_single",
    userEmail: params.userEmail,
    maxCompletionTokens: 1024,
    system: SINGLE_PASS_SYSTEM,
    user: [
      "Write the complete Hero for THIS business in one pass.",
      "Be specific to this city, services, and Brand Personality.",
      "",
      ctx,
      params.regenerate
        ? "Regeneration — clearly different headline and angle from prior outputs."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const final =
    String(raw.headline ?? "").trim() ||
    `${params.dna.industry} in ${params.location}`.slice(0, 60);

  const hero: ContentDraft["hero"] = {
    headline: final,
    subheadline: String(raw.subheadline ?? "").trim(),
    primaryCTA:
      String(raw.primaryCTA ?? "").trim() ||
      params.dna.cta ||
      "Request Free Quote",
    secondaryCTA:
      String(raw.secondaryCTA ?? "").trim() ||
      (params.phone ? `Call ${params.phone}` : "Call Now"),
    trustBar: normalizeTrustBar(raw.trustBar, params.dna.trustSignals),
  };

  if (!hero.subheadline) {
    hero.subheadline = `Helping ${params.dna.targetAudience[0] || "local customers"} in ${params.location} with clear next steps — no fluff.`;
  }

  const reason =
    String(raw.reason ?? "").trim() ||
    "Specific headline with local signal and a clear CTA.";

  return {
    headlines: [final],
    selectedIndex: 1,
    selectedHeadline: final,
    reason,
    original: final,
    improved: final,
    final,
    hero,
  };
}
