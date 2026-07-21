import type { SiteLayoutSection } from "@/lib/site-types";
import {
  type TemplateDefinition,
  type TemplateSectionLabel,
  type TemplateVariant,
  isTemplateVariant,
  resolveVariant,
} from "@/lib/template-library";
import { layoutSection, sortLayoutSections } from "./sections";
import {
  applyDynamicLayoutSections,
  type LayoutContentSignals,
} from "./dynamic-sections";
import {
  resolveSectionsWithRules,
  type SectionRule,
} from "./section-rules";
import { reorderLayoutSections } from "./reorder";
import { applySmartLayoutRules, smartSectionLabel } from "./smart-rules";
import {
  parseAiLayoutSelection,
  parseAiLayoutSelectionOrThrow,
} from "./parse-ai-layout";
import {
  getLayout,
  isLayoutId,
  LayoutRegistry,
  normalizeLayoutId,
} from "./registry";
import type { AiLayoutSelection, LayoutId, LayoutPlan, LayoutPreset, LayoutSection } from "./types";

export { parseAiLayoutSelection, parseAiLayoutSelectionOrThrow };

export const LAYOUT_ENGINE_RULE =
  "AI returns { layout: preset id } only — never HTML, markup, CSS, or section structure." as const;

const SECTION_ID_TO_LABEL: Record<string, TemplateSectionLabel> = {
  hero: "Hero",
  trust: "Trust",
  services: "Services",
  why_us: "Process",
  about: "About",
  projects: "Projects",
  gallery: "Gallery",
  menu: "Menu",
  testimonials: "Testimonials",
  faq: "FAQ",
  contact: "Contact",
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  trust: "Trust",
  services: "Services",
  why_us: "Why Us",
  about: "About",
  projects: "Projects",
  gallery: "Gallery",
  menu: "Menu",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "CTA",
  contact: "Contact",
};

export function layoutEnginePromptBlock(): string {
  const lines = Object.keys(LayoutRegistry).map((id) => `- ${id}`);
  return [
    "LAYOUT ENGINE — pick exactly ONE layout preset id:",
    ...lines,
    "",
    'Return JSON: { "layout": "roofing-modern" }',
    "Never return HTML, CSS, section markup, or nested layout objects.",
    "Crestis resolves ordered sections, sticky CTA, and hero variant from the preset.",
  ].join("\n");
}

