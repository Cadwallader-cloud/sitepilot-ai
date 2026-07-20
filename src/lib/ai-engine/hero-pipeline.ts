/**
 * Crestis Hero Pipeline — 3 steps before the user sees a Hero
 *
 *   1) Generate 10 headlines
 *   2) Select the best + reason
 *   3) Improve: Original → Improved → Final (+ full hero fields)
 *
 * Only the Final hero is returned to the rest of the engine.
 */

import type { BusinessDna } from "../business-dna";
import { completeJsonObject } from "./openai-json";
import { CRESTIS_SYSTEM } from "./prompts/system";
import { HERO_GENERATOR_BODY } from "./prompts/hero";
import { normalizeTrustBar } from "./content-generator";
import type { ContentDraft, WebsitePlan } from "./types";

export type HeroPipelineProgress = {
  stage:
    | "hero_headlines"
    | "hero_select"
    | "hero_refine";
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

const IDEATE_SYSTEM = `${CRESTIS_SYSTEM}

You generate Hero headlines only.
Return exactly 10 distinct headline candidates for THIS business.
Follow Hero Generator headline rules (specific, 5–9 words ideal, max 12, no clichés).

${HERO_GENERATOR_BODY}

Do NOT write subheadline or CTAs yet.
Do NOT pick a winner yet.
Return JSON only:
{
  "headlines": ["", "", "", "", "", "", "", "", "", ""]
}`;

const SELECT_SYSTEM = `${CRESTIS_SYSTEM}

You are a senior conversion editor.
Given 10 headline candidates, pick the single best one for this local business.

Score silently on: Specificity, Trust, Local relevance, Emotion, CTA potential, Originality.
Never invent facts.

Return JSON only:
{
  "selectedIndex": 1,
  "selectedHeadline": "",
  "reason": "Most specific. Strong CTA. Local. Emotional."
}

selectedIndex is 1–10 matching the list order.
reason: short, punchy (max 20 words).`;

const REFINE_SYSTEM = `${CRESTIS_SYSTEM}

You refine the chosen Hero headline, then write the full Hero around the FINAL headline.

Process (required):
1) Original = the selected headline (copy exactly)
2) Improved = sharper, more specific rewrite
3) Final = best version after one more pass

Then write subheadline, CTAs, and trustBar for the Final headline.

${HERO_GENERATOR_BODY}

Return JSON only:
{
  "original": "",
  "improved": "",
  "final": "",
  "subheadline": "",
  "primaryCTA": "",
  "secondaryCTA": "",
  "trustBar": []
}

Rules:
- final must differ from original unless original is already excellent
- subheadline max 35 words; never repeats the headline
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
    `Phone: ${params.phone || "(none)"}`,
    "",
    "Brand Profile:",
    JSON.stringify(params.dna, null, 2),
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

/**
 * Run the 3-step Hero pipeline. Returns only the Final hero for rendering.
 */
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
  onProgress?: (p: HeroPipelineProgress) => void;
}): Promise<HeroPipelineResult> {
  const ctx = businessContext(params);

  // ── Step 1: 10 headlines ───────────────────────────────────────────
  params.onProgress?.({
    stage: "hero_headlines",
    label: "Hero · 10 Headlines",
  });
  const ideate = await completeJsonObject<{ headlines?: string[] }>({
    stage: "hero_headlines",
    userEmail: params.userEmail,
    maxCompletionTokens: 1024,
    system: IDEATE_SYSTEM,
    user: [
      "Create exactly 10 distinct Hero headlines for THIS business.",
      "Each must be specific to this city, services, and Brand Personality.",
      "Do NOT write the rest of the Hero yet.",
      "",
      ctx,
      params.regenerate
        ? "Regeneration — make all 10 clearly different from prior outputs."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const headlines = (Array.isArray(ideate.headlines) ? ideate.headlines : [])
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  while (headlines.length < 10) {
    headlines.push(
      `${params.dna.industry} help in ${params.location}`.slice(0, 60),
    );
  }

  // ── Step 2: pick best ──────────────────────────────────────────────
  params.onProgress?.({
    stage: "hero_select",
    label: "Hero · Select Best",
  });
  const select = await completeJsonObject<{
    selectedIndex?: number;
    selectedHeadline?: string;
    reason?: string;
  }>({
    stage: "hero_select",
    userEmail: params.userEmail,
    maxCompletionTokens: 512,
    system: SELECT_SYSTEM,
    user: [
      "Pick the single best headline from this list.",
      "",
      ...headlines.map((h, i) => `${i + 1}. ${h}`),
      "",
      ctx,
    ].join("\n"),
  });

  let selectedIndex = Number(select.selectedIndex ?? 1);
  if (!Number.isFinite(selectedIndex) || selectedIndex < 1 || selectedIndex > 10) {
    selectedIndex = 1;
  }
  const selectedHeadline =
    String(select.selectedHeadline ?? "").trim() ||
    headlines[selectedIndex - 1] ||
    headlines[0]!;
  // Prefer matching list item if AI drifted
  const matchedIdx = headlines.findIndex(
    (h) => h.toLowerCase() === selectedHeadline.toLowerCase(),
  );
  if (matchedIdx >= 0) selectedIndex = matchedIdx + 1;
  const reason =
    String(select.reason ?? "").trim() ||
    "Most specific. Strong CTA. Local.";

  // ── Step 3: improve + full Hero ────────────────────────────────────
  params.onProgress?.({
    stage: "hero_refine",
    label: "Hero · Improve Final",
  });
  const refine = await completeJsonObject<{
    original?: string;
    improved?: string;
    final?: string;
    subheadline?: string;
    primaryCTA?: string;
    secondaryCTA?: string;
    trustBar?: string[];
  }>({
    stage: "hero_refine",
    userEmail: params.userEmail,
    maxCompletionTokens: 1024,
    system: REFINE_SYSTEM,
    user: [
      "Improve this selected headline through Original → Improved → Final.",
      "Then write the full Hero around Final.",
      "",
      `Selected (#${selectedIndex}): ${selectedHeadline}`,
      `Selection reason: ${reason}`,
      "",
      `Allowed trust signals: ${params.dna.trustSignals.join(", ") || "(none)"}`,
      `Primary CTA hint: ${params.dna.cta}`,
      `Phone: ${params.phone || "(none)"}`,
      "",
      ctx,
    ].join("\n"),
  });

  const original =
    String(refine.original ?? "").trim() || selectedHeadline;
  const improved =
    String(refine.improved ?? "").trim() || original;
  const final =
    String(refine.final ?? "").trim() || improved || original;

  const hero: ContentDraft["hero"] = {
    headline: final,
    subheadline: String(refine.subheadline ?? "").trim(),
    primaryCTA:
      String(refine.primaryCTA ?? "").trim() || params.dna.cta || "Request Free Quote",
    secondaryCTA:
      String(refine.secondaryCTA ?? "").trim() ||
      (params.phone ? `Call ${params.phone}` : "Call Now"),
    trustBar: normalizeTrustBar(refine.trustBar, params.dna.trustSignals),
  };

  if (!hero.subheadline) {
    hero.subheadline = `Helping ${params.dna.targetAudience[0] || "local customers"} in ${params.location} with clear next steps — no fluff.`;
  }

  return {
    headlines,
    selectedIndex,
    selectedHeadline,
    reason,
    original,
    improved,
    final,
    hero,
  };
}
