/**
 * Local preview edits — patch GeneratedSite without re-running AI pipeline.
 */

import {
  colorsForPalette,
  normalizeDesignSystem,
  type DesignPaletteName,
} from "../design-system";
import type { GeneratedSite } from "../site-types";
import {
  designSystemFromTemplate,
  getTemplate,
  isTemplateId,
  type TemplateId,
  type TemplateVariant,
} from "../template-library";

export const PREVIEW_PALETTES: DesignPaletteName[] = [
  "Dark Blue",
  "Teal",
  "Clinical Mint",
  "Warm Burgundy",
  "Slate",
  "Forest",
  "Amber Trade",
  "Electric Orange",
];

/** Curated templates for the editor picker (full catalog available via getTemplate) */
export const PREVIEW_TEMPLATES: TemplateId[] = [
  "home-services-trust",
  "construction-premium",
  "construction-modern",
  "electrician-modern",
  "plumber-local",
  "hvac-trust",
  "dentist-premium",
  "medical-clean",
  "restaurant-modern",
  "law-corporate",
  "agency-light",
  "saas-clean",
  "cleaning-local",
  "landscaping-outdoor",
  "local-service-standard",
  "local-service-bold",
];

export function currentTemplateId(site: GeneratedSite): TemplateId {
  const raw = site.layout?.strategy?.template;
  if (isTemplateId(raw)) return raw;
  return "local-service-standard";
}

export function currentVariant(site: GeneratedSite): TemplateVariant {
  const raw = site.layout?.strategy?.variant;
  if (raw === "A" || raw === "B" || raw === "C") return raw;
  return "A";
}

export function patchHero(
  site: GeneratedSite,
  patch: Partial<GeneratedSite["hero"]>,
): GeneratedSite {
  return {
    ...site,
    hero: { ...site.hero, ...patch },
  };
}

export function patchAbout(
  site: GeneratedSite,
  patch: Partial<GeneratedSite["about"]>,
): GeneratedSite {
  const about = { ...site.about, ...patch };
  if (patch.text !== undefined && !patch.paragraphs) {
    about.paragraphs = patch.text.split(/\n\n+/).filter(Boolean);
  }
  return { ...site, about };
}

export function patchCta(
  site: GeneratedSite,
  patch: Partial<NonNullable<GeneratedSite["cta"]>>,
): GeneratedSite {
  const base = site.cta ?? {
    headline: site.hero.headline,
    primaryCTA: site.hero.primaryCTA,
    secondaryCTA: site.hero.secondaryCTA,
  };
  return { ...site, cta: { ...base, ...patch } };
}

export function patchPalette(
  site: GeneratedSite,
  palette: DesignPaletteName,
): GeneratedSite {
  const design = normalizeDesignSystem({
    ...normalizeDesignSystem(site.design),
    palette,
  });
  const colors = colorsForPalette(palette);
  return {
    ...site,
    design,
    theme: {
      ...site.theme,
      primary: colors.primary,
      accent: colors.accent,
    },
  };
}

export function patchTemplate(
  site: GeneratedSite,
  templateId: TemplateId,
  variant?: TemplateVariant,
): GeneratedSite {
  const tpl = getTemplate(templateId);
  const nextVariant = variant ?? currentVariant(site);
  const design = designSystemFromTemplate(templateId);
  const colors = colorsForPalette(design.palette);

  return {
    ...site,
    design,
    theme: {
      ...site.theme,
      primary: colors.primary,
      accent: colors.accent,
    },
    layout: {
      ...site.layout,
      sections: site.layout?.sections ?? [],
      strategy: {
        ...site.layout?.strategy,
        template: templateId,
        variant: nextVariant,
        tone: site.layout?.strategy?.tone ?? tpl.voice,
        goal: site.layout?.strategy?.goal ?? "leads",
        targetAudience: site.layout?.strategy?.targetAudience ?? tpl.bestFor,
        positioning: site.layout?.strategy?.positioning ?? tpl.niche,
        trustSignals: site.layout?.strategy?.trustSignals ?? [],
        ctaStrategy: site.layout?.strategy?.ctaStrategy ?? "Call + form",
        colorDirection: design.palette,
      },
    },
  };
}

export function templateLabel(id: TemplateId): string {
  const tpl = getTemplate(id);
  return `${tpl.niche} · ${tpl.bestFor}`;
}
