/**
 * Smart Generation Mode — Fast / Balanced / Premium
 *
 * Fast     — minimum AI calls, single attempt, target <30 s
 * Balanced — default pipeline (retries + rules QA)
 * Premium  — full QA, self-healing, benchmark scoring
 */

export type GenerationMode = "fast" | "balanced" | "premium";

export const GENERATION_MODE_DEFAULT: GenerationMode = "balanced";

export type GenerationModeProfile = {
  mode: GenerationMode;
  /** Section validator retries (Hero, About, Services, FAQ, SEO) */
  maxSectionAttempts: number;
  /** Skip Content Review self-healing regenerations */
  skipContentReviewSelfHealing: boolean;
  /** Max sections to auto-regenerate after content review (Premium) */
  maxContentReviewHealingTasks: number;
  /** Use runFinalScore AI benchmark (Premium) vs Crestis baseline only */
  runBenchmarkScoring: boolean;
  /** Skip testimonials + CTA band AI in Services step */
  skipTestimonialsAndCta: boolean;
  jsonValidatorMaxRetries: number;
  /** Product target wall-clock (ms) — observability only */
  targetMaxMs: number;
};

const PROFILES: Record<GenerationMode, GenerationModeProfile> = {
  fast: {
    mode: "fast",
    maxSectionAttempts: 1,
    skipContentReviewSelfHealing: true,
    maxContentReviewHealingTasks: 0,
    runBenchmarkScoring: false,
    skipTestimonialsAndCta: true,
    jsonValidatorMaxRetries: 0,
    targetMaxMs: 30_000,
  },
  balanced: {
    mode: "balanced",
    maxSectionAttempts: 3,
    skipContentReviewSelfHealing: false,
    maxContentReviewHealingTasks: 2,
    runBenchmarkScoring: false,
    skipTestimonialsAndCta: false,
    jsonValidatorMaxRetries: 1,
    targetMaxMs: 70_000,
  },
  premium: {
    mode: "premium",
    maxSectionAttempts: 3,
    skipContentReviewSelfHealing: false,
    maxContentReviewHealingTasks: 4,
    runBenchmarkScoring: true,
    skipTestimonialsAndCta: false,
    jsonValidatorMaxRetries: 2,
    targetMaxMs: 120_000,
  },
};

export function resolveGenerationMode(raw?: string | null): GenerationMode {
  const v = raw?.trim().toLowerCase();
  if (v === "fast" || v === "balanced" || v === "premium") return v;
  return GENERATION_MODE_DEFAULT;
}

export function profileForMode(mode: GenerationMode): GenerationModeProfile {
  return PROFILES[mode];
}

export function resolveGenerationProfile(options?: {
  generationMode?: GenerationMode;
}): GenerationModeProfile {
  return profileForMode(resolveGenerationMode(options?.generationMode));
}
