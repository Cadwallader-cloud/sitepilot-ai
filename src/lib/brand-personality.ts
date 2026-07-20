/**
 * Crestis Brand Personality Engine v1
 * Strategy profile for copy agents — never website content.
 */

export const BRAND_ARCHETYPES = [
  "Hero",
  "Caregiver",
  "Creator",
  "Explorer",
  "Sage",
  "Everyman",
  "Innocent",
  "Ruler",
  "Rebel",
  "Magician",
  "Jester",
  "Lover",
] as const;

export const BRAND_ENERGIES = [
  "Calm",
  "Balanced",
  "Energetic",
  "Bold",
  "Luxury",
  "Friendly",
  "Professional",
  "Technical",
] as const;

export const BRAND_VOICES = [
  "Friendly",
  "Professional",
  "Premium",
  "Minimal",
  "Corporate",
  "Luxury",
  "Warm",
  "Direct",
  "Technical",
] as const;

export const BRAND_WRITING_STYLES = [
  "Concise",
  "Conversational",
  "Elegant",
  "Simple",
  "Educational",
  "Persuasive",
] as const;

export const BRAND_EMOTIONS = [
  "Trust",
  "Excitement",
  "Comfort",
  "Security",
  "Confidence",
  "Speed",
  "Luxury",
  "Innovation",
] as const;

export const BRAND_FORMALITIES = [
  "Formal",
  "Semi-Formal",
  "Casual",
] as const;

export const BRAND_SENTENCE_LENGTHS = ["Short", "Medium", "Mixed"] as const;
export const BRAND_PARAGRAPH_LENGTHS = ["Short", "Medium"] as const;

export const BRAND_VOCABULARIES = [
  "Simple",
  "Standard",
  "Technical",
  "Premium",
] as const;

export const BRAND_CTA_STYLES = [
  "Direct",
  "Soft",
  "Urgent",
  "Premium",
] as const;

export const BRAND_TRAIT_OPTIONS = [
  "Reliable",
  "Honest",
  "Helpful",
  "Practical",
  "Confident",
  "Friendly",
  "Professional",
  "Modern",
  "Transparent",
  "Experienced",
  "Approachable",
  "Calm",
] as const;

export type BrandArchetype = (typeof BRAND_ARCHETYPES)[number];
export type BrandEnergy = (typeof BRAND_ENERGIES)[number];
export type BrandVoice = (typeof BRAND_VOICES)[number];
export type BrandWritingStyle = (typeof BRAND_WRITING_STYLES)[number];
export type BrandEmotion = (typeof BRAND_EMOTIONS)[number];
export type BrandFormality = (typeof BRAND_FORMALITIES)[number];
export type BrandSentenceLength = (typeof BRAND_SENTENCE_LENGTHS)[number];
export type BrandParagraphLength = (typeof BRAND_PARAGRAPH_LENGTHS)[number];
export type BrandVocabulary = (typeof BRAND_VOCABULARIES)[number];
export type BrandCtaStyle = (typeof BRAND_CTA_STYLES)[number];
export type BrandTrait = (typeof BRAND_TRAIT_OPTIONS)[number];

export type BrandPersonality = {
  archetype: BrandArchetype;
  energy: BrandEnergy;
  voice: BrandVoice;
  writingStyle: BrandWritingStyle;
  emotion: BrandEmotion;
  formality: BrandFormality;
  sentenceLength: BrandSentenceLength;
  paragraphLength: BrandParagraphLength;
  vocabulary: BrandVocabulary;
  ctaStyle: BrandCtaStyle;
  readingLevel: string;
  avoidWords: string[];
  preferredWords: string[];
  traits: BrandTrait[];
  writingRules: string[];
};

function pickAllowed<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  if (!s) return fallback;
  const exact = allowed.find((a) => a.toLowerCase() === s);
  if (exact) return exact;
  const partial = allowed.find(
    (a) => s.includes(a.toLowerCase()) || a.toLowerCase().includes(s),
  );
  return partial ?? fallback;
}

function asWordList(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const w = String(item ?? "")
      .trim()
      .toLowerCase();
    if (!w || seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= max) break;
  }
  return out;
}

function asRules(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => String(r ?? "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function pickTraits(raw: unknown, fallback: string[]): BrandTrait[] {
  const fromAi = Array.isArray(raw)
    ? raw.map((t) =>
        pickAllowed(t, BRAND_TRAIT_OPTIONS, "Reliable" as BrandTrait),
      )
    : [];
  const unique: BrandTrait[] = [];
  for (const t of fromAi) {
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= 6) break;
  }
  for (const f of fallback) {
    const t = pickAllowed(f, BRAND_TRAIT_OPTIONS, "Reliable" as BrandTrait);
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= 6) break;
  }
  const pad: BrandTrait[] = [
    "Reliable",
    "Honest",
    "Helpful",
    "Practical",
    "Confident",
    "Friendly",
  ];
  for (const t of pad) {
    if (unique.length >= 6) break;
    if (!unique.includes(t)) unique.push(t);
  }
  return unique.slice(0, 6);
}

