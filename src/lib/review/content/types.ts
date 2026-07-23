/** Content Review Engine — marketer-style quality scores (Phase 3.1). */

import type { ReviewCheck, ReviewStatus } from "@/lib/review/types";

export type { ReviewCheck, ReviewStatus };

export const CONTENT_REVIEW_THRESHOLD = 85;

export type ContentReviewSectionId =
  | "hero"
  | "about"
  | "services"
  | "faq"
  | "cta"
  | "readability"
  | "uniqueness";

export type SectionReview = {
  id: ContentReviewSectionId;
  label: string;
  score: number;
  checks: ReviewCheck[];
  summary: string;
};

export type ContentReviewGrade = "excellent" | "good" | "needs_work" | "poor";

export type ContentReviewFinal = {
  score: number;
  grade: ContentReviewGrade;
  passed: boolean;
  summary: string;
  weights: Record<ContentReviewSectionId, number>;
};

export type ContentReviewIssueSeverity = "warning" | "error";

export type ContentReviewIssue = {
  severity: ContentReviewIssueSeverity;
  section: ContentReviewSectionId;
  message: string;
  suggestion: string;
};

/** Public final report shape for QA / pipeline consumers. */
export type ContentReviewFinalReport = {
  overall: number;
  hero: number;
  about: number;
  services: number;
  faq: number;
  cta: number;
  issues: ContentReviewIssue[];
};

export type ContentReviewHealingTaskStatus = "pending" | "completed" | "failed";

export type ContentReviewHealingTask = {
  action: string;
  section: ContentReviewSectionId;
  score: number;
  reasons: string[];
  status: ContentReviewHealingTaskStatus;
};

export type ContentReviewSelfHealing = {
  tasks: ContentReviewHealingTask[];
  regeneratedSections: string[];
};

export type ContentReviewReportBody = {
  sections: Record<ContentReviewSectionId, SectionReview>;
  final: ContentReviewFinal;
  issues: string[];
  strengths: string[];
};

export type ContentReviewReport = ContentReviewReportBody & {
  report: ContentReviewFinalReport;
  selfHealing?: ContentReviewSelfHealing;
};

export type ContentReviewInput = {
  location: string;
  category?: string;
  businessName?: string;
  hero: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
    trustBar?: string[];
  };
  about: {
    title: string;
    text: string;
    paragraphs?: string[];
    highlights?: string[];
  };
  services: Array<{
    title: string;
    description: string;
    benefits?: string[];
    featured?: boolean;
    cta?: string;
  }>;
  faq: Array<{ question: string; answer: string }>;
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
};

export const GENERIC_HERO_EXACT = [
  "professional roofing services",
  "quality plumbing services",
  "expert dental care",
  "professional electrician services",
  "welcome to our restaurant",
  "your trusted local experts",
  "quality services you can trust",
];

export const GENERIC_HERO_PATTERNS = [
  /^(professional|quality|expert|trusted)\s+\w+(\s+\w+)?\s+services$/i,
  /^welcome to our .+$/i,
];

export const GENERIC_CTAS = [
  "contact us today",
  "get in touch today",
  "call us today",
  "contact us",
  "learn more",
  "get started",
  "click here",
];

export const CTA_ACTION_VERBS = new Set([
  "apply",
  "book",
  "buy",
  "call",
  "check",
  "claim",
  "compare",
  "contact",
  "discover",
  "download",
  "email",
  "explore",
  "find",
  "fix",
  "get",
  "hire",
  "join",
  "message",
  "order",
  "quote",
  "reach",
  "request",
  "reserve",
  "save",
  "schedule",
  "see",
  "shop",
  "speak",
  "start",
  "talk",
  "text",
  "try",
  "view",
]);

export function ctaStartsWithVerb(label: string): boolean {
  const first = normalizeText(label).split(" ").filter(Boolean)[0] ?? "";
  return CTA_ACTION_VERBS.has(first);
}

export function isGenericCta(label: string): boolean {
  return GENERIC_CTAS.includes(normalizeText(label));
}