/** Route industry / trade text to the closest curated layout preset. */
export function suggestLayoutId(input: {
  industry?: string;
  industryId?: string;
  tradeKey?: string;
}): LayoutId {
  const text = [
    input.industryId ?? "",
    input.tradeKey ?? "",
    input.industry ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (/roof|shingle|gutter|chimney|slate|tile roof/.test(text)) return "roofing-modern";
  if (/plumb|drain|pipe|boiler|water heater|leak|faucet|blocked drain/.test(text)) {
    return "plumber-modern";
  }
  if (/hvac|heating|cooling|air con|furnace|heat pump|ac repair|ventilation/.test(text)) {
    return "hvac-modern";
  }
  if (/electric|wiring|ev charger|consumer unit|fusebox|panel upgrade|rewire/.test(text)) {
    return "electrician-modern";
  }
  if (/landscap|lawn|garden|outdoor living|yard care|hardscape|irrigation/.test(text)) {
    return "landscaping-modern";
  }
  if (/clean|janitor|maid|housekeeping|janitorial/.test(text)) return "cleaning-modern";
  if (/restaurant|bistro|diner|eatery|kitchen|grill|brunch|pizza|cafe/.test(text)) {
    return "restaurant-modern";
  }
  if (/dentist|dental|orthodont|teeth|tooth|oral|smile clinic/.test(text)) {
    return "dentist-modern";
  }
  if (/lawyer|attorney|legal|law firm|solicitor|litigation|law office/.test(text)) {
    return "lawyer-modern";
  }
  if (/real estate|realtor|estate agent|property agent|homes for sale|listing agent|broker/.test(text)) {
    return "real-estate-modern";
  }
  return "generic-standard";
}

/** Layout Engine — AI picks id; registry resolves the curated bundle. */
export function resolveLayout(data: AiLayoutSelection): LayoutPreset {
  return LayoutRegistry[data.layout];
}

/** Parse AI output → registry lookup (deterministic fallback when invalid). */
export function resolveLayoutFromAi(
  raw: unknown,
  fallback: LayoutId = "generic-standard",
): LayoutPreset {
  const parsed = parseAiLayoutSelection(raw);
  const layoutId = parsed?.layout ?? fallback;
  return LayoutRegistry[layoutId];
}

export function resolveLayoutPreset(id: LayoutId): LayoutPreset {
  return resolveLayout({ layout: id });
}

export function layoutFieldsFromPreset(id: LayoutId): Pick<LayoutPlan, "layoutId"> {
  return { layoutId: id };
}

/** Bridge LayoutSection → SiteLayoutSection for WebsitePlan / renderer. */
export function layoutSectionsToSiteSections(
  sections: LayoutSection[],
  layoutId?: LayoutId,
): SiteLayoutSection[] {
  return sortLayoutSections(sections).map((section) => ({
    id: section.id as SiteLayoutSection["id"],
    label: layoutId
      ? smartSectionLabel(
          layoutId,
          section.id,
          SECTION_LABELS[section.id] ?? section.component,
        )
      : SECTION_LABELS[section.id] ?? section.component,
  }));
}

/** Keep layout order but drop sections the template does not allow. */
export function clampLayoutToTemplate(
  sections: LayoutSection[],
  template: TemplateDefinition,
): LayoutSection[] {
  const allowed = new Set(template.allowedSections);
  const filtered = sections.filter((section) => {
    const label = SECTION_ID_TO_LABEL[section.id];
    return label ? allowed.has(label) : false;
  });

  const seen = new Set<string>();
  const deduped: LayoutSection[] = [];
  for (const section of sortLayoutSections(filtered)) {
    if (seen.has(section.id)) continue;
    seen.add(section.id);
    deduped.push(section);
  }

  if (deduped.length < 4) {
    return sectionsFromTemplateDefaults(template);
  }

  return enforceLayoutEnds(deduped, sections);
}

function sectionsFromTemplateDefaults(
  template: TemplateDefinition,
): LayoutSection[] {
  const out: LayoutSection[] = [];
  let priority = 10;
  for (const label of template.allowedSections) {
    const id = Object.entries(SECTION_ID_TO_LABEL).find(
      ([, value]) => value === label,
    )?.[0];
    if (!id) continue;
    out.push(
      layoutSection(id, undefined, {
        required: id === "hero" || id === "contact" || id === "services" || id === "faq",
        priority,
      }),
    );
    priority += 10;
    if (out.length >= 10) break;
  }
  return enforceLayoutEnds(out, out);
}

function enforceLayoutEnds(
  sections: LayoutSection[],
  fallback: readonly LayoutSection[],
): LayoutSection[] {
  const sorted = sortLayoutSections(sections);
  const byId = new Map(fallback.map((section) => [section.id, section]));
  const middle = sorted.filter((s) => s.id !== "hero" && s.id !== "contact");

  const hero =
    sorted.find((s) => s.id === "hero") ??
    byId.get("hero") ??
    layoutSection("hero", undefined, { required: true, priority: 10 });

  const contact =
    sorted.find((s) => s.id === "contact") ??
    byId.get("contact") ??
    layoutSection("contact", undefined, { required: true, priority: 999 });

  const requiredMissing = fallback.filter(
    (section) =>
      section.required &&
      !sorted.some((existing) => existing.id === section.id) &&
      section.id !== "hero" &&
      section.id !== "contact",
  );

  return sortLayoutSections([
    hero,
    ...middle,
    ...requiredMissing,
    contact,
  ]).slice(0, 12);
}

export function buildLayoutPlan(
  layoutId: LayoutId,
  options?: {
    sections?: LayoutSection[];
    stickyCTA?: boolean;
    floatingPhone?: boolean;
    heroVariant?: TemplateVariant;
    template?: TemplateDefinition;
    rationale?: string[];
    contentSignals?: LayoutContentSignals;
    sectionRules?: SectionRule[];
    sectionOrder?: string[];
  },
): LayoutPlan {
  const layout = resolveLayout({ layout: layoutId });
  const rawSections = options?.sections?.length
    ? options.sections
    : [...layout.sections];
  let sections = options?.template
    ? clampLayoutToTemplate(rawSections, options.template)
    : enforceLayoutEnds(rawSections, layout.sections);

  if (!options?.sectionOrder?.length) {
    sections = applySmartLayoutRules(layoutId, sections);
  }

  if (options?.sectionOrder?.length) {
    sections = reorderLayoutSections(sections, options.sectionOrder);
  }

  if (options?.sectionRules?.length) {
    sections = resolveSectionsWithRules(sections, options.sectionRules);
    sections = enforceLayoutEnds(sections, layout.sections);
  }

  if (options?.contentSignals) {
    sections = applyDynamicLayoutSections(sections, options.contentSignals);
    sections = enforceLayoutEnds(sections, layout.sections);
  }

  return {
    layoutId,
    layout,
    sections,
    siteSections: layoutSectionsToSiteSections(sections, layoutId),
    stickyCTA: options?.stickyCTA ?? layout.stickyCTA,
    floatingPhone: options?.floatingPhone ?? layout.floatingPhone,
    heroVariant: options?.heroVariant ?? layout.heroVariant,
    rationale: options?.rationale ?? [...layout.rationale],
  };
}

export function resolveLayoutVariant(
  raw: unknown,
  layout: LayoutPreset,
  template: TemplateDefinition,
): TemplateVariant {
  if (isTemplateVariant(raw)) return raw;
  return resolveVariant(layout.heroVariant, template);
}

export function layoutUxBrief(plan: LayoutPlan): string {
  return [
    `LAYOUT PRESET: ${plan.layoutId}`,
    `Sections: ${plan.sections.map((s) => `${s.id}(${s.component})`).join(" → ")}`,
    `Sticky CTA: ${plan.stickyCTA ? "yes" : "no"}`,
    `Floating phone: ${plan.floatingPhone ? "yes" : "no"}`,
    `Hero variant hint: ${plan.heroVariant}`,
    ...plan.rationale.map((line) => `- ${line}`),
  ].join("\n");
}

export { isLayoutId, normalizeLayoutId };
