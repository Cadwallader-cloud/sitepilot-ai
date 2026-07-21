import { completeJsonObject } from "./openai-json";
import { formatBrandPersonalityBrief } from "../brand-personality";
import {
  getIndustryFaq,
  getIndustryPack,
  industryFaqBrief,
  industryPackBrief,
} from "../industries";
import {
  ABOUT_SYSTEM,
  aboutUser,
  normalizeAboutFromAi,
  CTA_SYSTEM,
  ctaUser,
  FAQ_SYSTEM,
  faqUser,
  normalizeFaqFromAi,
  HERO_SYSTEM,
  heroUser,
  servicesSystem,
  servicesUser,
  normalizeServicesFromAi,
  TESTIMONIALS_SYSTEM,
  testimonialsUser,
} from "./prompts";
import type {
  BusinessBrief,
  ContentDraft,
  EngineContext,
  WebsitePlan,
} from "./types";

type Ctx = {
  ctx: EngineContext;
  brief: BusinessBrief;
  plan: WebsitePlan;
  contentReviewFeedback?: string;
};

function withContentReviewFeedback(user: string, c: Ctx): string {
  if (!c.contentReviewFeedback?.trim()) return user;
  return `${user}\n\n${c.contentReviewFeedback.trim()}`;
}

/** Clamp AI trustBar to signals already present on Brand Profile */
export function normalizeTrustBar(
  raw: unknown,
  allowed: string[],
): string[] {
  const allow = new Set(
    allowed.map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  const fromAi = Array.isArray(raw)
    ? raw.map(String).map((s) => s.trim()).filter(Boolean)
    : [];

  const matched = fromAi.filter((item) => {
    const key = item.toLowerCase();
    if (allow.has(key)) return true;
    // partial: "Fully Insured" vs "Insured"
    return [...allow].some(
      (a) => key.includes(a) || a.includes(key),
    );
  });

  if (matched.length >= 3) return matched.slice(0, 5);
  // Fall back to Brand Profile trust signals (already validated at DNA stage)
  return allowed.map((s) => s.trim()).filter(Boolean).slice(0, 5);
}

function audienceOf(c: Ctx): string {
  return (
    c.brief.dna.targetAudience.join(", ") ||
    c.plan.targetAudience ||
    `Local customers in ${c.brief.city}`
  );
}

function toneOf(c: Ctx): string {
  return (
    c.brief.personality?.voice ||
    c.brief.dna.tone ||
    c.plan.tone ||
    c.brief.tone
  );
}

function ctaStrategyOf(c: Ctx): string {
  const style = c.brief.personality?.ctaStyle;
  const base =
    c.plan.ctaStrategy ||
    `Primary CTA: ${c.brief.dna.cta}. Secondary goal: ${c.brief.dna.secondaryGoal}.`;
  return style ? `${base} CTA style: ${style}.` : base;
}

function personalityBriefOf(c: Ctx): string | undefined {
  if (c.brief.personality) {
    return formatBrandPersonalityBrief(c.brief.personality);
  }
  if (c.brief.dna.brandPersonality.length) {
    return formatBrandPersonalityBrief(c.brief.dna.brandPersonality);
  }
  return undefined;
}

/**
 * Stage 3a — Hero
 * Isolated input: business + creative hook + owner specifics.
 */
export async function generateHeroSection(c: Ctx): Promise<ContentDraft["hero"]> {
  const avoid = c.ctx.options.previous;
  const ai = await completeJsonObject<Partial<ContentDraft["hero"]>>({
    stage: "copy_hero_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: c.ctx.options.regenerate ? 1.05 : 0.95,
    system: HERO_SYSTEM,
    user: withContentReviewFeedback(
      heroUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      niche: c.brief.niche,
      tone: toneOf(c),
      audience: audienceOf(c),
      ctaStrategy: ctaStrategyOf(c),
      phone: c.ctx.input.phone.trim() || undefined,
      creativeHook: c.plan.heroApproach,
      positioning: c.brief.dna.brandPosition || c.plan.positioning,
      personality: c.brief.dna.brandPersonality.join(", ") || undefined,
      services: c.ctx.input.services.trim().slice(0, 280) || undefined,
      ownerNotes: c.ctx.input.description.trim().slice(0, 280) || undefined,
      forbiddenHeadline: avoid?.headline || avoid?.heroTitle || undefined,
      brandProfileJson: JSON.stringify(c.brief.dna, null, 2),
      planJson: JSON.stringify(
        {
          template: c.plan.template,
          variant: c.plan.variant,
          goal: c.plan.goal,
          sections: c.plan.sections.map((s) => s.label),
          ctaStrategy: c.plan.ctaStrategy,
          trustSignals: c.plan.trustSignals,
          heroApproach: c.plan.heroApproach,
        },
        null,
        2,
      ),
      templateBrief: c.plan.template
        ? `Template: ${c.plan.template} / variant ${c.plan.variant}`
        : undefined,
    }),
      c,
    ),
  });

  const hero = {
    headline: String(ai.headline ?? "").trim(),
    subheadline: String(ai.subheadline ?? "").trim(),
    primaryCTA:
      String(ai.primaryCTA ?? "").trim() || c.brief.dna.cta,
    secondaryCTA:
      String(ai.secondaryCTA ?? "").trim() ||
      `Call ${c.ctx.input.phone.trim()}`,
    trustBar: normalizeTrustBar(
      (ai as { trustBar?: unknown }).trustBar,
      c.brief.dna.trustSignals,
    ),
  };
  if (!hero.headline || !hero.subheadline || !hero.primaryCTA) {
    throw new Error("ENGINE_CONTENT:hero");
  }
  return hero;
}

