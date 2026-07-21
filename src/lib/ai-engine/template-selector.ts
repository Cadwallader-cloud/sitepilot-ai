/**
 * Crestis Template Selector
 *
 * Runs AFTER Website Planner.
 * Authoritative pick of template + variant + clamped sections.
 * AI may hint; Crestis resolves against Template Library.
 * Never invents design tokens or HTML.
 */

import type { BusinessDna } from "../business-dna";
import {
  getTemplate,
  resolveTemplateId,
  resolveVariant,
  templateCopyBrief,
  type TemplateDefinition,
  type TemplateId,
  type TemplateVariant,
} from "../template-library";
import { planLayout } from "@/layout/planner";
import type { LayoutId } from "@/layout/types";
import type { SiteLayoutSection } from "../site-types";
import type { WebsitePlan } from "./types";

export type TemplateSelection = {
  templateId: TemplateId;
  variant: TemplateVariant;
  template: TemplateDefinition;
  layoutId: LayoutId;
  sections: SiteLayoutSection[];
  stickyCTA: boolean;
  floatingPhone: boolean;
  /** Injected into Content Generator */
  copyBrief: string;
};

export type TemplateSelectorHints = {
  template?: unknown;
  variant?: unknown;
  style?: unknown;
  sections?: unknown;
  layout?: unknown;
};

/**
 * Select locked template from Brand Profile + planner hints.
 */
export function selectTemplate(params: {
  dna: BusinessDna;
  tradeKey?: string;
  hints?: TemplateSelectorHints;
}): TemplateSelection {
  const { dna, tradeKey, hints } = params;

  const templateId = resolveTemplateId(
    hints?.template || hints?.style || dna.websiteStyle,
    {
      industry: dna.industry,
      tradeKey: tradeKey || `${dna.industry} ${dna.subcategory}`,
      subcategory: dna.subcategory,
      brandPosition: dna.brandPosition,
      tone: dna.tone,
      websiteStyle: dna.websiteStyle,
    },
  );

  const template = getTemplate(templateId);
  const layoutPlan = planLayout({
    industry: dna.industry,
    industryId: tradeKey || dna.industry,
    tradeKey: tradeKey || `${dna.industry} ${dna.subcategory}`,
    template,
    hints: {
      layout: hints?.layout,
      sections: hints?.sections ?? template.allowedSections,
      variant: hints?.variant,
    },
  });
  const variant = resolveVariant(hints?.variant ?? layoutPlan.heroVariant, template);

  return {
    templateId,
    variant,
    template,
    layoutId: layoutPlan.layoutId,
    sections: layoutPlan.sections,
    stickyCTA: layoutPlan.stickyCTA,
    floatingPhone: layoutPlan.floatingPhone,
    copyBrief: templateCopyBrief(templateId, variant),
  };
}

/** Apply Template Selector output onto a WebsitePlan */
export function applyTemplateSelection(
  plan: WebsitePlan,
  selection: TemplateSelection,
): WebsitePlan {
  return {
    ...plan,
    template: selection.templateId,
    variant: selection.variant,
    style: selection.template.styleBucket,
    colorDirection: selection.template.visual.palette,
    sections: selection.sections,
    stickyCTA: selection.stickyCTA,
    floatingPhone: selection.floatingPhone,
    heroApproach: `Layout ${selection.layoutId} · Template ${selection.templateId} variant ${selection.variant}. ${plan.heroApproach}`,
  };
}