const DEFAULT_AVOID = [
  "cheap",
  "best",
  "world class",
  "industry leading",
  "professional services",
  "quality you can trust",
  "#1",
  "guaranteed results",
];

const DEFAULT_RULES = [
  "Never exaggerate.",
  "Use active voice.",
  "Prefer verbs over adjectives.",
  "Avoid passive voice.",
  "Never repeat sentence openings.",
  "Stay specific to this city and services.",
  "Do not invent awards, years, or certifications.",
  "Match CTA style to the brand profile.",
  "Keep reading level at Grade 7–9.",
  "Sound like one company — not mixed AI voices.",
];

export function normalizeBrandPersonality(
  raw: unknown,
  hints?: {
    traits?: string[];
    voice?: string;
    preferredWords?: string[];
  },
): BrandPersonality {
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const traits = pickTraits(row.traits, hints?.traits ?? []);
  const preferred = asWordList(row.preferredWords, 16);
  const avoid = asWordList(row.avoidWords, 20);
  let rules = asRules(row.writingRules, 10);
  while (rules.length < 10) {
    const next = DEFAULT_RULES[rules.length];
    if (!next || rules.includes(next)) break;
    rules.push(next);
  }
  if (rules.length < 10) {
    rules = [...DEFAULT_RULES];
  }

  return {
    archetype: pickAllowed(row.archetype, BRAND_ARCHETYPES, "Everyman"),
    energy: pickAllowed(row.energy, BRAND_ENERGIES, "Balanced"),
    voice: pickAllowed(
      row.voice ?? hints?.voice,
      BRAND_VOICES,
      "Professional",
    ),
    writingStyle: pickAllowed(row.writingStyle, BRAND_WRITING_STYLES, "Simple"),
    emotion: pickAllowed(row.emotion, BRAND_EMOTIONS, "Trust"),
    formality: pickAllowed(row.formality, BRAND_FORMALITIES, "Semi-Formal"),
    sentenceLength: pickAllowed(
      row.sentenceLength,
      BRAND_SENTENCE_LENGTHS,
      "Medium",
    ),
    paragraphLength: pickAllowed(
      row.paragraphLength,
      BRAND_PARAGRAPH_LENGTHS,
      "Short",
    ),
    vocabulary: pickAllowed(row.vocabulary, BRAND_VOCABULARIES, "Standard"),
    ctaStyle: pickAllowed(row.ctaStyle, BRAND_CTA_STYLES, "Direct"),
    readingLevel:
      String(row.readingLevel ?? "").trim() || "Grade 7–9",
    avoidWords: avoid.length ? avoid : DEFAULT_AVOID.slice(0, 8),
    preferredWords: preferred.length
      ? preferred
      : (hints?.preferredWords ?? []).map((w) => w.toLowerCase()).slice(0, 12),
    traits,
    writingRules: rules.slice(0, 10),
  };
}

/** Format for Hero / About / Services / FAQ / CTA agents */
export function formatBrandPersonalityBrief(
  profile: BrandPersonality | string[] | undefined | null,
): string {
  if (!profile) {
    return "Brand Personality: (not set — invent a specific voice from the DNA)";
  }

  if (Array.isArray(profile)) {
    const list = profile.map((t) => t.trim()).filter(Boolean);
    if (!list.length) {
      return "Brand Personality: (not set — invent a specific voice from the DNA)";
    }
    return [
      "BRAND PERSONALITY (write FROM these traits — not from the category label):",
      ...list.map((t) => `- ${t}`),
      "",
      "Rules:",
      "- The copy must feel like this personality",
      "- Do NOT open with the category alone",
      "- City + outcome + personality beat niche templates",
    ].join("\n");
  }

  return [
    "BRAND PERSONALITY ENGINE (every line of copy must obey this profile):",
    `Archetype: ${profile.archetype}`,
    `Energy: ${profile.energy}`,
    `Voice: ${profile.voice}`,
    `Writing style: ${profile.writingStyle}`,
    `Emotional goal: ${profile.emotion}`,
    `Formality: ${profile.formality}`,
    `Sentence length: ${profile.sentenceLength}`,
    `Paragraph length: ${profile.paragraphLength}`,
    `Vocabulary: ${profile.vocabulary}`,
    `CTA style: ${profile.ctaStyle}`,
    `Reading level: ${profile.readingLevel}`,
    `Traits: ${profile.traits.join(", ")}`,
    "",
    "Preferred words:",
    ...profile.preferredWords.map((w) => `- ${w}`),
    "",
    "Avoid words:",
    ...profile.avoidWords.map((w) => `- ${w}`),
    "",
    "Writing rules:",
    ...profile.writingRules.map((r, i) => `${i + 1}. ${r}`),
    "",
    "Mission: a visitor must feel every page was written by the same company.",
  ].join("\n");
}
