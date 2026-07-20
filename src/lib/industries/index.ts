/**
 * Crestis Industry Knowledge Packs v1
 *
 * AI adapts from these packs — does not invent niche strategy from zero.
 *
 *   src/lib/industries/*.json          — pack
 *   src/lib/industries/<id>/faq.json   — FAQ knowledge bank
 */

import type { TradeKey } from "../trade-images";
import cleaning from "./cleaning.json";
import dentist from "./dentist.json";
import electrician from "./electrician.json";
import general from "./general.json";
import gym from "./gym.json";
import lawyer from "./lawyer.json";
import plumbing from "./plumbing.json";
import realEstate from "./real_estate.json";
import restaurant from "./restaurant.json";
import roofing from "./roofing.json";
import solar from "./solar.json";
import cleaningFaq from "./cleaning/faq.json";
import dentistFaq from "./dentist/faq.json";
import electricianFaq from "./electrician/faq.json";
import generalFaq from "./general/faq.json";
import gymFaq from "./gym/faq.json";
import lawyerFaq from "./lawyer/faq.json";
import plumbingFaq from "./plumbing/faq.json";
import realEstateFaq from "./real_estate/faq.json";
import restaurantFaq from "./restaurant/faq.json";
import roofingFaq from "./roofing/faq.json";
import solarFaq from "./solar/faq.json";
import {
  normalizeIndustryFaqKnowledge,
  type IndustryFaqKnowledge,
} from "./faq-types";
import type { IndustryId, IndustryPack } from "./types";

export type { IndustryId, IndustryPack } from "./types";
export type { IndustryFaqKnowledge } from "./faq-types";

const PACKS: Record<IndustryId, IndustryPack> = {
  roofing: roofing as IndustryPack,
  plumbing: plumbing as IndustryPack,
  electrician: electrician as IndustryPack,
  dentist: dentist as IndustryPack,
  restaurant: restaurant as IndustryPack,
  lawyer: lawyer as IndustryPack,
  cleaning: cleaning as IndustryPack,
  real_estate: realEstate as IndustryPack,
  gym: gym as IndustryPack,
  solar: solar as IndustryPack,
  general: general as IndustryPack,
};

const FAQ_BANKS: Record<IndustryId, IndustryFaqKnowledge> = {
  roofing: normalizeIndustryFaqKnowledge(roofingFaq),
  plumbing: normalizeIndustryFaqKnowledge(plumbingFaq),
  electrician: normalizeIndustryFaqKnowledge(electricianFaq),
  dentist: normalizeIndustryFaqKnowledge(dentistFaq),
  restaurant: normalizeIndustryFaqKnowledge(restaurantFaq),
  lawyer: normalizeIndustryFaqKnowledge(lawyerFaq),
  cleaning: normalizeIndustryFaqKnowledge(cleaningFaq),
  real_estate: normalizeIndustryFaqKnowledge(realEstateFaq),
  gym: normalizeIndustryFaqKnowledge(gymFaq),
  solar: normalizeIndustryFaqKnowledge(solarFaq),
  general: normalizeIndustryFaqKnowledge(generalFaq),
};

/** Detection order matters — hospitality / solar before roof, etc. */
const DETECT_ORDER: IndustryId[] = [
  "restaurant",
  "dentist",
  "solar",
  "roofing",
  "plumbing",
  "electrician",
  "lawyer",
  "cleaning",
  "real_estate",
  "gym",
];

export function listIndustryIds(): IndustryId[] {
  return Object.keys(PACKS) as IndustryId[];
}

export function getIndustryPack(id: IndustryId | string | undefined | null): IndustryPack {
  if (id && id in PACKS) return PACKS[id as IndustryId];
  return PACKS.general;
}

/** FAQ knowledge bank — real niche questions + objections */
export function getIndustryFaq(
  id: IndustryId | string | undefined | null,
): IndustryFaqKnowledge {
  if (id && id in FAQ_BANKS) return FAQ_BANKS[id as IndustryId];
  return FAQ_BANKS.general;
}

