/**
 * Crestis About Pipeline
 *
 *   1) Generate 3 style variants: Story · Professional · Customer-first
 *   2) QA Agent picks the best + reason
 *
 * Only the winning About is returned to the engine / user.
 */

import type { BusinessDna } from "../business-dna";
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
  stage: "about_variants" | "about_select";
  label: string;
};

export type AboutPipelineResult = {
  variants: AboutVariant[];
  selectedStyle: AboutStyle;
  reason: string;
  about: ContentDraft["about"];
};

const VARIANTS_SYSTEM = `${CRESTIS_SYSTEM}

You write THREE different About sections for the SAME business.
Each must follow About Generator v1 rules (trust/value, 80–140 words, no invented history).

${ABOUT_GENERATOR_BODY}

## Styles (required — one of each)

1) story
Why the business exists. Warm, human. Best for family / owner-led brands.
Focus on purpose and people — still NO fake years/history unless provided.

2) professional
Focus on expertise and clear process. Best for lawyers, dentists, architects, clinics.
Calm authority. No arrogance. No invented credentials.

3) customer_first
Focus on customer problems and outcomes. Best for most local service businesses.
Problem → approach → why they come back.

Return JSON only:
{
  "variants": [
    {
      "style": "story",
      "title": "",
      "paragraphs": ["", ""],
      "highlights": ["", "", ""]
    },
    {
      "style": "professional",
      "title": "",
      "paragraphs": ["", ""],
      "highlights": ["", "", ""]
    },
    {
      "style": "customer_first",
      "title": "",
      "paragraphs": ["", ""],
      "highlights": ["", "", ""]
    }
  ]
}

Rules:
- All three must be clearly different in angle — not paraphrase clones
- Never invent years, awards, certifications, employee counts, or stats
- highlights: exactly 3 per variant; only plausible from inputs`;

const SELECT_SYSTEM = `${CRESTIS_SYSTEM}

You are Crestis About QA Agent.
Pick the single best About variant for THIS business.

Score silently on:
- Fit to industry / Brand Personality / brandPosition
- Trust and honesty (no fluff)
- Specificity (would NOT work for any random business)
- Conversion (makes contacting feel natural)
- Readability (Grade 7–9)

Return JSON only:
{
  "selectedStyle": "customer_first",
  "reason": "Best fit for local service buyers — problem-first and specific."
}

selectedStyle must be one of: story | professional | customer_first`;

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
}): string {
  return [
    params.personalityBrief,
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
    JSON.stringify(params.dna, null, 2),
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

function toVariant(raw: unknown): AboutVariant | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const styleRaw = String(row.style ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  const style: AboutStyle =
    styleRaw === "story" || styleRaw === "professional"
      ? styleRaw
      : styleRaw === "customer_first" || styleRaw === "customerfirst"
        ? "customer_first"
        : "customer_first";

  const normalized = normalizeAboutFromAi(
    {
      title: row.title,
      paragraphs: row.paragraphs,
      highlights: row.highlights,
      text: row.text,
    },
    style === "story"
      ? "Our Story"
      : style === "professional"
        ? "Our Approach"
        : "Why Customers Choose Us",
  );

  if (normalized.text.length < 40) return null;

  return {
    style,
    title: normalized.title,
    paragraphs: normalized.paragraphs,
    highlights: normalized.highlights,
    text: normalized.text,
  };
}

/**
 * Run About Pipeline: 3 styles → QA picks winner.
 */
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
  onProgress?: (p: AboutPipelineProgress) => void;
}): Promise<AboutPipelineResult> {
  const ctx = contextBlock(params);

  // ── Step 1: three style variants ───────────────────────────────────
  params.onProgress?.({
    stage: "about_variants",
    label: "About · 3 Styles",
  });
  const generated = await completeJsonObject<{ variants?: unknown[] }>({
    stage: "about_variants",
    userEmail: params.userEmail,
    maxCompletionTokens: 3072,
    system: VARIANTS_SYSTEM,
    user: [
      "Write THREE About variants for THIS business — story, professional, customer_first.",
      "Make them meaningfully different.",
      "Never invent history, years, awards, or stats.",
      "",
      ctx,
      params.regenerate
        ? "Regeneration — change angles clearly from prior outputs."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const variants = (Array.isArray(generated.variants) ? generated.variants : [])
    .map(toVariant)
    .filter((v): v is AboutVariant => Boolean(v));

  // Ensure we have one of each style if possible; fill gaps with DNA-based fallbacks
  const byStyle = new Map<AboutStyle, AboutVariant>();
  for (const v of variants) {
    if (!byStyle.has(v.style)) byStyle.set(v.style, v);
  }

  const styles: AboutStyle[] = ["story", "professional", "customer_first"];
  for (const style of styles) {
    if (byStyle.has(style)) continue;
    const fallback = normalizeAboutFromAi(
      {
        title:
          style === "story"
            ? "Our Story"
            : style === "professional"
              ? "Our Approach"
              : "Why Customers Choose Us",
        paragraphs: [
          `${params.businessName} helps ${params.dna.targetAudience[0] || "local customers"} in ${params.location} with ${params.dna.subcategory || params.dna.industry}. The focus is clear answers and work that matches what was discussed.`,
          `People come back for straightforward communication and a process that respects their time — from first contact to finished work.`,
        ],
        highlights: params.dna.trustSignals.slice(0, 3),
      },
      "About Us",
    );
    byStyle.set(style, {
      style,
      title: fallback.title,
      paragraphs: fallback.paragraphs,
      highlights: fallback.highlights,
      text: fallback.text,
    });
  }

  const ordered = styles.map((s) => byStyle.get(s)!);

  // ── Step 2: QA selects best ────────────────────────────────────────
  params.onProgress?.({
    stage: "about_select",
    label: "About · QA Select",
  });
  const pick = await completeJsonObject<{
    selectedStyle?: string;
    reason?: string;
  }>({
    stage: "about_select",
    userEmail: params.userEmail,
    maxCompletionTokens: 512,
    system: SELECT_SYSTEM,
    user: [
      "Pick the best About variant for THIS business.",
      "",
      ...ordered.map(
        (v, i) =>
          `--- Variant ${i + 1}: ${v.style} ---\nTitle: ${v.title}\n${v.text}\nHighlights: ${v.highlights.join(", ")}`,
      ),
      "",
      ctx,
    ].join("\n"),
  });

  const rawStyle = String(pick.selectedStyle ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  let selectedStyle: AboutStyle = suggestStyleHint(params.dna);
  if (rawStyle === "story" || rawStyle === "professional") {
    selectedStyle = rawStyle;
  } else if (
    rawStyle === "customer_first" ||
    rawStyle === "customerfirst" ||
    rawStyle === "customer first"
  ) {
    selectedStyle = "customer_first";
  }

  const winner =
    ordered.find((v) => v.style === selectedStyle) || ordered[2]!;

  const reason =
    String(pick.reason ?? "").trim() ||
    `Best fit: ${winner.style} for this Brand Profile.`;

  return {
    variants: ordered,
    selectedStyle: winner.style,
    reason,
    about: {
      title: winner.title,
      text: winner.text,
      paragraphs: winner.paragraphs,
      highlights: winner.highlights,
    },
  };
}
