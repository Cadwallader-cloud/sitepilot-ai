import type { SiteLayoutSection } from "@/lib/site-types";
import {
  type TemplateDefinition,
  type TemplateSectionLabel,
  type TemplateVariant,
  isTemplateVariant,
  resolveVariant,
} from "@/lib/template-library";
import { normalizeUxSections } from "@/lib/ux-plan";
import {
  getLayout,
  isLayoutId,
  LayoutRegistry,
  normalizeLayoutId,
} from "./registry";
import type { AiLayoutSelection, LayoutDefinition, LayoutId, LayoutPlan } from "./types";

export const LAYOUT_ENGINE_RULE =
  "AI returns { layout: preset id } only — Layout Engine resolves section order and UX flags." as const;

const SECTION_ID_TO_LABEL: Record<
  SiteLayoutSection["id"],
  TemplateSectionLabel
> = {
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

export function layoutEnginePromptBlock(): string {
  const lines = Object.keys(LayoutRegistry).map((id) => `- ${id}`);
  return [
    "LAYOUT ENGINE — pick exactly ONE layout preset id:",
    ...lines,
    "",
    'Return JSON: { "layout": "<layout-id>" }',
    "Never invent section markup, HTML, or page structure.",
    "Crestis resolves ordered sections, sticky CTA, and hero variant from the preset.",
  ].join("\n");
}

export function parseAiLayoutSelection(raw: unknown): AiLayoutSelection | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { layout?: unknown };
  if (typeof row.layout !== "string") return null;
  const layout = normalizeLayoutId(row.layout);
  if (!layout) return null;
  return { layout };
}

export function parseAiLayoutSelectionOrThrow(raw: unknown): AiLayoutSelection {
  const parsed = parseAiLayoutSelection(raw);
  if (!parsed) {
    throw new Error("Invalid AI layout selection — expected { layout: preset-id }");
  }
  return parsed;
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

  if (/roof|shingle|gutter|chimney|slate|tile roof/.test(text)) return "roofing";
  if (/restaurant|bistro|diner|eatery|kitchen|grill|brunch|pizza|cafe/.test(text)) {
    return "restaurant";
  }
  if (/dentist|dental|orthodont|teeth|tooth|oral|smile clinic/.test(text)) {
    return "dentist";
  }
  return "generic";
}

export function resolveLayoutPreset(id: LayoutId): LayoutDefinition {
  return getLayout(id);
}

export function layoutFieldsFromPreset(id: LayoutId): Pick<LayoutPlan, "layoutId"> {
  return { layoutId: id };
}

/** Keep layout order but drop sections the template does not allow. */
export function clampLayoutToTemplate(
  sections: SiteLayoutSection[],
  template: TemplateDefinition,
): SiteLayoutSection[] {
  const allowed = new Set(template.allowedSections);
  const filtered = sections.filter((section) => {
    const label = SECTION_ID_TO_LABEL[section.id];
    return allowed.has(label);
  });

  const seen = new Set<SiteLayoutSection["id"]>();
  const deduped: SiteLayoutSection[] = [];
  for (const section of filtered) {
    if (seen.has(section.id)) continue;
    seen.add(section.id);
    deduped.push(section);
  }

  if (deduped.length < 4) {
    return sectionsFromTemplateDefaults(template);
  }

  return enforceLayoutEnds(deduped);
}

function sectionsFromTemplateDefaults(
  template: TemplateDefinition,
): SiteLayoutSection[] {
  const out: SiteLayoutSection[] = [];
  for (const label of template.allowedSections) {
    const id = Object.entries(SECTION_ID_TO_LABEL).find(
      ([, value]) => value === label,
    )?.[0] as SiteLayoutSection["id"] | undefined;
    if (!id) continue;
    out.push({ id, label });
    if (out.length >= 10) break;
  }
  return enforceLayoutEnds(out);
}

function enforceLayoutEnds(sections: SiteLayoutSection[]): SiteLayoutSection[] {
  const middle = sections.filter((s) => s.id !== "hero" && s.id !== "contact");
  const hero = sections.find((s) => s.id === "hero") ?? {
    id: "hero" as const,
    label: "Hero",
  };
  const contact = sections.find((s) => s.id === "contact") ?? {
    id: "contact" as const,
    label: "Contact",
  };
  return [hero, ...middle, contact].slice(0, 12);
}

export function buildLayoutPlan(
  layoutId: LayoutId,
  options?: {
    sections?: SiteLayoutSection[];
    stickyCTA?: boolean;
    floatingPhone?: boolean;
    heroVariant?: TemplateVariant;
    template?: TemplateDefinition;
    rationale?: string[];
  },
): LayoutPlan {
  const layout = resolveLayoutPreset(layoutId);
  const rawSections = options?.sections?.length
    ? options.sections
    : [...layout.sections];
  const sections = options?.template
    ? clampLayoutToTemplate(rawSections, options.template)
    : enforceLayoutEnds(rawSections);

  return {
    layoutId,
    layout,
    sections,
    stickyCTA: options?.stickyCTA ?? layout.stickyCTA,
    floatingPhone: options?.floatingPhone ?? layout.floatingPhone,
    heroVariant: options?.heroVariant ?? layout.heroVariant,
    rationale: options?.rationale ?? [...layout.rationale],
  };
}

export function resolveLayoutVariant(
  raw: unknown,
  layout: LayoutDefinition,
  template: TemplateDefinition,
): TemplateVariant {
  if (isTemplateVariant(raw)) return raw;
  return resolveVariant(layout.heroVariant, template);
}

export function layoutUxBrief(plan: LayoutPlan): string {
  return [
    `LAYOUT PRESET: ${plan.layoutId}`,
    `Sections: ${plan.sections.map((s) => s.label).join(" → ")}`,
    `Sticky CTA: ${plan.stickyCTA ? "yes" : "no"}`,
    `Floating phone: ${plan.floatingPhone ? "yes" : "no"}`,
    `Hero variant hint: ${plan.heroVariant}`,
    ...plan.rationale.map((line) => `- ${line}`),
  ].join("\n");
}

export { isLayoutId, normalizeLayoutId };