/** Stage 3b — About (no Hero/FAQ/SEO in prompt) */
export async function generateAboutSection(
  c: Ctx,
): Promise<ContentDraft["about"]> {
  const ai = await completeJsonObject<Partial<ContentDraft["about"]>>({
    stage: "copy_about_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: 0.85,
    system: ABOUT_SYSTEM,
    user: withContentReviewFeedback(
      aboutUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      niche: c.brief.niche,
      tone: toneOf(c),
      audience: audienceOf(c),
      positioning: c.brief.dna.brandPosition || c.plan.positioning || "",
      trustSignals:
        c.brief.dna.trustSignals.length > 0
          ? c.brief.dna.trustSignals
          : c.plan.trustSignals,
      aboutFocus: c.plan.aboutFocus,
      personality: c.brief.dna.brandPersonality.join(", ") || undefined,
      services: c.ctx.input.services.trim().slice(0, 280) || undefined,
      ownerNotes: c.ctx.input.description.trim().slice(0, 280) || undefined,
      whyChooseUs: c.plan.sections.some(
        (s) =>
          s.id === "trust" ||
          s.id === "why_us" ||
          s.label === "Why Choose Us" ||
          s.label === "Trust",
      ),
      forbiddenOpening: c.ctx.options.previous?.aboutText
        ? c.ctx.options.previous.aboutText.slice(0, 160)
        : undefined,
      brandProfileJson: JSON.stringify(c.brief.dna, null, 2),
      planJson: JSON.stringify(
        {
          template: c.plan.template,
          variant: c.plan.variant,
          aboutFocus: c.plan.aboutFocus,
          trustSignals: c.plan.trustSignals,
          positioning: c.plan.positioning,
        },
        null,
        2,
      ),
      advantages: c.brief.dna.advantages,
    }),
      c,
    ),
  });

  const about = normalizeAboutFromAi(ai, "About Us");
  if (about.text.length < 40) throw new Error("ENGINE_CONTENT:about");
  return about;
}

/** Stage 3c — Services Generator v1 (after Service Prioritizer) */
export async function generateServicesSection(
  c: Ctx,
): Promise<ContentDraft["services"]> {
  const pack = getIndustryPack(c.brief.industryId);
  const industryBrief =
    pack.id === "general"
      ? undefined
      : industryPackBrief(pack, c.brief.city);
  const priority = c.brief.servicePriority;

  const ai = await completeJsonObject<{
    services?: unknown[];
  }>({
    stage: "copy_service_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: 0.8,
    maxCompletionTokens: 4096,
    system: servicesSystem({
      isMenu: c.plan.sections.some((s) => s.id === "menu"),
    }),
    user: withContentReviewFeedback(
      servicesUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      niche: c.brief.dna.industry || c.brief.niche,
      tone: toneOf(c),
      serviceFocus: priority?.orderedTitles?.length
        ? priority.orderedTitles
        : c.brief.serviceFocus,
      description: c.ctx.input.description || undefined,
      personalityBrief: personalityBriefOf(c),
      industryBrief,
      brandProfileJson: JSON.stringify(c.brief.dna, null, 2),
      planJson: JSON.stringify(
        {
          template: c.plan.template,
          variant: c.plan.variant,
          goal: c.plan.goal,
          ctaStrategy: c.plan.ctaStrategy,
          serviceCount: c.plan.serviceCount,
          positioning: c.plan.positioning,
        },
        null,
        2,
      ),
      priorityJson: priority
        ? JSON.stringify(
            {
              featured: priority.featured,
              secondary: priority.secondary,
              optional: priority.optional,
            },
            null,
            2,
          )
        : undefined,
    }),
      c,
    ),
  });

  const services = normalizeServicesFromAi(ai.services, priority);
  if (services.length < 1) throw new Error("ENGINE_CONTENT:services");
  // Need at least featured + something for a real section; pad from priority titles if thin
  if (services.length < 3 && priority) {
    const have = new Set(services.map((s) => s.title.toLowerCase()));
    for (const title of priority.orderedTitles) {
      if (have.has(title.toLowerCase())) continue;
      const isFeat = title === priority.featured;
      const isOpt = priority.optional.includes(title);
      services.push({
        title,
        description: isOpt
          ? `Additional ${title.toLowerCase()} for local customers who need it.`
          : `${title} for customers in ${c.brief.city} who need clear, reliable help.`,
        benefits: ["Clear next step", "Local support", "Straightforward process"],
        icon: "check",
        featured: isFeat,
        priority: isFeat ? "featured" : isOpt ? "optional" : "secondary",
      });
      if (services.length >= 3) break;
    }
  }
  if (services.length < 3) throw new Error("ENGINE_CONTENT:services");
  return services;
}

