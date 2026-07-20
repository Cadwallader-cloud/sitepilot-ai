import type { CroReport } from "../cro";
import { QA_THRESHOLD, type QaReport } from "../qa";
import type { DesignSystem } from "../design-system";
import type { SeoDraft } from "./types";
import type { AiQualityScores } from "./ai-quality-scorer";
import { qaToQualityScores } from "./qa-ai";

/** Fast-path QA card from CRO + SEO — no GPT call. */
export function synthesizeQaReport(params: {
  cro: CroReport;
  seo: SeoDraft;
  design: DesignSystem;
}): { qa: QaReport; quality: AiQualityScores } {
  const { cro, seo, design } = params;
  const seoScore =
    seo.title && seo.description && seo.keywords.length >= 3 ? 90 : 72;
  const designScore = design.theme && design.palette ? 88 : 75;
  const conversion = cro.overallConversion;
  const trust = cro.trustEnough;
  const content = Math.round((cro.willSubmitForm + cro.willCall) / 2);
  const overall = Math.round(
    (seoScore + designScore + conversion + trust + content + 85) / 6,
  );

  const qa: QaReport = {
    design: designScore,
    content,
    trust,
    seo: seoScore,
    mobile: Math.min(92, conversion + 5),
    readability: Math.min(90, content + 4),
    conversion,
    overall,
    sections: {
      hero: Math.round((cro.willCall + cro.willSubmitForm) / 2),
      about: trust,
      services: content,
      faq: 86,
      cta: cro.willSubmitForm,
      seo: seoScore,
    },
    reasons: [],
    issues: cro.blockers.slice(0, 4),
    rewritten: [],
    passed: overall >= QA_THRESHOLD,
  };

  return { qa, quality: qaToQualityScores(qa) };
}
