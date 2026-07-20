/**
 * Layer 8 — QA AI scores (publish gate).
 * Example: Hero 74/100 → auto Rewrite Hero.
 */

export const QA_THRESHOLD = 85;

export type QaDimensionScores = {
  design: number;
  content: number;
  trust: number;
  seo: number;
  mobile: number;
  readability: number;
  conversion: number;
  overall: number;
};

export type QaSectionScores = {
  hero: number;
  about: number;
  services: number;
  faq: number;
  cta: number;
  seo: number;
};

export type QaRewriteTarget =
  | "hero"
  | "about"
  | "services"
  | "faq"
  | "cta"
  | "seo"
  | "design"
  | "conversion";

export type QaReason = {
  section: string;
  score: number;
  reason: string;
};

export type QaReport = QaDimensionScores & {
  sections: QaSectionScores;
  reasons: QaReason[];
  issues: string[];
  /** Sections Crestis auto-rewrote (Hero 74 → Rewrite Hero) */
  rewritten: QaRewriteTarget[];
  /** True when overall ≥ threshold after rewrites */
  passed: boolean;
};

export function clampQaScore(value: unknown, fallback = 70): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Map low scores → rewrite targets (Hero 74 → hero) */
export function qaRewriteTargets(
  dims: QaDimensionScores,
  sections: QaSectionScores,
  threshold = QA_THRESHOLD,
): QaRewriteTarget[] {
  const targets = new Set<QaRewriteTarget>();

  if (sections.hero < threshold) targets.add("hero");
  if (sections.about < threshold) targets.add("about");
  if (sections.services < threshold) targets.add("services");
  if (sections.faq < threshold) targets.add("faq");
  if (sections.cta < threshold) targets.add("cta");
  if (sections.seo < threshold || dims.seo < threshold) targets.add("seo");
  if (dims.design < threshold) targets.add("design");
  if (dims.conversion < threshold) targets.add("conversion");

  // Dimension → section mapping
  if (dims.content < threshold || dims.readability < threshold) {
    if (sections.hero <= sections.about) targets.add("hero");
    else targets.add("about");
  }
  if (dims.trust < threshold) targets.add("about");
  if (dims.mobile < threshold) {
    targets.add("hero");
    targets.add("cta");
  }

  return Array.from(targets);
}
