import { normalizeSeoAiPackage, type SeoAiPackage } from "../seo-package";
import { formatBrandPersonalityBrief } from "../brand-personality";
import { getIndustryPack } from "../industries";
import { seoMemoryBrief } from "../seo-memory";
import { completeJsonObject } from "./openai-json";
import { SEO_AI_SYSTEM, seoAiUser } from "./prompts/seo-ai";
import { seoPlanBrief, type SeoPlan } from "./seo-planner";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  SeoDraft,
  WebsitePlan,
} from "./types";

/**
 * Crestis Final SEO Review v1
 * Runs after Hero / Services / FAQ. Uses SEO Plan + finished content.
 */
export async function runSeoAi(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  plan?: WebsitePlan,
): Promise<SeoDraft> {
  return runFinalSeoReview(ctx, brief, content, plan);
}

export async function runFinalSeoReview(
  ctx: EngineContext,
  brief: BusinessBrief,
  content: ContentDraft,
  plan?: WebsitePlan,
  seoPlan?: SeoPlan,
  reviewFeedback?: string,
): Promise<SeoDraft> {
  const { input, options } = ctx;
  const city = brief.city;
  const niche = brief.niche;
  const pack = getIndustryPack(brief.industryId);
  const activePlan = seoPlan ?? brief.seoPlan;

  const fallbackInputs = {
    businessName: input.businessName,
    city,
    niche,
    heroSubheadline: content.hero.subheadline,
    aboutText: content.about.text,
    phone: input.phone.trim() || content.contact.phone,
    email: input.email.trim() || content.contact.email,
    address: content.contact.address || input.location.trim(),
    serviceTitles: content.services.map((s) => s.title),
  };

  const fallback = () => {
    const base = normalizeSeoAiPackage(null, fallbackInputs);
    if (!activePlan) return base;
    return {
      ...base,
      keywords: [
        activePlan.primaryKeyword,
        ...activePlan.secondaryKeywords,
      ]
        .filter(Boolean)
        .slice(0, 15),
      entities: activePlan.entities,
      slug: activePlan.slug,
      canonical: activePlan.slug,
    };
  };

  const industrySeoBrief =
    pack.id === "general"
      ? undefined
      : [
          `Industry SEO vocab (${pack.label}):`,
          `Primary terms: ${pack.seoVocab.primaryTerms.join(", ")}`,
          `Local modifiers: ${pack.seoVocab.localModifiers.join(", ")}`,
          `Avoid: ${pack.seoVocab.avoid.join(", ")}`,
        ].join("\n");

  const personalityBrief = brief.personality
    ? formatBrandPersonalityBrief(brief.personality)
    : brief.dna.brandPersonality.length
      ? formatBrandPersonalityBrief(brief.dna.brandPersonality)
      : undefined;

  try {
    const ai = await completeJsonObject<Partial<SeoAiPackage>>({
      stage: "seo_ai",
      userEmail: options.userEmail,
      temperature: 0.35,
      maxCompletionTokens: 4096,
      system: SEO_AI_SYSTEM,
      user: seoAiUser({
        businessName: input.businessName,
        city,
        niche,
        phone: fallbackInputs.phone,
        email: fallbackInputs.email,
        address: fallbackInputs.address,
        serviceTitles: fallbackInputs.serviceTitles,
        heroHeadline: content.hero.headline,
        heroSubheadline: content.hero.subheadline,
        faqQuestions: content.faq.map((f) => f.question).slice(0, 6),
        sectionIds: (plan?.sections ?? []).map((s) => s.id),
        primaryGoal: brief.dna?.primaryGoal || plan?.goal,
        industrySeoBrief,
        personalityBrief,
        brandProfileJson: JSON.stringify(brief.dna, null, 2),
        planJson: plan
          ? JSON.stringify(
              {
                template: plan.template,
                goal: plan.goal,
                pageType: plan.pageType,
                sections: plan.sections.map((s) => s.id),
                trustSignals: plan.trustSignals,
              },
              null,
              2,
            )
          : undefined,
        seoPlanBrief: activePlan ? seoPlanBrief(activePlan) : undefined,
        seoMemoryBrief: seoMemoryBrief(options.seoMemory),
      }) + (reviewFeedback?.trim() ? `\n\n${reviewFeedback.trim()}` : ""),
    });

    const packNormalized = normalizeSeoAiPackage(ai, fallbackInputs);
    if (activePlan) {
      if (!packNormalized.entities?.length) {
        packNormalized.entities = activePlan.entities;
      }
      if (!packNormalized.slug) packNormalized.slug = activePlan.slug;
      if (!packNormalized.canonical) {
        packNormalized.canonical = activePlan.slug;
      }
    }

    if (
      packNormalized.title &&
      packNormalized.description &&
      packNormalized.keywords.length >= 3
    ) {
      return packNormalized;
    }
  } catch (error) {
    console.warn("Final SEO Review failed, using Crestis fallback:", error);
  }

  return fallback();
}
