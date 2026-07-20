/**
 * Layer 9 — Human Detector
 * Asks: Would this website look AI-generated? YES → Rewrite.
 */

export type HumanDetectorVerdict = "YES" | "NO";

export type HumanDetectorTarget =
  | "hero"
  | "about"
  | "services"
  | "faq"
  | "cta"
  | "seo";

export type HumanDetectorReport = {
  /** Would this website look AI-generated? */
  looksAiGenerated: HumanDetectorVerdict;
  /** 0 = unmistakably human agency · 100 = obvious AI sludge */
  aiLikelihood: number;
  /** What smelled like AI */
  tells: string[];
  /** One-line self-check */
  verdict: string;
  /** Sections Crestis rewrote after YES */
  rewritten: HumanDetectorTarget[];
  /** Final pass after rewrite (may still be YES once) */
  finalLooksAiGenerated: HumanDetectorVerdict;
};

export function clampAiLikelihood(value: unknown, fallback = 50): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function parseHumanVerdict(value: unknown): HumanDetectorVerdict {
  const s = String(value ?? "")
    .trim()
    .toUpperCase();
  if (s === "NO" || s === "FALSE" || s === "0") return "NO";
  if (s === "YES" || s === "TRUE" || s === "1") return "YES";
  // Numeric likelihood fallback handled by caller
  return "YES";
}