export function industryFaqBrief(
  faq: IndustryFaqKnowledge,
  city?: string,
): string {
  return [
    "INDUSTRY FAQ KNOWLEDGE BANK (adapt — do NOT invent new question topics):",
    "Common questions:",
    ...faq.common_questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    `Common objections to address: ${faq.common_objections.join(" · ")}`,
    city?.trim()
      ? `Localize naturally to: ${city.trim()} (do not spam the city name).`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function detectIndustry(text: string): IndustryId {
  const t = text.toLowerCase();

  for (const id of DETECT_ORDER) {
    const pack = PACKS[id];
    for (const alias of pack.aliases) {
      const a = alias.toLowerCase();
      if (!a) continue;
      // word-ish match for short aliases; substring for multi-word
      if (a.includes(" ")) {
        if (t.includes(a)) return id;
      } else {
        const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (re.test(t)) return id;
      }
    }
  }

  // Extra solar / real-estate patterns
  if (/photovoltaic|\bpv\b|solar panel/.test(t)) return "solar";
  if (/realtor|estate agent|homes for sale|listing agent/.test(t)) {
    return "real_estate";
  }
  if (/personal trainer|crossfit|fitness studio|health club/.test(t)) {
    return "gym";
  }

  return "general";
}

/** Map industry pack → existing TradeKey for images/themes */
export function industryToTradeKey(id: IndustryId): TradeKey {
  const map: Record<IndustryId, TradeKey> = {
    roofing: "roofing",
    plumbing: "plumbing",
    electrician: "electrician",
    dentist: "dentist",
    restaurant: "restaurant",
    lawyer: "lawyer",
    cleaning: "general",
    real_estate: "general",
    gym: "general",
    solar: "electrician",
    general: "general",
  };
  return map[id] ?? "general";
}

/** Compact JSON brief for AI prompts (Planner / Hero / FAQ / SEO) */
export function industryPackBrief(pack: IndustryPack, city?: string): string {
  const cityNote = city?.trim() ? ` City context: ${city.trim()}.` : "";
  return [
    `INDUSTRY KNOWLEDGE PACK: ${pack.label} (${pack.id})`,
    `Preferred CTAs: ${pack.ctas.primary.join(" | ")}`,
    `Secondary CTAs: ${pack.ctas.secondary.join(" | ")}`,
    `Sections: ${pack.siteStructure.sections.join(" → ")}`,
    `FAQ themes: ${pack.faqThemes.join(" | ")}`,
    `SEO terms: ${pack.seoVocab.primaryTerms.join(", ")}`,
    `Local SEO modifiers: ${pack.seoVocab.localModifiers.join(", ")}`,
    `SEO avoid: ${pack.seoVocab.avoid.join(", ")}`,
    `Voice: ${pack.textStyle.voice} · Style: ${pack.textStyle.writingStyle}`,
    `Do: ${pack.textStyle.do.join("; ")}`,
    `Don't: ${pack.textStyle.dont.join("; ")}`,
    `Hero pattern: ${pack.heroRules.headlinePattern}`,
    `Hero must include: ${pack.heroRules.mustInclude.join(", ")}`,
    `Hero avoid: ${pack.heroRules.avoid.join(", ")}`,
    `Preferred words: ${pack.preferredWords.join(", ")}`,
    `About hint: ${pack.sectionHints.about}`,
    `Services hint: ${pack.sectionHints.services}`,
    `FAQ hint: ${pack.sectionHints.faq}`,
    `Images — hero: ${pack.imageGuidance.heroSubjects.join("; ")}`,
    `Images — avoid: ${pack.imageGuidance.avoid.join("; ")}`,
    `Use this pack as the niche base.${cityNote} Adapt to THIS business — do not invent credentials.`,
  ].join("\n");
}

/** City-aware FAQ themes from pack (legacy planner helper) */
export function faqThemesFromPack(
  pack: IndustryPack,
  city: string,
  extras: string[] = [],
): string[] {
  const faq = getIndustryFaq(pack.id);
  const fromBank = faq.common_questions.slice(0, 6);
  const localized = (fromBank.length ? fromBank : pack.faqThemes).map(
    (theme) =>
      /service area|coverage|local|near|which areas/i.test(theme) &&
      city.trim()
        ? `${theme} (${city.trim()})`
        : theme,
  );
  return [...extras, ...localized].filter(Boolean).slice(0, 6);
}
