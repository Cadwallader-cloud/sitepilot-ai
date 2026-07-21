/**
 * AI Improve — targeted section polish via Content Review + Retry Engine.
 */

import type { BusinessFormInput } from "../business-form";
import { normalizeBusinessDna } from "../business-dna";
import {
  detectIndustry,
  getIndustryPack,
} from "../industries";
import type { GeneratedSite, SeoBlock } from "../site-types";
import {
  generateHeroSection,
  generateServicesSection,
} from "./content-generator";
import { runContentReviewSelfHealing } from "./content-review-self-healing";
import { runFinalSeoReview } from "./seo-ai";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  EngineRunOptions,
  SeoDraft,
  WebsitePlan,
} from "./types";
import { briefFromDna } from "../ai/orchestrator/context";
import {
  getTemplate,
  resolveTemplateId,
  resolveVariant,
  type TemplateId,
} from "../template-library";
import { reviewContent } from "@/lib/review/content/engine";
import {
  formatHealingFeedback,
  healingReasonsFromSection,
  type ContentReviewHealingTask,
} from "@/lib/review/content/self-healing";
import type {
  ContentReviewInput,
  ContentReviewReport,
  ContentReviewSectionId,
  SectionReview,
} from "@/lib/review/content/types";
import { reviewHero } from "@/lib/review/content/reviewers/hero";
import { reviewServices } from "@/lib/review/content/reviewers/services";
import {
  retry,
  softRetryResult,
} from "../ai/retry/retry";
import {
  heroInputFallback,
  seoInputFallback,
  servicesInputFallback,
} from "../ai/retry/section-fallbacks";
import { servicesForValidation } from "../ai/retry/retryServices";
import { seoForValidation } from "../ai/retry/retrySEO";
import { validateHero, validateSEO, validateServices } from "../validation/validate";
import type { HeroInput } from "../validation/hero";
import type { ServicesSectionInput } from "../validation/services";
import type { SeoInput } from "../validation/seo";

export type ImproveScope = "hero" | "services" | "seo" | "entire";

export type ImproveSiteResult = {
  site: GeneratedSite;
  scope: ImproveScope;
  reviewBefore: ContentReviewReport;
  reviewAfter: ContentReviewReport;
  improvedSections: string[];
  tasks: ContentReviewHealingTask[];
};

type AgentCtx = {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
};

function contentFromSite(site: GeneratedSite): ContentDraft {
  return {
    hero: site.hero,
    about: site.about,
    services: site.services,
    testimonials: site.testimonials,
    faq: site.faq,
    cta: site.cta ?? {
      headline: site.hero.headline,
      primaryCTA: site.hero.primaryCTA,
      secondaryCTA: site.hero.secondaryCTA,
    },
    contact: site.contact,
  };
}

function reviewInputFromContent(
  input: BusinessFormInput,
  content: ContentDraft,
): ContentReviewInput {
  return {
    location: input.location,
    category: input.category,
    hero: content.hero,
    about: content.about,
    services: content.services,
    faq: content.faq,
    cta: content.cta,
    contact: content.contact,
  };
}

function planFromSite(
  site: GeneratedSite,
  input: BusinessFormInput,
  dna: ReturnType<typeof normalizeBusinessDna>,
  pack: ReturnType<typeof getIndustryPack>,
): WebsitePlan {
  const strategy = site.layout?.strategy;
  const templateId = resolveTemplateId(
    strategy?.template ?? pack.preferredTemplate,
    {
      industry: dna.industry,
      tradeKey: pack.id,
      subcategory: dna.subcategory,
      brandPosition: dna.brandPosition,
      tone: dna.tone,
      websiteStyle: dna.websiteStyle,
    },
  );
  const template = getTemplate(templateId as TemplateId);

  return {
    template: templateId,
    variant: resolveVariant(strategy?.variant, template),
    style: template.styleBucket,
    pageType: strategy?.pageType ?? "Business",
    tone: strategy?.tone ?? dna.tone,
    goal: strategy?.goal ?? dna.primaryGoal ?? "Lead",
    targetAudience:
      strategy?.targetAudience ?? dna.targetAudience.join(", ") ?? "Local customers",
    positioning: strategy?.positioning ?? dna.brandPosition,
    trustSignals: strategy?.trustSignals ?? dna.trustSignals,
    ctaStrategy: strategy?.ctaStrategy ?? dna.conversionStrategy,
    colorDirection: strategy?.colorDirection ?? dna.colorDirection,
    sections:
      site.layout?.sections?.length
        ? site.layout.sections
        : [
            { id: "hero", label: "Hero" },
            { id: "services", label: "Services" },
            { id: "about", label: "About" },
            { id: "faq", label: "FAQ" },
            { id: "contact", label: "Contact" },
          ],
    stickyCTA: strategy?.stickyCTA ?? true,
    floatingPhone: strategy?.floatingPhone ?? false,
    recommendedBlocks: strategy?.recommendedBlocks ?? [],
    removedBlocks: strategy?.removedBlocks ?? [],
    notes: strategy?.notes ?? [],
    heroApproach: "Local proof-first hero",
    aboutFocus: "Trust and experience",
    serviceCount: Math.max(site.services.length, 3),
    faqThemes: [],
    ctaStyle: site.hero.primaryCTA,
    testimonialAngle: "Local customers",
  };
}

