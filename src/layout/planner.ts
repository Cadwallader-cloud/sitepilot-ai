import type { TemplateDefinition } from "@/lib/template-library";
import { normalizeUxSections } from "@/lib/ux-plan";
import {
  buildLayoutPlan,
  parseAiLayoutSelection,
  resolveLayout,
  resolveLayoutVariant,
  suggestLayoutId,
} from "./engine";
import { getLayout, isLayoutId, normalizeLayoutId } from "./registry";
import { layoutSection, sortLayoutSections } from "./sections";
import { parseSectionOrder } from "./reorder";
import { parseAiSectionRules } from "./section-rules";
import type { LayoutId, LayoutPlan, LayoutPlannerInput, LayoutSection, SectionRule } from "./types";

export type PlannedLayout = LayoutPlan & {
  /** UX niche key used when normalizing free-form section hints */
  nicheKey: string;
};

/**
 * Resolve curated layout preset from industry + optional AI hints.
 * AI may suggest section labels; Crestis clamps to the layout + template.
 */
export function planLayout(input: LayoutPlannerInput & {
  template?: TemplateDefinition;
}): PlannedLayout {
  const nicheKey = resolveNicheKey(input);
  const hintedLayout = parseLayoutHint(input.hints?.layout);
  const layoutId = hintedLayout.layoutId ?? suggestLayoutId({
    industry: input.industry,
    industryId: input.industryId,
    tradeKey: input.tradeKey,
  });

  const layout = resolveLayout({ layout: layoutId });
  const sectionRules =
    parseSectionRules(input.hints?.sectionRules) ?? hintedLayout.sectionRules;
  const sectionOrder =
    parseSectionOrderHint(input.hints?.sectionOrder) ?? hintedLayout.sectionOrder;
  const hintedSections = normalizeSectionHints(
    input.hints?.sections,
    nicheKey,
    layout.sections,
  );

  const plan = buildLayoutPlan(layoutId, {
    sections: hintedSections,
    sectionRules,
    sectionOrder,
    stickyCTA: layout.stickyCTA,
    floatingPhone: layout.floatingPhone,
    heroVariant: input.template
      ? resolveLayoutVariant(input.hints?.variant, layout, input.template)
      : layout.heroVariant,
    template: input.template,
    rationale: [...layout.rationale],
  });

  return {
    ...plan,
    nicheKey,
  };
}

function resolveNicheKey(input: LayoutPlannerInput): string {
  const industryId = input.industryId?.trim().toLowerCase();
  if (industryId && isLayoutId(industryId)) return industryId;
  if (industryId) return industryId;
  return suggestLayoutId(input);
}

function parseSectionRules(raw: unknown): SectionRule[] | undefined {
  const rules = parseAiSectionRules(raw);
  return rules.length > 0 ? rules : undefined;
}

function parseSectionOrderHint(raw: unknown): string[] | undefined {
  const order = parseSectionOrder(raw);
  return order.length > 0 ? order : undefined;
}

function parseLayoutHint(raw: unknown): {
  layoutId: LayoutId | null;
  sectionRules?: SectionRule[];
  sectionOrder?: string[];
} {
  if (typeof raw === "string") {
    return { layoutId: normalizeLayoutId(raw) };
  }
  const parsed = parseAiLayoutSelection(raw);
  return {
    layoutId: parsed?.layout ?? null,
    sectionRules: parsed?.sectionRules,
    sectionOrder: parsed?.sectionOrder,
  };
}

function normalizeSectionHints(
  raw: unknown,
  nicheKey: string,
  fallback: readonly LayoutSection[],
): LayoutSection[] {
  if (raw == null) return [...fallback];
  const normalized = normalizeUxSections(raw, nicheKey);
  if (normalized.length < 4) return [...fallback];

  const fallbackById = new Map(fallback.map((section) => [section.id, section]));
  let priority = 10;
  const merged = normalized.map((section) => {
    const base = fallbackById.get(section.id);
    const next = base
      ? { ...base, priority }
      : layoutSection(section.id, undefined, {
          required: section.id === "hero" || section.id === "contact",
          priority,
        });
    priority += 10;
    return next;
  });

  return sortLayoutSections(merged);
}

export { planLayout as resolveLayoutPlan };
