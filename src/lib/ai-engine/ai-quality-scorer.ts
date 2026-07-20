/**
 * Legacy Quality Reviewer helpers.
 * Layer 8 — QA AI (`./qa-ai`) is the publish gate; these remain for tooling/compat.
 */

import { completeJsonObject } from "./openai-json";
import {
  generateAboutSection,
  generateCtaSection,
  generateHeroSection,
  generateTestimonialsSection,
} from "./content-generator";
import { REVIEWER_SYSTEM, reviewerUser } from "./prompts";
import { generateSeo } from "./seo-generator";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  SeoDraft,
  WebsitePlan,
} from "./types";

export type QualityReason = {
  section: string;
  score: number;
  reason: string;
};

/** Quality Reviewer scores — Website JSON metadata */
export type AiQualityScores = {
  /** Headline quality (0–100) */
  heroScore: number;
  headlineQuality: number;
  seoScore: number;
  trustScore: number;
  ctaScore: number;
  callToAction: number;
  readability: number;
  professionalAppearance: number;
  overall: number;
  /** Reasons for any score < 85 */
  reasons: QualityReason[];
  issues: string[];
  regeneratedSections?: string[];
};

export type QualitySection =
  | "hero"
  | "seo"
  | "trust"
  | "cta"
  | "about"
  | "services"
  | "faq";

const THRESHOLD = 85;

function clampScore(n: unknown, fallback = 70): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function weakSections(scores: AiQualityScores): QualitySection[] {
  const weak: QualitySection[] = [];
  if (scores.headlineQuality < THRESHOLD || scores.heroScore < THRESHOLD) {
    weak.push("hero");
  }
  if (scores.seoScore < THRESHOLD) weak.push("seo");
  if (scores.trustScore < THRESHOLD) weak.push("trust");
  if (scores.callToAction < THRESHOLD || scores.ctaScore < THRESHOLD) {
    weak.push("cta");
  }
  // Readability / professional → refresh About (copy polish)
  if (
    scores.readability < THRESHOLD ||
    scores.professionalAppearance < THRESHOLD
  ) {
    if (!weak.includes("trust")) weak.push("trust");
  }
  return weak;
}

type ReviewerAi = {
  headlineQuality?: number;
  callToAction?: number;
  seo?: number;
  trust?: number;
  readability?: number;
  professionalAppearance?: number;
  overall?: number;
  // legacy aliases
  heroScore?: number;
  seoScore?: number;
  trustScore?: number;
  ctaScore?: number;
  reasons?: { section?: string; score?: number; reason?: string }[];
  issues?: string[];
};

function parseReasons(
  ai: ReviewerAi,
  scores: Omit<
    AiQualityScores,
    "reasons" | "issues" | "regeneratedSections"
  >,
): QualityReason[] {
  const fromAi = (Array.isArray(ai.reasons) ? ai.reasons : [])
    .map((r) => ({
      section: String(r?.section ?? "").trim(),
      score: clampScore(r?.score, 0),
      reason: String(r?.reason ?? "").trim(),
    }))
    .filter((r) => r.section && r.reason && r.score < THRESHOLD);

  if (fromAi.length) return fromAi.slice(0, 12);

  // Derive reasons if model omitted them
  const pairs: [string, number][] = [
    ["headlineQuality", scores.headlineQuality],
    ["callToAction", scores.callToAction],
    ["seo", scores.seoScore],
    ["trust", scores.trustScore],
    ["readability", scores.readability],
    ["professionalAppearance", scores.professionalAppearance],
  ];
  return pairs
    .filter(([, score]) => score < THRESHOLD)
    .map(([section, score]) => ({
      section,
      score,
      reason: `${section} scored ${score} (below ${THRESHOLD})`,
    }));
}

/**
 * Stage 6 — Quality Reviewer (AI)
 * Scores headline / CTA / SEO / trust / readability / professional. JSON only.
 */