function buildImproveBundle(
  site: GeneratedSite,
  input: BusinessFormInput,
  options: EngineRunOptions = {},
) {
  const runId = options.runId ?? `improve-${Date.now()}`;
  const tradeHint = [
    input.businessName,
    input.category,
    input.location,
    input.description,
    input.services,
  ]
    .filter(Boolean)
    .join(" ");
  const industryId = detectIndustry(tradeHint);
  const industryPack = getIndustryPack(industryId);
  const dna = normalizeBusinessDna(
    {},
    {
      industry: input.category || industryPack.label,
      location: input.location,
      services: input.services,
    },
  );
  const brief = briefFromDna(input, dna, tradeHint, industryId);
  const plan = planFromSite(site, input, dna, industryPack);
  const content = contentFromSite(site);
  const engineCtx: EngineContext = {
    input,
    options: { ...options, runId },
    runId,
    brief,
    plan,
    content,
  };
  const agentCtx: AgentCtx = { ctx: engineCtx, brief, plan };
  const reviewInput = reviewInputFromContent(input, content);

  return { agentCtx, content, reviewInput, engineCtx, plan, brief };
}

function feedbackForSection(section: SectionReview): string {
  const reasons = healingReasonsFromSection(section);
  if (reasons.length) return formatHealingFeedback(reasons);
  return formatHealingFeedback([
    `Polish ${section.label} — sharper, more local, and more specific.`,
  ]);
}

function seoImproveFeedback(seo: SeoBlock, input: BusinessFormInput): string {
  const issues: string[] = [];
  const city = input.location.split(",")[0]?.trim() ?? input.location.trim();

  if (!seo.title || seo.title.length < 30) {
    issues.push("SEO title is too short");
  }
  if (!seo.description || seo.description.length < 80) {
    issues.push("Meta description is too weak");
  }
  if (!Array.isArray(seo.keywords) || seo.keywords.length < 3) {
    issues.push("Add more local keywords");
  }
  if (city && !seo.title.toLowerCase().includes(city.toLowerCase())) {
    issues.push("Include the city in the SEO title");
  }
  if (!issues.length) {
    issues.push(
      "Strengthen local SEO title, description, and keywords for this niche",
    );
  }
  return formatHealingFeedback(issues);
}

function applyContentToSite(
  site: GeneratedSite,
  content: ContentDraft,
  seo?: SeoDraft,
): GeneratedSite {
  return {
    ...site,
    hero: content.hero,
    about: content.about,
    services: content.services,
    testimonials: content.testimonials,
    faq: content.faq,
    cta: content.cta,
    contact: content.contact,
    seo: seo ? { ...site.seo, ...seo } : site.seo,
  };
}

async function improveHero(
  agentCtx: AgentCtx,
  content: ContentDraft,
  reviewInput: ContentReviewInput,
) {
  const section = reviewContent(reviewInput).sections.hero;
  const feedback = feedbackForSection(section);
  const ctx = { ...agentCtx, contentReviewFeedback: feedback };
  const heroRetry = await retry<HeroInput>(
    () => generateHeroSection(ctx),
    validateHero,
    { module: "Hero", maxAttempts: 3, userEmail: agentCtx.ctx.options.userEmail },
  );
  const heroInput = softRetryResult(
    heroRetry,
    heroInputFallback(
      {
        businessName: agentCtx.ctx.input.businessName,
        category: agentCtx.ctx.input.category,
        location: agentCtx.ctx.input.location,
        services: agentCtx.ctx.input.services,
      },
      content.hero,
    ),
  ).data;

  const nextContent = {
    ...content,
    hero: { ...content.hero, ...heroInput },
  };

  return {
    content: nextContent,
    task: {
      action: "Improve Hero",
      section: "hero" as const,
      score: section.score,
      reasons: healingReasonsFromSection(section),
      status: "completed" as const,
    },
    scoreAfter: reviewHero({
      ...reviewInput,
      hero: nextContent.hero,
    }).score,
  };
}

