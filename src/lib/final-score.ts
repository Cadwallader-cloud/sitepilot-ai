/**
 * Layer 10 — Final Score card (publish-facing).
 */

export type FinalScore = {
  quality: number;
  seo: number;
  conversion: number;
  trust: number;
  design: number;
  /** How human the site reads (100 = not AI-smelling) */
  humanScore: number;
};

export function clampFinalScore(value: unknown, fallback = 80): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Overall publish readiness from the six Final Score fields */
export function finalScoreOverall(score: FinalScore): number {
  return Math.round(
    (score.quality +
      score.seo +
      score.conversion +
      score.trust +
      score.design +
      score.humanScore) /
      6,
  );
}
