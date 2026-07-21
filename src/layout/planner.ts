import type { TemplateDefinition } from "@/lib/template-library";
import type { SiteLayoutSection } from "@/lib/site-types";
import { normalizeUxSections } from "@/lib/ux-plan";
import {
  buildLayoutPlan,
  parseAiLayoutSelection,
  resolveLayoutVariant,
  suggestLayoutId,
} from "./engine";
import { getLayout, isLayoutId, normalizeLayoutId } from "./registry";
import type { LayoutId, LayoutPlan, LayoutPlannerInput } from "./types";

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
  const layoutId = hintedLayout ?? suggestLayoutId({
    industry: input.industry,
    industryId: input.industryId,
    tradeKey: input.tradeKey,
  });

  const layout = getLayout(layoutId);
  const hintedSections = normalizeSectionHints(
    input.hints?.sections,
    nicheKey,
    layout.sections,
  );

  const plan = buildLayoutPlan(layoutId, {
    sections: hintedSections,
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

function parseLayoutHint(raw: unknown): LayoutId | null {
  if (typeof raw === "string") {
    return normalizeLayoutId(raw);
  }
  const parsed = parseAiLayoutSelection(raw);
  return parsed?.layout ?? null;
}

function normalizeSectionHints(
  raw: unknown,
  nicheKey: string,
  fallback: readonly SiteLayoutSection[],
): SiteLayoutSection[] {
  if (raw == null) return [...fallback];
  const normalized = normalizeUxSections(raw, nicheKey);
  return normalized.length >= 4 ? normalized : [...fallback];
}

export { planLayout as resolveLayoutPlan };
