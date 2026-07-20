/**
 * Layer 7 — CRO AI output (conversion only — never beauty / HTML).
 */

export type CroScores = {
  /** Likelihood a visitor taps Call / phone CTA */
  willCall: number;
  /** Likelihood they take a lead action (quote / form / book) */
  willSubmitForm: number;
  /** Perceived trust before acting */
  trustEnough: number;
  /** Overall conversion readiness */
  overallConversion: number;
};

export type CroPatches = {
  hero?: {
    primaryCTA?: string;
    secondaryCTA?: string;
    subheadline?: string;
  };
  cta?: {
    headline?: string;
    primaryCTA?: string;
    secondaryCTA?: string;
  };
  about?: {
    /** Short trust opener — not a full rewrite unless needed */
    text?: string;
  };
};

export type CroReport = CroScores & {
  blockers: string[];
  /** What CRO changed */
  patched: string[];
  patches: CroPatches;
  /** One-line CRO verdict */
  verdict: string;
};

export function clampCroScore(value: unknown, fallback = 70): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function croNeedsWork(scores: CroScores, threshold = 85): boolean {
  return (
    scores.willCall < threshold ||
    scores.willSubmitForm < threshold ||
    scores.trustEnough < threshold ||
    scores.overallConversion < threshold
  );
}
