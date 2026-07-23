import { auditWebsiteWithRules } from "../quality-audit";
import type { GeneratedSite } from "../site-types";
import type {
  ContentDraft,
  EngineContext,
  QualityReview,
  SeoDraft,
} from "./types";

/**
 * Stage 6 — Quality Reviewer
 * Crestis rules review the Website JSON before it hits the renderer.
 * May suggest small copy patches (still data — never HTML).
 */
export function reviewQuality(
  ctx: EngineContext,
  content: ContentDraft,
  seo: SeoDraft,
  design: { theme: GeneratedSite["theme"]; images: GeneratedSite["images"] },
): QualityReview {
  const draftSite: GeneratedSite = {
    businessName: ctx.input.businessName.trim(),
    hero: content.hero,
    about: content.about,
    services: content.services,
    testimonials: content.testimonials.map((t) => ({
      ...t,
      demo: t.demo !== false,
    })),
    faq: content.faq,
    cta: content.cta,
    seo,
    theme: design.theme,
    images: design.images,
    contact: {
      phone: ctx.input.phone.trim() || content.contact.phone,
      email: ctx.input.email.trim() || content.contact.email,
      address: content.contact.address || ctx.input.location.trim(),
    },
  };

  const audit = auditWebsiteWithRules(draftSite, ctx.input.location, {
    category: ctx.input.category,
  });
  const notes = audit.checks
    .filter((c) => c.status !== "pass")
    .map((c) => c.message || `${c.label}: ${c.status}`);

  const patches: QualityReview["patches"] = {};

  // Soft auto-patches — data only
  const city = ctx.input.location.trim();
  if (
    city &&
    !content.hero.headline
      .toLowerCase()
      .includes(city.toLowerCase().split(/\s+/)[0] ?? "")
  ) {
    const heroCheck = audit.checks.find((c) => c.id === "hero");
    if (heroCheck?.status === "warn" || heroCheck?.status === "fail") {
      patches.hero = {
        headline: `${content.hero.headline.replace(/\.$/, "")} in ${city}`,
      };
      notes.push(`Patched hero to include ${city}`);
    }
  }

  if (!seo.keywords.some((k) => k.toLowerCase().includes(city.toLowerCase()))) {
    patches.seo = {
      keywords: [`${city}`, ...seo.keywords].slice(0, 10),
    };
  }

  return {
    score: audit.score,
    passed: audit.score >= 70 && !audit.checks.some((c) => c.status === "fail"),
    notes,
    patches,
  };
}

export function applyQualityPatches(
  content: ContentDraft,
  seo: SeoDraft,
  review: QualityReview,
): { content: ContentDraft; seo: SeoDraft } {
  const nextContent: ContentDraft = {
    ...content,
    hero: { ...content.hero, ...review.patches.hero },
    about: { ...content.about, ...review.patches.about },
    cta: content.cta,
    testimonials: content.testimonials.map((t) => ({
      ...t,
      demo: t.demo !== false,
    })),
    contact: {
      ...content.contact,
    },
  };

  const nextSeo: SeoDraft = {
    ...seo,
    ...review.patches.seo,
    keywords: review.patches.seo?.keywords ?? seo.keywords,
  };

  return { content: nextContent, seo: nextSeo };
}