export type CtaStrength = "strong" | "weak" | "invalid";

const WEAK_CTA_PATTERNS = [
  /^learn more$/i,
  /^get started$/i,
  /^click here$/i,
  /^read more$/i,
  /^view more$/i,
  /^see more$/i,
  /^contact us$/i,
  /^submit$/i,
  /^continue$/i,
  /^explore$/i,
];

const STRONG_CTA_SIGNALS =
  /\b(free|quote|estimate|inspection|consult|consultation|assessment|demo|audit|appointment|visit|plan|review|replacement|repair)\b/i;

export function ctaStrength(label: string): CtaStrength {
  const trimmed = label.trim();
  if (!trimmed) return "invalid";

  const normalized = normalizeText(trimmed);
  if (isGenericCta(trimmed) || WEAK_CTA_PATTERNS.some((pattern) => pattern.test(trimmed.trim()))) {
    return "weak";
  }
  if (!ctaStartsWithVerb(trimmed)) return "invalid";

  if (STRONG_CTA_SIGNALS.test(trimmed)) return "strong";
  if (/^(call now|schedule today|book now|get quote|book inspection)$/i.test(normalized)) {
    return "strong";
  }

  const words = normalized.split(" ").filter(Boolean);
  if (words.length >= 3) return "strong";
  if (words.length === 2 && ["now", "today", "quote"].includes(words[1] ?? "")) {
    return "strong";
  }

  return "weak";
}

const FAQ_NICHE_KEYWORDS: Record<string, string[]> = {
  roofing: [
    "roof",
    "roofing",
    "roofer",
    "shingle",
    "leak",
    "storm",
    "hail",
    "tarp",
    "insurance",
    "replacement",
    "repair",
    "inspect",
    "inspection",
  ],
  plumber: ["plumb", "pipe", "drain", "leak", "water", "sewer", "faucet"],
  hvac: ["hvac", "heat", "cool", "furnace", "air", "ac", "vent"],
  electrician: ["electric", "wiring", "panel", "outlet", "breaker"],
  dentist: ["dental", "tooth", "teeth", "implant", "crown", "cleaning"],
  restaurant: ["menu", "reservation", "dining", "delivery", "catering"],
  lawyer: ["case", "legal", "claim", "consult", "court", "injury"],
  cleaning: ["clean", "deep clean", "move-out", "carpet", "sanitize"],
  landscaping: ["lawn", "landscape", "irrigation", "tree", "garden"],
  "real-estate": ["home", "listing", "buy", "sell", "mortgage", "property"],
};

const UNNATURAL_FAQ_PATTERNS = [
  /^faq\b/i,
  /^question\s+\d+/i,
  /^q\d+\b/i,
  /\bquestion \d+ for\b/i,
  /^question about\b/i,
];

const FAQ_QUESTION_START =
  /^(how|what|when|where|why|who|do|does|did|can|could|should|will|would|is|are|am|may|might)\b/i;

export function faqNicheKeywords(category?: string): string[] {
  const normalized = normalizeText(category ?? "");
  if (!normalized) return [];

  for (const [niche, keywords] of Object.entries(FAQ_NICHE_KEYWORDS)) {
    if (normalized.includes(niche.replace(/-/g, " ")) || normalized.includes(niche)) {
      return keywords;
    }
  }

  return normalized.split(" ").filter((word) => word.length >= 4);
}

export function isNaturalFaqQuestion(question: string): boolean {
  const trimmed = question.trim();
  if (!trimmed.endsWith("?")) return false;
  if (wordCount(trimmed) < 4) return false;
  if (UNNATURAL_FAQ_PATTERNS.some((pattern) => pattern.test(trimmed))) return false;
  return FAQ_QUESTION_START.test(trimmed);
}

export function faqQuestionMatchesNiche(question: string, category?: string): boolean {
  if (!category?.trim()) return true;

  const text = normalizeText(question);
  const categoryText = normalizeText(category);
  if (categoryText && text.includes(categoryText)) return true;

  return faqNicheKeywords(category).some((keyword) => text.includes(keyword));
}