export async function scoreWebsiteWithAi(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  seo: SeoDraft,
): Promise<AiQualityScores> {
  try {
    const ai = await completeJsonObject<ReviewerAi>({
      stage: "quality_reviewer",
      userEmail: ctx.options.userEmail,
      temperature: 0.2,
      system: REVIEWER_SYSTEM,
      user: reviewerUser({
        business: ctx.input.businessName,
        city: brief.city,
        niche: brief.niche,
        hero: content.hero,
        about: content.about,
        services: content.services,
        testimonials: content.testimonials,
        faqSample: content.faq.slice(0, 2),
        cta: content.cta,
        seo,
      }),
    });

    const headlineQuality = clampScore(
      ai.headlineQuality ?? ai.heroScore,
    );
    const callToAction = clampScore(ai.callToAction ?? ai.ctaScore);
    const seoScore = clampScore(ai.seo ?? ai.seoScore);
    const trustScore = clampScore(ai.trust ?? ai.trustScore);
    const readability = clampScore(ai.readability);
    const professionalAppearance = clampScore(ai.professionalAppearance);
    const overall = clampScore(
      ai.overall,
      Math.round(
        headlineQuality * 0.2 +
          callToAction * 0.15 +
          seoScore * 0.15 +
          trustScore * 0.15 +
          readability * 0.15 +
          professionalAppearance * 0.2,
      ),
    );

    const base = {
      heroScore: headlineQuality,
      headlineQuality,
      seoScore,
      trustScore,
      ctaScore: callToAction,
      callToAction,
      readability,
      professionalAppearance,
      overall,
    };

    const reasons = parseReasons(ai, base);
    const issues = [
      ...reasons.map((r) => `${r.section} (${r.score}): ${r.reason}`),
      ...(Array.isArray(ai.issues)
        ? ai.issues.map(String).filter(Boolean)
        : []),
    ].slice(0, 12);

    return { ...base, reasons, issues };
  } catch (error) {
    console.warn("Quality Reviewer AI failed:", error);
    return {
      heroScore: 80,
      headlineQuality: 80,
      seoScore: 80,
      trustScore: 80,
      ctaScore: 80,
      callToAction: 80,
      readability: 80,
      professionalAppearance: 80,
      overall: 80,
      reasons: [],
      issues: ["Quality Reviewer unavailable — used fallback scores"],
    };
  }
}

/**
 * Regenerate only the weak section(s). JSON only — never HTML.
 */
export async function regenerateWeakSections(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  content: ContentDraft;
  seo: SeoDraft;
  scores: AiQualityScores;
}): Promise<{
  content: ContentDraft;
  seo: SeoDraft;
  regenerated: string[];
}> {
  const { ctx, brief, plan, scores } = params;
  let { content, seo } = params;
  const c = { ctx, brief, plan };
  const weak = weakSections(scores);
  const regenerated: string[] = [];

  for (const section of weak) {
    try {
      if (section === "hero") {
        content = { ...content, hero: await generateHeroSection(c) };
        regenerated.push("hero");
      } else if (section === "seo") {
        seo = await generateSeo(ctx, brief, content);
        regenerated.push("seo");
      } else if (section === "trust") {
        const about = await generateAboutSection(c);
        const testimonials =
          content.testimonials.some((t) => t.demo === false)
            ? content.testimonials
            : await generateTestimonialsSection(c);
        content = { ...content, about, testimonials };
        regenerated.push("trust");
      } else if (section === "cta") {
        const cta = await generateCtaSection(c, content.hero);
        content = {
          ...content,
          cta,
          hero: {
            ...content.hero,
            primaryCTA: cta.primaryCTA || content.hero.primaryCTA,
            secondaryCTA: cta.secondaryCTA || content.hero.secondaryCTA,
          },
        };
        regenerated.push("cta");
      }
    } catch (error) {
      console.warn(`Regenerate ${section} failed:`, error);
    }
  }

  return { content, seo, regenerated };
}