async function improveServices(
  agentCtx: AgentCtx,
  content: ContentDraft,
  reviewInput: ContentReviewInput,
) {
  const section = reviewContent(reviewInput).sections.services;
  const feedback = feedbackForSection(section);
  const ctx = { ...agentCtx, contentReviewFeedback: feedback };
  const servicesRetry = await retry<ServicesSectionInput>(
    async () => servicesForValidation(await generateServicesSection(ctx)),
    validateServices,
    {
      module: "Services",
      maxAttempts: 3,
      userEmail: agentCtx.ctx.options.userEmail,
    },
  );
  const validated = softRetryResult(
    servicesRetry,
    servicesInputFallback({
      businessName: agentCtx.ctx.input.businessName,
      category: agentCtx.ctx.input.category,
      location: agentCtx.ctx.input.location,
      services: agentCtx.ctx.input.services,
    }, {
      items: content.services.map((s, i) => ({
        title: s.title,
        description: s.description,
        benefits:
          Array.isArray(s.benefits) && s.benefits.length
            ? s.benefits.slice(0, 3)
            : ["Clear pricing", "Reliable work", "Local support"],
        icon: s.icon || "wrench",
        featured: s.featured === true || i === 0,
      })),
    }),
  ).data;

  const nextContent = {
    ...content,
    services: (validated.items ?? content.services).map((item, i) => ({
      ...item,
      benefits:
        Array.isArray(item.benefits) && item.benefits.length
          ? item.benefits.slice(0, 3)
          : ["Clear pricing", "Reliable work", "Local support"],
      icon: item.icon || "wrench",
      featured: item.featured === true || i === 0,
    })),
  };

  return {
    content: nextContent,
    task: {
      action: "Improve Services",
      section: "services" as const,
      score: section.score,
      reasons: healingReasonsFromSection(section),
      status: "completed" as const,
    },
    scoreAfter: reviewServices({
      ...reviewInput,
      services: nextContent.services,
    }).score,
  };
}

async function improveSeo(
  site: GeneratedSite,
  agentCtx: AgentCtx,
  content: ContentDraft,
  reviewInput: ContentReviewInput,
) {
  const feedback = seoImproveFeedback(site.seo, agentCtx.ctx.input);
  const seoRetry = await retry<SeoInput>(
    async () => {
      const draft = await runFinalSeoReview(
        agentCtx.ctx,
        agentCtx.brief,
        content,
        agentCtx.plan,
        agentCtx.brief.seoPlan,
        feedback,
      );
      return seoForValidation(draft);
    },
    validateSEO,
    {
      module: "SEO",
      maxAttempts: 3,
      userEmail: agentCtx.ctx.options.userEmail,
    },
  );
  const seoInput = softRetryResult(
    seoRetry,
    seoInputFallback(
      {
        businessName: agentCtx.ctx.input.businessName,
        category: agentCtx.ctx.input.category,
        location: agentCtx.ctx.input.location,
        services: agentCtx.ctx.input.services,
      },
      site.seo,
    ),
  ).data;

  const seoDraft: SeoDraft = { ...site.seo, ...seoInput };

  return {
    seo: seoDraft,
    task: {
      action: "Improve SEO",
      section: "readability" as ContentReviewSectionId,
      score: reviewContent(reviewInput).final.score,
      reasons: feedback
        .replace(/^Fix these content review issues:\n/, "")
        .split("\n")
        .map((line) => line.replace(/^- /, ""))
        .filter(Boolean),
      status: "completed" as const,
    },
  };
}

export async function runImproveSite(params: {
  site: GeneratedSite;
  input: BusinessFormInput;
  scope: ImproveScope;
  userEmail?: string | null;
}): Promise<ImproveSiteResult> {
  const { site, input, scope, userEmail } = params;
  const bundle = buildImproveBundle(site, input, { userEmail });
  let content = bundle.content;
  const reviewBefore = reviewContent(bundle.reviewInput);
  const tasks: ContentReviewHealingTask[] = [];
  const improvedSections: string[] = [];
  let seoDraft: SeoDraft | undefined;

  if (scope === "hero") {
    const result = await improveHero(bundle.agentCtx, content, bundle.reviewInput);
    content = result.content;
    tasks.push(result.task);
    improvedSections.push("hero");
  } else if (scope === "services") {
    const result = await improveServices(
      bundle.agentCtx,
      content,
      bundle.reviewInput,
    );
    content = result.content;
    tasks.push(result.task);
    improvedSections.push("services");
  } else if (scope === "seo") {
    const result = await improveSeo(
      site,
      bundle.agentCtx,
      content,
      bundle.reviewInput,
    );
    seoDraft = result.seo;
    tasks.push(result.task);
    improvedSections.push("seo");
  } else {
    const healed = await runContentReviewSelfHealing({
      agentCtx: bundle.agentCtx,
      input: bundle.reviewInput,
      content,
      report: reviewBefore,
      maxTasks: 5,
    });
    content = healed.content;
    tasks.push(...healed.selfHealing.tasks);
    improvedSections.push(...healed.selfHealing.regeneratedSections);

    const seoResult = await improveSeo(
      site,
      bundle.agentCtx,
      content,
      reviewInputFromContent(input, content),
    );
    seoDraft = seoResult.seo;
    tasks.push(seoResult.task);
    improvedSections.push("seo");
  }

  const reviewAfter = reviewContent(reviewInputFromContent(input, content));
  const nextSite = applyContentToSite(site, content, seoDraft);

  return {
    site: nextSite,
    scope,
    reviewBefore,
    reviewAfter,
    improvedSections,
    tasks,
  };
}
