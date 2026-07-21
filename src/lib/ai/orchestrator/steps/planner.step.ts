/**
 * Step — Website Planner (+ Template Selector + SEO Planner strategy)
 */

import { completeJsonObject } from "../../../ai-engine/openai-json";
import {
  SIMPLE_PLAN_SYSTEM,
  simplePlanUser,
} from "../../../ai-engine/prompts/simple-plan";
import {
  applyTemplateSelection,
  selectTemplate,
} from "../../../ai-engine/template-selector";
import {
  layoutSelectorInputFromPipeline,
  runLayoutSelector,
} from "../../../ai-engine/layout-selector-ai";
import { runSeoPlanner, seoPlanBrief } from "../../../ai-engine/seo-planner";
import { seoMemoryBrief } from "../../../seo-memory";
import type { SiteLayoutSection } from "../../../site-types";
import type { Page, Section } from "../../../website";
import { applyPagesPatch } from "../../../website-ownership";
import {
  planFromAi,
  type PipelineContext,
  type PipelineStep,
  type SimplePlanAi,
} from "../context";

function layoutIdToSectionType(id: SiteLayoutSection["id"]): string {
  if (id === "why_us") return "trust";
  if (id === "menu") return "services";
  return id;
}

function emptySectionData(type: string): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        headline: "",
        subheadline: "",
        primaryCTA: "",
        trustBar: [],
      };
    case "about":
      return { title: "", paragraphs: [], highlights: [] };
    case "services":
      return { items: [] };
    case "faq":
      return { items: [] };
    case "testimonials":
      return { items: [] };
    case "cta":
      return { headline: "", primaryCTA: "", secondaryCTA: "" };
    case "contact":
      return { phone: "", email: "", form: true };
    case "trust":
      return { items: [] };
    case "projects":
      return { items: [] };
    case "gallery":
      return { images: [] };
    default:
      return {};
  }
}

function pagesFromPlan(
  layoutSections: SiteLayoutSection[],
  prior: Page[],
  businessName: string,
  contact: { phone?: string; email?: string; address?: string },
): Page[] {
  const priorHome =
    prior.find((p) => p.id === "home" || p.slug === "/") ?? prior[0];
  const priorByType = new Map(
    (priorHome?.sections ?? []).map((s) => [s.type, s]),
  );

  const sections: Section[] = layoutSections.map((s) => {
    const type = layoutIdToSectionType(s.id);
    const existing = priorByType.get(type);
    if (existing) return { ...existing, id: type, type, enabled: true };
    let data = emptySectionData(type);
    if (type === "contact") {
      data = {
        ...data,
        phone: contact.phone ?? "",
        email: contact.email ?? "",
        address: contact.address,
        form: true,
      };
    }
    return { id: type, type, enabled: true, data };
  });

  // Ensure core bands exist even if planner omitted them
  for (const required of ["hero", "about", "services", "faq", "contact"] as const) {
    if (!sections.some((s) => s.type === required)) {
      sections.push({
        id: required,
        type: required,
        enabled: true,
        data: emptySectionData(required),
      });
    }
  }

  return [
    {
      id: "home",
      slug: "/",
      title: businessName || "Home",
      sections,
    },
  ];
}

export class PlannerStep implements PipelineStep<PipelineContext> {
  id = "planner";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const { meta } = ctx;
    meta.onProgress?.({
      stage: "website_planner",
      label: "Website Planner",
    });

    const planRaw = await completeJsonObject<SimplePlanAi>({
      stage: "website_planner",
      userEmail: meta.options.userEmail,
      maxCompletionTokens: 3072,
      system: SIMPLE_PLAN_SYSTEM,
      user:
        simplePlanUser({
          businessName: meta.input.businessName,
          category: meta.category || meta.industryPack.label || meta.tradeKey,
          location: meta.input.location,
          services: meta.input.services,
          description: meta.input.description || "",
          dnaJson: JSON.stringify(meta.liveDna, null, 2),
          regenerate: meta.options.regenerate,
        }) + `\n\n${meta.industryBrief}\n\n${meta.personalityBrief}`,
    });

    const draftPlan = planFromAi(
      meta.liveDna,
      planRaw,
      meta.industryPack,
      meta.input.location.trim(),
    );

    meta.onProgress?.({
      stage: "layout_selector_ai",
      label: "Layout Selector",
    });
    const layoutSelectorInput = layoutSelectorInputFromPipeline({
      brief: meta.brief,
      brandingTone: meta.personalityBrief,
    });
    const layoutSelection = await runLayoutSelector(layoutSelectorInput, {
      userEmail: meta.options.userEmail,
    });

    meta.onProgress?.({
      stage: "template_selector",
      label: "Template Selector",
    });
    const selection = selectTemplate({
      dna: meta.liveDna,
      tradeKey: meta.industryId !== "general" ? meta.industryId : meta.tradeKey,
      hints: {
        layout: layoutSelection.layout,
        sectionRules: layoutSelection.sectionRules,
        sectionOrder: layoutSelection.sectionOrder,
        template:
          planRaw.template ||
          meta.industryPack.preferredTemplate ||
          draftPlan.template,
        variant: planRaw.variant || draftPlan.variant,
        style: planRaw.style,
        sections: planRaw.sections ?? draftPlan.sections,
      },
    });
    const plan = applyTemplateSelection(draftPlan, selection);

    meta.onProgress?.({
      stage: "seo_planner",
      label: "SEO Planner",
    });
    const seoPlan = await runSeoPlanner({
      businessName: meta.input.businessName,
      industry: meta.category || meta.industryPack.label || meta.tradeKey,
      location: meta.input.location,
      description: meta.input.description || "",
      services: meta.input.services,
      dnaJson: JSON.stringify(meta.liveDna, null, 2),
      city: meta.brief.city,
      niche: meta.brief.niche,
      serviceFocus: meta.brief.serviceFocus,
      industryId: meta.industryId,
      userEmail: meta.options.userEmail,
      seoMemory: meta.options.seoMemory,
    });

    const seoStrategyBrief = seoPlanBrief(seoPlan);
    const memoryBrief = seoMemoryBrief(meta.options.seoMemory);
    const copySeedBrief = [meta.industryBrief, seoStrategyBrief, memoryBrief]
      .filter(Boolean)
      .join("\n\n");

    const pages = pagesFromPlan(
      plan.sections,
      ctx.website.pages,
      ctx.business.name,
      {
        phone: ctx.business.phone,
        email: ctx.business.email,
        address: ctx.business.location,
      },
    );

    const website = applyPagesPatch(
      {
        ...ctx.website,
        crestis: {
          ...ctx.website.crestis,
          stickyCTA: plan.stickyCTA,
          floatingPhone: plan.floatingPhone,
          pageType: plan.pageType,
          template: selection.templateId,
          variant: selection.variant,
          style: plan.style,
          engine: "simple",
        },
        navigation: {
          ...ctx.website.navigation,
          logo: ctx.business.name || ctx.website.navigation.logo,
          cta: plan.ctaStyle || ctx.website.navigation.cta,
        },
      },
      pages,
    );

    return {
      ...ctx,
      website,
      meta: {
        ...meta,
        plan,
        selection,
        templateId: selection.templateId,
        seoPlan,
        copySeedBrief,
        brief: { ...meta.brief, seoPlan },
      },
    };
  }
}

export const plannerStep = new PlannerStep();
