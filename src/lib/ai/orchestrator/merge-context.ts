/**
 * Pipeline V2 — merge parallel content step forks back into one context.
 */

import type { ContentDraft } from "../../ai-engine/types";
import type { FAQ, Hero, About, Service } from "../../website";
import type { PipelineContext, PipelineLog } from "./context";
import { findHeroData } from "../context/selectors/hero.selector";

const PARALLEL_MERGE_ORDER = ["hero", "about", "services", "faq"] as const;

function homePage(ctx: PipelineContext) {
  return (
    ctx.website.pages.find((p) => p.id === "home" || p.slug === "/") ??
    ctx.website.pages[0]
  );
}

function sectionData<T>(ctx: PipelineContext, type: string): T | null {
  const section = homePage(ctx)?.sections.find((s) => s.type === type);
  return section?.data ? (section.data as T) : null;
}

function mergeHomeSections(
  target: PipelineContext,
  source: PipelineContext,
  types: string[],
): PipelineContext {
  const sourceHome = homePage(source);
  if (!sourceHome) return target;

  return {
    ...target,
    website: {
      ...target.website,
      pages: target.website.pages.map((page) => {
        if (page.id !== "home" && page.slug !== "/") return page;
        return {
          ...page,
          sections: page.sections.map((section) => {
            if (!types.includes(section.type)) return section;
            const replacement = sourceHome.sections.find(
              (s) => s.type === section.type,
            );
            return replacement ? { ...section, data: replacement.data } : section;
          }),
        };
      }),
    },
  };
}

/** Fork context for parallel content steps — callbacks stay shared, logs start empty. */
export function cloneForParallelStep(ctx: PipelineContext): PipelineContext {
  const { onProgress, onEvent, events, promptCache, ...metaRest } = ctx.meta;
  const clonedMeta = structuredClone(metaRest);

  return {
    business: structuredClone(ctx.business),
    branding: structuredClone(ctx.branding),
    website: structuredClone(ctx.website),
    logs: [],
    telemetry: [],
    meta: {
      ...clonedMeta,
      onProgress,
      onEvent,
      events,
      promptCache,
    },
  };
}

/** Build ContentDraft from merged website sections (for SEO / QA). */
export function assembleContentDraftFromContext(
  ctx: PipelineContext,
): ContentDraft {
  const heroData = findHeroData(ctx);
  const aboutData = sectionData<About>(ctx, "about");
  const servicesData = sectionData<{ items?: Service[] }>(ctx, "services");
  const faqData = sectionData<{ items?: FAQ[] }>(ctx, "faq");
  const ctaData = sectionData<ContentDraft["cta"]>(ctx, "cta");
  const contactData = sectionData<ContentDraft["contact"]>(ctx, "contact");
  const testimonialsData = sectionData<{
    items?: ContentDraft["testimonials"];
  }>(ctx, "testimonials");

  const hero: ContentDraft["hero"] = heroData
    ? {
        headline: heroData.headline,
        subheadline: heroData.subheadline,
        primaryCTA: heroData.primaryCTA,
        secondaryCTA: heroData.secondaryCTA ?? "",
        trustBar: heroData.trustBar ?? [],
      }
    : {
        headline: ctx.meta.input.businessName,
        subheadline: ctx.meta.input.description.slice(0, 160),
        primaryCTA: ctx.meta.plan?.ctaStyle || "Get a free quote",
        secondaryCTA: "",
        trustBar: [],
      };

  const about: ContentDraft["about"] = aboutData
    ? {
        title: aboutData.title,
        text:
          aboutData.paragraphs?.join("\n\n") ||
          ctx.meta.input.description,
        paragraphs: aboutData.paragraphs,
        highlights: aboutData.highlights,
      }
    : {
        title: `About ${ctx.meta.input.businessName}`,
        text: ctx.meta.input.description,
        paragraphs: [ctx.meta.input.description],
        highlights: [],
      };

  return {
    hero,
    about,
    services: (servicesData?.items ?? []).map((s) => ({
      title: s.title,
      description: s.description,
      benefits: s.benefits ?? [],
      icon: s.icon ?? "wrench",
      featured: s.featured === true,
    })),
    testimonials: (testimonialsData?.items ?? []).map((t) => ({
      name: t.name,
      text: t.text,
      demo: t.demo !== false,
    })),
    faq: (faqData?.items ?? []).map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    cta: ctaData ?? {
      headline: `Ready to work with ${ctx.meta.input.businessName}?`,
      primaryCTA: hero.primaryCTA,
      secondaryCTA: hero.secondaryCTA || "Call now",
    },
    contact: contactData ?? {
      phone: ctx.meta.input.phone.trim(),
      email: ctx.meta.input.email.trim(),
      address: ctx.meta.input.location.trim(),
    },
  };
}

export function mergeParallelContentResults(
  base: PipelineContext,
  results: Array<{ stepId: string; ctx: PipelineContext; log: PipelineLog }>,
): PipelineContext {
  const byStep = new Map(results.map((r) => [r.stepId, r.ctx]));
  let merged = base;

  for (const stepId of PARALLEL_MERGE_ORDER) {
    const fork = byStep.get(stepId);
    if (!fork) continue;

    if (stepId === "hero") {
      merged = mergeHomeSections(merged, fork, ["hero"]);
      merged = {
        ...merged,
        meta: {
          ...merged.meta,
          engineCtx: fork.meta.engineCtx ?? merged.meta.engineCtx,
          agentCtx: fork.meta.agentCtx ?? merged.meta.agentCtx,
          heroResult: fork.meta.heroResult ?? merged.meta.heroResult,
        },
      };
      continue;
    }

    if (stepId === "about") {
      merged = mergeHomeSections(merged, fork, ["about"]);
      merged = {
        ...merged,
        meta: {
          ...merged.meta,
          aboutResult: fork.meta.aboutResult ?? merged.meta.aboutResult,
        },
      };
      continue;
    }

    if (stepId === "services") {
      merged = mergeHomeSections(merged, fork, [
        "services",
        "testimonials",
        "cta",
        "contact",
      ]);
      merged = {
        ...merged,
        business: fork.business,
        website: { ...merged.website, business: fork.business },
        meta: {
          ...merged.meta,
          brief: fork.meta.brief ?? merged.meta.brief,
          engineCtx: fork.meta.engineCtx ?? merged.meta.engineCtx,
          agentCtx: fork.meta.agentCtx ?? merged.meta.agentCtx,
        },
      };
      continue;
    }

    if (stepId === "faq") {
      merged = mergeHomeSections(merged, fork, ["faq"]);
    }
  }

  const content = assembleContentDraftFromContext(merged);
  merged = {
    ...merged,
    meta: {
      ...merged.meta,
      content,
    },
    logs: [...base.logs, ...results.map((r) => r.log)],
  };

  return merged;
}
