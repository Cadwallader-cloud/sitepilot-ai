/**
 * Crestis About Pipeline — single-pass (1 OpenAI call)
 *
 * Picks the best style angle and writes the full About section in one response.
 */

import type { BusinessDna } from "../business-dna";
import type { PromptContextCache } from "../ai/context/prompt-context-cache";
import { completeJsonObject } from "./openai-json";
import { CRESTIS_SYSTEM } from "./prompts/system";
import {
  ABOUT_GENERATOR_BODY,
  normalizeAboutFromAi,
} from "./prompts/about";
import type { ContentDraft, WebsitePlan } from "./types";

export type AboutStyle = "story" | "professional" | "customer_first";

export type AboutVariant = {
  style: AboutStyle;
  title: string;
  paragraphs: string[];
  highlights: string[];
  text: string;
};

export type AboutPipelineProgress = {
  stage: "about_single" | "about_retry";
  label: string;
};

export type AboutPipelineResult = {
  variants: AboutVariant[];
  selectedStyle: AboutStyle;
  reason: string;
  about: ContentDraft["about"];
};

const SINGLE_PASS_SYSTEM = `${CRESTIS_SYSTEM}

You write ONE About section for a local business in a single pass.
First choose the best angle for this brand, then write the About.

${ABOUT_GENERATOR_BODY}

## Style options (pick one internally — output only the winner)
- story: warm, purpose-led — family / owner-led brands
- professional: expertise and process — legal, dental, clinical
- customer_first: problem → outcome — most local service businesses

Return JSON only:
{
  "selectedStyle": "customer_first",
  "reason": "Why this angle fits (max 25 words)",
  "title": "",
  "paragraphs": ["", ""],
  "highlights": ["", "", ""]
}

Rules:
- 80–140 words across paragraphs; Grade 7–9 readability
- Average sentence length: 12–18 words; maximum 25 words per sentence
- Paragraph 1 MUST mention the city from Location once (e.g. "Based in {city}, we..." or "We proudly serve homeowners across {city}...")
- Never invent years, awards, certifications, employee counts, or stats
- highlights: exactly 3; only plausible from inputs
- selectedStyle: story | professional | customer_first`;

function suggestStyleHint(dna: BusinessDna): AboutStyle {
  const blob = [
    dna.industry,
    dna.subcategory,
    dna.brandPosition,
    dna.tone,
    ...dna.brandPersonality,
  ]
    .join(" ")
    .toLowerCase();

  if (
    /family|family-owned|owner|story|warm|friendly|local|neighborhood/.test(
      blob,
    )
  ) {
    return "story";
  }
  if (
    /law|legal|dentist|dental|architect|clinic|medical|attorney|solicitor|professional|premium|luxury/.test(
      blob,
    )
  ) {
    return "professional";
  }
  return "customer_first";
}

function parseStyle(raw: string, fallback: AboutStyle): AboutStyle {
  const normalized = raw.trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "story" || normalized === "professional") return normalized;
  if (
    normalized === "customer_first" ||
    normalized === "customerfirst" ||
    normalized === "customer first"
  ) {
    return "customer_first";
  }
  return fallback;
}

function contextBlock(params: {
  businessName: string;
  location: string;
  category: string;
  services: string;
  description: string;
  dna: BusinessDna;
  plan: WebsitePlan;
  templateBrief: string;
  personalityBrief: string;
  industryBrief?: string;
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
    `Suggested style hint (not binding): ${suggestStyleHint(params.dna)}`,
    "",
    "Brand Profile:",
    dnaJson,
    "",
    "Planner Profile:",
    JSON.stringify(
      {
        template: params.plan.template,
        variant: params.plan.variant,
        aboutFocus: params.plan.aboutFocus,
        positioning: params.plan.positioning,
        trustSignals: params.plan.trustSignals,
        goal: params.plan.goal,
      },
      null,
      2,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

/** Single-pass About — one OpenAI call for style + copy. */
export async function runAboutPipeline(params: {
  businessName: string;
  location: string;
  category: string;
  services: string;
  description: string;
  dna: BusinessDna;
  plan: WebsitePlan;
  templateBrief: string;
  personalityBrief: string;
  industryBrief?: string;
  userEmail?: string | null;
  regenerate?: boolean;
  promptCache?: PromptContextCache;
  onProgress?: (p: AboutPipelineProgress) => void;
}): Promise<AboutPipelineResult> {
  const ctx = contextBlock(params);
  const styleHint = suggestStyleHint(params.dna);

  params.onProgress?.({
    stage: "about_single",
    label: "About",
  });

  const raw = await completeJsonObject<{
    selectedStyle?: string;
    reason?: string;
    title?: string;
    paragraphs?: string[];
    highlights?: string[];
    text?: string;
  }>({
    stage: "about_single",
    userEmail: params.userEmail,
    maxCompletionTokens: 1536,
    system: SINGLE_PASS_SYSTEM,
    user: [
      "Write ONE About section for THIS business.",
      "Pick the best style for this brand and write the full About.",
      "Never invent history, years, awards, or stats.",
      "",
      ctx,
      params.regenerate
        ? "Regeneration — change angle clearly from prior outputs."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const selectedStyle = parseStyle(
    String(raw.selectedStyle ?? ""),
    styleHint,
  );

  const normalized = normalizeAboutFromAi(
    {
      title: raw.title,
      paragraphs: raw.paragraphs,
      highlights: raw.highlights,
      text: raw.text,
    },
    selectedStyle === "story"
      ? "Our Story"
      : selectedStyle === "professional"
        ? "Our Approach"
        : "Why Customers Choose Us",
    { location: params.location },
  );

  const about =
    normalized.text.length >= 40
      ? normalized
      : normalizeAboutFromAi(
          {
            title:
              selectedStyle === "story"
                ? "Our Story"
                : selectedStyle === "professional"
                  ? "Our Approach"
                  : "Why Customers Choose Us",
            paragraphs: [
              `${params.businessName} helps ${params.dna.targetAudience[0] || "local customers"} in ${params.location} with ${params.dna.subcategory || params.dna.industry}. The focus is clear answers and work that matches what was discussed.`,
              `People come back for straightforward communication and a process that respects their time — from first contact to finished work.`,
            ],
            highlights: params.dna.trustSignals.slice(0, 3),
          },
          "About Us",
          { location: params.location },
        );

  const reason =
    String(raw.reason ?? "").trim() ||
    `Best fit: ${selectedStyle} for this Brand Profile.`;

  const variant: AboutVariant = {
    style: selectedStyle,
    title: about.title,
    paragraphs: about.paragraphs,
    highlights: about.highlights,
    text: about.text,
  };

  return {
    variants: [variant],
    selectedStyle,
    reason,
    about: {
      title: about.title,
      text: about.text,
      paragraphs: about.paragraphs,
      highlights: about.highlights,
    },
  };
}