export const AI_SMELL_PATTERNS = [
  /\b(professional services|welcome to|quality you can trust|we('re| are) passionate|dedicated to excellence|your trusted partner|one[- ]stop shop)\b/i,
  /\b(industry[- ]leading|world[- ]class|second to none|cutting[- ]edge solutions)\b/i,
];

export const SECTION_SCORE_POINTS = {
  hero: 20,
  about: 15,
  services: 20,
  faq: 15,
  cta: 15,
  readability: 10,
  uniqueness: 5,
} as const;

export const SECTION_REVIEW_WEIGHTS = {
  hero: SECTION_SCORE_POINTS.hero / 100,
  about: SECTION_SCORE_POINTS.about / 100,
  services: SECTION_SCORE_POINTS.services / 100,
  faq: SECTION_SCORE_POINTS.faq / 100,
  cta: SECTION_SCORE_POINTS.cta / 100,
  readability: SECTION_SCORE_POINTS.readability / 100,
  uniqueness: SECTION_SCORE_POINTS.uniqueness / 100,
} as const;

export const AI_CLICHE_PATTERNS = [
  { id: "we_are_committed", pattern: /\bwe are committed\b/i, label: "We are committed..." },
  {
    id: "high_quality_service",
    pattern: /\bhigh[- ]quality service\b/i,
    label: "High-quality service...",
  },
  {
    id: "customer_satisfaction",
    pattern: /\bcustomer satisfaction\b/i,
    label: "Customer satisfaction...",
  },
  {
    id: "professional_solutions",
    pattern: /\bprofessional solutions\b/i,
    label: "Professional solutions...",
  },
  {
    id: "quality_you_can_trust",
    pattern: /\bquality you can trust\b/i,
    label: "Quality you can trust...",
  },
  {
    id: "committed_to_excellence",
    pattern: /\bcommitted to excellence\b/i,
    label: "Committed to excellence...",
  },
  {
    id: "your_trusted_partner",
    pattern: /\byour trusted partner\b/i,
    label: "Your trusted partner...",
  },
  {
    id: "dedicated_to_excellence",
    pattern: /\bdedicated to excellence\b/i,
    label: "Dedicated to excellence...",
  },
  {
    id: "passionate_about",
    pattern: /\bwe('re| are) passionate about\b/i,
    label: "We're passionate about...",
  },
  {
    id: "industry_leading",
    pattern: /\bindustry[- ]leading\b/i,
    label: "Industry-leading...",
  },
  { id: "world_class", pattern: /\bworld[- ]class\b/i, label: "World-class..." },
  {
    id: "cutting_edge_solutions",
    pattern: /\bcutting[- ]edge solutions\b/i,
    label: "Cutting-edge solutions...",
  },
  { id: "one_stop_shop", pattern: /\bone[- ]stop shop\b/i, label: "One-stop shop..." },
  {
    id: "professional_services",
    pattern: /\bprofessional services\b/i,
    label: "Professional services...",
  },
  {
    id: "second_to_none",
    pattern: /\bsecond to none\b/i,
    label: "Second to none...",
  },
] as const;

export const AI_CLICHE_DEDUCTION = 15;

export function detectAiCliches(text: string): Array<{ id: string; label: string }> {
  const hits: Array<{ id: string; label: string }> = [];
  for (const entry of AI_CLICHE_PATTERNS) {
    if (entry.pattern.test(text)) {
      hits.push({ id: entry.id, label: entry.label });
    }
  }
  return hits;
}

const REPETITION_STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "been",
  "before",
  "being",
  "between",
  "both",
  "could",
  "each",
  "from",
  "have",
  "help",
  "here",
  "home",
  "into",
  "just",
  "like",
  "make",
  "more",
  "most",
  "much",
  "need",
  "only",
  "other",
  "our",
  "over",
  "same",
  "some",
  "such",
  "team",
  "than",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "very",
  "want",
  "well",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "will",
  "with",
  "work",
  "would",
  "your",
  "service",
  "services",
  "business",
  "local",
  "quality",
  "professional",
]);

/** Words repeated too often across body copy (excluding common stop words). */
export function detectOverusedWords(
  text: string,
  options?: { minLength?: number; minCount?: number; ratio?: number },
): string[] {
  const minLength = options?.minLength ?? 4;
  const minCount = options?.minCount ?? 4;
  const ratio = options?.ratio ?? 0.035;
  const words = normalizeText(text)
    .split(" ")
    .filter((word) => word.length >= minLength && !REPETITION_STOP_WORDS.has(word));
  if (words.length < 24) return [];

  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);

  return [...counts.entries()]
    .filter(([, count]) => count >= minCount && count / words.length >= ratio)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/** Terms exempt from word-repetition penalties (SEO/niche vocabulary). */
export function buildWordRepetitionAllowlist(input: ContentReviewInput): Set<string> {
  const allowed = new Set<string>();
  const addPhrase = (phrase: string) => {
    for (const word of normalizeText(phrase).split(" ")) {
      if (word.length >= 3) allowed.add(word);
    }
  };

  addPhrase(input.location);
  const parts = parseLocationParts(input.location);
  addPhrase(parts.city);
  addPhrase(parts.district);
  addPhrase(parts.region);
  addPhrase(parts.country);

  addPhrase(input.category ?? "");
  for (const keyword of faqNicheKeywords(input.category)) {
    addPhrase(keyword);
  }

  if (input.businessName) addPhrase(input.businessName);

  for (const service of input.services) {
    addPhrase(service.title);
  }

  return allowed;
}

export function isAllowedRepetitionWord(word: string, allowed: ReadonlySet<string>): boolean {
  if (allowed.has(word)) return true;
  for (const term of allowed) {
    if (term.length < 4 || word.length < 4) continue;
    if (word.startsWith(term) || term.startsWith(word)) return true;
  }
  return false;
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(value: string): number {
  return normalizeText(value).split(" ").filter(Boolean).length;
}

export function averageSentenceLength(value: string): number {
  const sentences = splitSentences(value);
  if (!sentences.length) return 0;
  const words = sentences.reduce((sum, sentence) => sum + wordCount(sentence), 0);
  return words / sentences.length;
}

export function splitSentences(value: string): string[] {
  return value
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function countLongSentences(value: string, maxWords = 20): number {
  return splitSentences(value).filter((sentence) => wordCount(sentence) > maxWords).length;
}

export function paragraphBlocks(input: {
  about: ContentReviewInput["about"];
}): string[] {
  if (input.about.paragraphs?.length) {
    return input.about.paragraphs.map((part) => part.trim()).filter(Boolean);
  }
  return input.about.text
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function paragraphLineCount(paragraph: string): number {
  const explicit = paragraph
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit.length;
  return Math.max(1, Math.ceil(wordCount(paragraph) / 12));
}

const PASSIVE_VOICE_PATTERN =
  /\b(am|is|are|was|were|been|being)\s+([a-z]+(?:ed|en)|built|done|given|known|made|seen|shown|told|written|held|kept|left|met|paid|put|read|said|sent|spent|stood|taken|thought|understood|won)\b/i;

const PASSIVE_FALSE_FOLLOWERS = new Set([
  "a",
  "also",
  "always",
  "available",
  "best",
  "free",
  "here",
  "just",
  "less",
  "more",
  "never",
  "not",
  "now",
  "often",
  "open",
  "ready",
  "still",
  "there",
  "very",
]);

function sentenceUsesPassiveVoice(sentence: string): boolean {
  const match = sentence.match(/\b(am|is|are|was|were|been|being)\s+([a-z]+)/i);
  if (!match) return false;
  const follower = match[2]?.toLowerCase() ?? "";
  if (PASSIVE_FALSE_FOLLOWERS.has(follower)) return false;
  return PASSIVE_VOICE_PATTERN.test(sentence);
}

export function countPassiveSentences(value: string): number {
  return splitSentences(value).filter((sentence) => sentenceUsesPassiveVoice(sentence)).length;
}

const PLAIN_ENGLISH_BLOCKLIST = [
  "utilize",
  "leverage",
  "facilitate",
  "comprehensive",
  "methodology",
  "synergy",
  "endeavor",
  "commence",
  "subsequently",
  "prioritize",
  "implementation",
  "strategic",
  "innovative",
  "multifaceted",
  "holistic",
  "paradigm",
  "stakeholder",
  "deliverables",
  "best-in-class",
  "world-class",
];

export function countComplexEnglishWords(value: string): number {
  const normalized = normalizeText(value);
  let hits = 0;

  for (const term of PLAIN_ENGLISH_BLOCKLIST) {
    if (normalized.includes(normalizeText(term))) hits++;
  }

  const words = normalized.split(" ").filter(Boolean);
  hits += words.filter((word) => word.length >= 15).length;
  return hits;
}

export function jaccardSimilarity(a: string, b: string): number {
  const left = new Set(normalizeText(a).split(" ").filter(Boolean));
  const right = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const word of left) {
    if (right.has(word)) intersection++;
  }
  return intersection / (left.size + right.size - intersection);
}

export function hasDuplicateTexts(texts: string[], threshold = 0.88): boolean {
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const left = texts[i] ?? "";
      const right = texts[j] ?? "";
      if (
        normalizeText(left) === normalizeText(right) ||
        jaccardSimilarity(left, right) >= threshold
      ) {
        return true;
      }
    }
  }
  return false;
}

export function parseLocationParts(location: string): {
  district: string;
  city: string;
  region: string;
  country: string;
} {
  const segments = location
    .split(/[,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    return { district: "", city: "", region: "", country: "" };
  }

  const normalized = segments.map(normalizeText);
  const usStates = new Set([
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia",
    "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
    "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt",
    "va", "wa", "wv", "wi", "wy",
  ]);
  const countries = new Set([
    "uk", "uae", "usa", "us", "canada", "australia", "ireland", "germany", "france", "spain",
    "italy", "poland", "ukraine", "united kingdom", "united states",
  ]);

  const isRegionOrCountry = (value: string) =>
    usStates.has(value) || countries.has(value) || value.length >= 4;

  if (segments.length === 1) {
    return { district: "", city: normalized[0] ?? "", region: "", country: "" };
  }

  if (segments.length === 2) {
    const second = normalized[1] ?? "";
    if (isRegionOrCountry(second)) {
      return {
        district: "",
        city: normalized[0] ?? "",
        region: usStates.has(second) ? second : "",
        country: countries.has(second) ? second : second,
      };
    }
    return {
      district: "",
      city: normalized[0] ?? "",
      region: second,
      country: "",
    };
  }

  const last = normalized[normalized.length - 1] ?? "";
  return {
    district: normalized[0] ?? "",
    city: normalized[1] ?? normalized[0] ?? "",
    region: normalized.length > 3 ? normalized[2] ?? "" : "",
    country: last,
  };
}

export function mentionsLocationTerm(text: string, term: string): boolean {
  const needle = normalizeText(term);
  if (!needle || needle.length < 2) return false;
  return normalizeText(text).includes(needle);
}

export function mentionsCity(text: string, location: string): boolean {
  const { city } = parseLocationParts(location);
  if (!city || city.length < 3) return false;
  if (mentionsLocationTerm(text, city)) return true;

  const cityWords = city.split(" ").filter((word) => word.length >= 4);
  return cityWords.some((word) => mentionsLocationTerm(text, word));
}

export function mentionsDistrict(text: string, location: string): boolean {
  const { district } = parseLocationParts(location);
  if (!district || district.length < 3) return false;
  return mentionsLocationTerm(text, district);
}

export function mentionsRegionOrCountry(text: string, location: string): boolean {
  const { region, country } = parseLocationParts(location);
  const targets = [region, country].filter((part) => part.length >= 2);
  return targets.some((part) => mentionsLocationTerm(text, part));
}

export function clampReviewScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function collectTextBlob(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join("\n");
}