/**
 * Stage 3d — Testimonials
 * Real reviews from business, or demo examples — never sees SEO/FAQ.
 */
export async function generateTestimonialsSection(
  c: Ctx,
): Promise<ContentDraft["testimonials"]> {
  const real = (c.ctx.options.customerTestimonials ?? [])
    .map((t) => ({
      name: String(t.name ?? "").trim(),
      text: String(t.text ?? "").trim(),
      demo: false as const,
    }))
    .filter((t) => t.name && t.text)
    .slice(0, 6);

  if (real.length > 0) return real;

  const allowDemo = c.ctx.options.demoTestimonials !== false;
  if (!allowDemo) return [];

  const ai = await completeJsonObject<{
    testimonials?: { name?: string; text?: string; demo?: boolean }[];
  }>({
    stage: "copy_testimonials_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: 0.9,
    system: TESTIMONIALS_SYSTEM,
    user: testimonialsUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      niche: c.brief.niche,
      audience: audienceOf(c),
      testimonialAngle: c.plan.testimonialAngle,
    }),
  });

  return (Array.isArray(ai.testimonials) ? ai.testimonials : [])
    .map((t) => ({
      name: String(t?.name ?? "").trim(),
      text: String(t?.text ?? "").trim(),
      demo: true as const,
    }))
    .filter((t) => t.name && t.text)
    .slice(0, 3);
}

/** Stage 3e — FAQ Generator v1 (adapt niche FAQ bank → answers) */
export async function generateFaqSection(
  c: Ctx,
): Promise<ContentDraft["faq"]> {
  const pack = getIndustryPack(c.brief.industryId);
  const faqBank = getIndustryFaq(c.brief.industryId);
  const industryBrief =
    pack.id === "general"
      ? undefined
      : industryPackBrief(pack, c.brief.city);
  const faqBankBrief = industryFaqBrief(faqBank, c.brief.city);
  const servicesList =
    c.brief.servicePriority?.orderedTitles?.length
      ? c.brief.servicePriority.orderedTitles
      : c.brief.serviceFocus;

  const ai = await completeJsonObject<{
    faq?: unknown[];
  }>({
    stage: "copy_faq_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: 0.55,
    maxCompletionTokens: 3072,
    system: FAQ_SYSTEM,
    user: withContentReviewFeedback(
      faqUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      niche: c.brief.dna.industry || c.brief.niche,
      faqThemes: faqBank.common_objections,
      personalityBrief: personalityBriefOf(c),
      industryBrief,
      faqBankBrief,
      description: c.ctx.input.description || undefined,
      servicesList,
      brandProfileJson: JSON.stringify(c.brief.dna, null, 2),
      planJson: JSON.stringify(
        {
          template: c.plan.template,
          goal: c.plan.goal,
          ctaStrategy: c.plan.ctaStrategy,
          trustSignals: c.plan.trustSignals,
        },
        null,
        2,
      ),
    }),
      c,
    ),
  });

  const faq = normalizeFaqFromAi(ai.faq, faqBank.common_questions);
  if (faq.length < 6) throw new Error("ENGINE_CONTENT:faq");
  return faq.slice(0, 6);
}

/** Stage 3f — CTA band (business, tone, CTA, audience only) */
export async function generateCtaSection(
  c: Ctx,
  hero?: ContentDraft["hero"],
): Promise<ContentDraft["cta"]> {
  const ai = await completeJsonObject<Partial<ContentDraft["cta"]>>({
    stage: "copy_cta_ai",
    userEmail: c.ctx.options.userEmail,
    temperature: 0.85,
    system: CTA_SYSTEM,
    user: withContentReviewFeedback(
      ctaUser({
      businessName: c.ctx.input.businessName,
      city: c.brief.city,
      tone: toneOf(c),
      audience: audienceOf(c),
      ctaStrategy: ctaStrategyOf(c),
      phone: c.ctx.input.phone.trim() || undefined,
      creativeHook: c.plan.heroApproach,
      heroPrimaryCta: hero?.primaryCTA,
      personalityBrief: personalityBriefOf(c),
    }),
      c,
    ),
  });

  return {
    headline: String(ai.headline ?? "").trim() || hero?.primaryCTA || "Get started",
    primaryCTA:
      String(ai.primaryCTA ?? "").trim() ||
      hero?.primaryCTA ||
      c.brief.dna.cta ||
      "Get a free quote",
    secondaryCTA:
      String(ai.secondaryCTA ?? "").trim() ||
      hero?.secondaryCTA ||
      `Call ${c.ctx.input.phone.trim()}`,
  };
}

