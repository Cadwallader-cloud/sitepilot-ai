import {
  clampFinalScore,
  type FinalScore,
} from "../final-score";
import type { CroReport } from "../cro";
import type { HumanDetectorReport } from "../human-detector";
import type { QaReport } from "../qa";
import type { DesignSystem } from "../design-system";
import { completeJsonObject } from "./openai-json";
import { FINAL_SCORE_SYSTEM, finalScoreUser } from "./prompts/final-score";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  SeoDraft,
} from "./types";

/** Crestis baseline from CRO / QA / Human (no GPT). */
export function computeFinalScoreBaseline(params: {
  qa: QaReport;
  cro: CroReport;
  human: HumanDetectorReport;
}): FinalScore {
  const { qa, cro, human } = params;

  const conversion = Math.round(
    (qa.conversion + cro.overallConversion + cro.willCall + cro.willSubmitForm) /
      4,
  );
  const trust = Math.round((qa.trust + cro.trustEnough) / 2);

  // humanScore: invert AI likelihood; reward final NO
  let humanScore = 100 - human.aiLikelihood;
  if (human.finalLooksAiGenerated === "NO") {
    humanScore = Math.max(humanScore, 88);
  } else {
    humanScore = Math.min(humanScore, 72);
  }
  if (human.rewritten.length > 0 && human.finalLooksAiGenerated === "NO") {
    humanScore = Math.max(humanScore, 90);
  }

  return {
    quality: clampFinalScore(qa.overall),
    seo: clampFinalScore(qa.seo),
    conversion: clampFinalScore(conversion),
    trust: clampFinalScore(trust),
    design: clampFinalScore(qa.design),
    humanScore: clampFinalScore(humanScore),
  };
}

function mergeAiScore(
  baseline: FinalScore,
  ai: Partial<FinalScore> | null,
): FinalScore {
  if (!ai) return baseline;

  // AI may nudge ±8 from Crestis baseline — prevents wild swings
  const nudge = (key: keyof FinalScore) => {
    const base = baseline[key];
    const proposed = clampFinalScore(ai[key], base);
    return clampFinalScore(Math.max(base - 8, Math.min(base + 8, proposed)));
  };

  return {
    quality: nudge("quality"),
    seo: nudge("seo"),
    conversion: nudge("conversion"),
    trust: nudge("trust"),
    design: nudge("design"),
    humanScore: nudge("humanScore"),
  };
}

/**
 * Layer 10 — Final Score
 * Returns { quality, seo, conversion, trust, design, humanScore }.
 */
export async function runFinalScore(params: {
  ctx: EngineContext;
  brief: BusinessBrief;
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignSystem;
  qa: QaReport;
  cro: CroReport;
  human: HumanDetectorReport;
}): Promise<FinalScore> {
  const { ctx, brief, content, seo, design, qa, cro, human } = params;
  const baseline = computeFinalScoreBaseline({ qa, cro, human });

  // Regenerate: Crestis baseline is enough — skip another GPT call
  if (ctx.options.regenerate) {
    return baseline;
  }

  try {
    const ai = await completeJsonObject<Partial<FinalScore>>({
      stage: "final_score",
      userEmail: ctx.options.userEmail,
      temperature: 0.15,
      system: FINAL_SCORE_SYSTEM,
      user: finalScoreUser({
        business: ctx.input.businessName,
        city: brief.city,
        niche: brief.niche,
        prior: {
          qa: {
            design: qa.design,
            content: qa.content,
            trust: qa.trust,
            seo: qa.seo,
            mobile: qa.mobile,
            readability: qa.readability,
            conversion: qa.conversion,
            overall: qa.overall,
            sections: qa.sections,
            passed: qa.passed,
            rewritten: qa.rewritten,
          },
          cro: {
            willCall: cro.willCall,
            willSubmitForm: cro.willSubmitForm,
            trustEnough: cro.trustEnough,
            overallConversion: cro.overallConversion,
            verdict: cro.verdict,
          },
          human: {
            looksAiGenerated: human.looksAiGenerated,
            aiLikelihood: human.aiLikelihood,
            finalLooksAiGenerated: human.finalLooksAiGenerated,
            rewritten: human.rewritten,
            tells: human.tells,
            verdict: human.verdict,
          },
          crestisBaseline: baseline,
        },
        snapshot: {
          heroHeadline: content.hero.headline,
          primaryCTA: content.hero.primaryCTA,
          seoTitle: seo.title,
          designTheme: design.theme,
          designPalette: design.palette,
          designFont: design.font,
        },
      }),
    });

    return mergeAiScore(baseline, ai);
  } catch (error) {
    console.warn("Final Score AI failed, using Crestis baseline:", error);
    return baseline;
  }
}
