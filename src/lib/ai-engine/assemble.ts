import type { ContentReviewReport } from "@/lib/review/content/engine";
import type { BusinessDna } from "../business-dna";
import type { BrandPersonality } from "../brand-personality";
import type { BusinessFormInput } from "../business-form";
import type { CompetitorIntelligence } from "../competitor-intelligence";
import type { CroReport } from "../cro";
import type { FinalScore } from "../final-score";
import type { HumanDetectorReport } from "../human-detector";
import type { QaReport } from "../qa";
import {
  buildSeoMemoryFromSite,
  mergeSeoMemory,
  type SeoMemory,
} from "../seo-memory";
import {
  applyDynamicSiteSectionIds,
  layoutContentSignalsFromContent,
} from "@/layout/dynamic-sections";
import type { UxPlan } from "../ux-plan";
import type { WebsiteJson } from "../website-json";
import type { AiQualityScores } from "./ai-quality-scorer";
import type {
  ContentDraft,
  DesignPlan,
  SeoDraft,
  WebsitePlan,
} from "./types";

/**
 * Assemble the canonical Website JSON.
 * This is what Crestis stores in Supabase — never HTML.
 */
export function assembleWebsiteJson(params: {
  input: BusinessFormInput;
  content: ContentDraft;
  seo: SeoDraft;
  design: DesignPlan;
  plan: WebsitePlan;
  dna?: BusinessDna;
  personality?: BrandPersonality;
  competitors?: CompetitorIntelligence;
  ux?: UxPlan;
  quality?: AiQualityScores;
  cro?: CroReport;
  qa?: QaReport;
  human?: HumanDetectorReport;
  scores?: FinalScore;
  contentReview?: ContentReviewReport;
  previousSeoMemory?: SeoMemory | null;
}): WebsiteJson {
  const {
    input,
    content,
    seo,
    design,
    plan,
    dna,
    personality,
    competitors,
    ux,
    quality,
    cro,
    qa,
    human,
    scores,
    contentReview,
    previousSeoMemory,
  } = params;

  const projects = (design.images.gallery?.length
    ? design.images.gallery
    : [design.images.hero]
  )
    .filter(Boolean)
    .map((image, i) => ({
      title: `Project ${i + 1}`,
      image,
    }));

  const textBlob = [
    content.hero.headline,
    content.hero.subheadline,
    content.about.text,
    ...content.services.map((s) => `${s.title} ${s.description}`),
    ...content.faq.map((f) => `${f.question} ${f.answer}`),
    content.cta.headline,
    content.cta.primaryCTA,
    seo.title,
    seo.description,
    ...(seo.keywords ?? []),
  ].join("\n");

  const freshMemory = buildSeoMemoryFromSite({
    city: input.location.trim(),
    keywords: [
      ...(seo.keywords ?? []),
      ...(seo.entities ?? []),
    ],
    entities: seo.entities ?? [],
    headlines: [content.hero.headline, content.about.title].filter(Boolean),
    ctas: [
      content.hero.primaryCTA,
      content.hero.secondaryCTA,
      content.cta.primaryCTA,
      content.cta.secondaryCTA,
    ].filter(Boolean),
    textBlob,
  });
  const seoMemory = mergeSeoMemory(previousSeoMemory, freshMemory);

  return {
    business: {
      name: input.businessName.trim(),
      location: input.location.trim(),
      category: input.category?.trim() || undefined,
      description: input.description?.trim() || undefined,
      dna,
      personality,
      competitors,
    },
    theme: {
      primary: design.theme.primary,
      accent: design.theme.accent,
      style: design.theme.style,
      ...design.design,
      images: design.images,
    },
    seo,
    hero: content.hero,
    about: content.about,
    services: content.services,
    projects,
    faq: content.faq,
    testimonials: content.testimonials.map((t) => ({
      ...t,
      demo: t.demo !== false,
    })),
    cta: content.cta,
    contact: {
      phone: input.phone.trim() || content.contact.phone,
      email: input.email.trim() || content.contact.email,
      address: content.contact.address || input.location.trim(),
    },
    seoMemory,
    layout: {
      sections: applyDynamicSiteSectionIds(
        plan.sections,
        layoutContentSignalsFromContent({
          testimonials: content.testimonials,
          galleryImages: design.images.gallery,
          projects,
          mode: "preview",
        }),
      ),
      ux: ux
        ? {
            nicheKey: ux.nicheKey,
            rationale: ux.rationale,
          }
        : undefined,
      strategy: {
        style: plan.style,
        template: plan.template,
        variant: plan.variant,
        tone: plan.tone,
        goal: plan.goal,
        targetAudience: plan.targetAudience,
        positioning: plan.positioning,
        trustSignals: plan.trustSignals,
        ctaStrategy: plan.ctaStrategy,
        colorDirection: plan.colorDirection,
        pageType: plan.pageType,
        stickyCTA: plan.stickyCTA,
        floatingPhone: plan.floatingPhone,
        recommendedBlocks: plan.recommendedBlocks,
        removedBlocks: plan.removedBlocks,
        notes: plan.notes,
      },
    },
    quality: quality
      ? {
          heroScore: quality.heroScore,
          headlineQuality: quality.headlineQuality,
          seoScore: quality.seoScore,
          trustScore: quality.trustScore,
          ctaScore: quality.ctaScore,
          callToAction: quality.callToAction,
          readability: quality.readability,
          professionalAppearance: quality.professionalAppearance,
          overall: quality.overall,
          reasons: quality.reasons,
          issues: quality.issues,
          regeneratedSections: quality.regeneratedSections,
        }
      : undefined,
    cro: cro
      ? {
          willCall: cro.willCall,
          willSubmitForm: cro.willSubmitForm,
          trustEnough: cro.trustEnough,
          overallConversion: cro.overallConversion,
          blockers: cro.blockers,
          patched: cro.patched,
          verdict: cro.verdict,
        }
      : undefined,
    qa: qa
      ? {
          design: qa.design,
          content: qa.content,
          trust: qa.trust,
          seo: qa.seo,
          mobile: qa.mobile,
          readability: qa.readability,
          conversion: qa.conversion,
          overall: qa.overall,
          sections: qa.sections,
          reasons: qa.reasons,
          issues: qa.issues,
          rewritten: qa.rewritten,
          passed: qa.passed,
        }
      : undefined,
    human: human
      ? {
          looksAiGenerated: human.looksAiGenerated,
          aiLikelihood: human.aiLikelihood,
          tells: human.tells,
          verdict: human.verdict,
          rewritten: human.rewritten,
          finalLooksAiGenerated: human.finalLooksAiGenerated,
        }
      : undefined,
    scores: scores
      ? {
          quality: scores.quality,
          seo: scores.seo,
          conversion: scores.conversion,
          trust: scores.trust,
          design: scores.design,
          humanScore: scores.humanScore,
        }
      : undefined,
    contentReview: contentReview
      ? {
          final: contentReview.final,
          report: contentReview.report,
          selfHealing: contentReview.selfHealing,
          sections: Object.fromEntries(
            Object.entries(contentReview.sections).map(([id, section]) => [
              id,
              {
                id: section.id,
                label: section.label,
                score: section.score,
                summary: section.summary,
              },
            ]),
          ),
          issues: contentReview.issues,
          strengths: contentReview.strengths,
        }
      : undefined,
  };
}
