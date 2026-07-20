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
  sectionsFromTemplateLabels,
  templateCopyBrief,
  type TemplateDefinition,
  type TemplateId,
  type TemplateVariant,
} from "../template-library";
import type { SiteLayoutSection } from "../site-types";
import type { WebsitePlan } from "./types";

export type TemplateSelection = {
  templateId: TemplateId;
  variant: TemplateVariant;
  template: TemplateDefinition;
  sections: SiteLayoutSection[];
  /** Injected into Content Generator */
  copyBrief: string;
};

export type TemplateSelectorHints = {
  template?: unknown;
  variant?: unknown;
  style?: unknown;
  sections?: unknown;
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
  const variant = resolveVariant(hints?.variant, template);
  const sections = sectionsFromTemplateLabels(
    hints?.sections ?? template.allowedSections,
    template,
  );

  return {
    templateId,
    variant,
    template,
    sections,
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
    heroApproach: `Template ${selection.templateId} variant ${selection.variant}. ${plan.heroApproach}`,
  };
}
