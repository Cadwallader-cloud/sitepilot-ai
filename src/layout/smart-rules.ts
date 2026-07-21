import { layoutSection, sortLayoutSections } from "./sections";
import { reorderLayoutSections } from "./reorder";
import type { LayoutId, LayoutSection } from "./types";

export const SMART_RULES_ENGINE_RULE =
  "Layout Engine applies curated industry smart rules — components unchanged, order optimized." as const;

export type SmartSectionInsert = {
  id: string;
  label: string;
  component?: string;
  /** Insert immediately after this section id */
  after: string;
  required?: boolean;
};

/** `after` must appear before `before` in the final order. */
export type SmartOrderConstraint = {
  before: string;
  after: string;
};

export type SmartLayoutRules = {
  inserts?: SmartSectionInsert[];
  constraints?: SmartOrderConstraint[];
};

/** Industry smart rules — auto reorder / insert bands without changing components. */
export const SMART_LAYOUT_RULES: Partial<Record<LayoutId, SmartLayoutRules>> = {
  "restaurant-modern": {
    inserts: [{ id: "cta", label: "Reservation", after: "menu" }],
    constraints: [{ before: "gallery", after: "cta" }],
  },
  "lawyer-modern": {
    constraints: [{ before: "services", after: "trust" }],
  },
  "roofing-modern": {
    inserts: [{ id: "cta", label: "Emergency CTA", after: "hero" }],
  },
};

const SMART_SECTION_LABELS: Partial<Record<LayoutId, Record<string, string>>> = {
  "restaurant-modern": { cta: "Reservation" },
  "roofing-modern": { cta: "Emergency CTA" },
};

export function smartRulesPromptBlock(): string {
  return [
    "SMART RULES — engine applies industry defaults automatically:",
    "- restaurant-modern → Reservation band above Gallery",
    "- lawyer-modern → Trust above Services",
    "- roofing-modern → Emergency CTA immediately after Hero",
    "Explicit sectionOrder from AI overrides smart rules.",
  ].join("\n");
}

export function smartSectionLabel(
  layoutId: LayoutId,
  sectionId: string,
  fallback: string,
): string {
  return SMART_SECTION_LABELS[layoutId]?.[sectionId] ?? fallback;
}

export function getSmartLayoutRules(layoutId: LayoutId): SmartLayoutRules | null {
  return SMART_LAYOUT_RULES[layoutId] ?? null;
}

function applySmartInserts(
  sections: LayoutSection[],
  inserts: readonly SmartSectionInsert[],
): LayoutSection[] {
  let result = [...sections];

  for (const insert of inserts) {
    if (result.some((section) => section.id === insert.id)) continue;

    const anchorIdx = result.findIndex((section) => section.id === insert.after);
    if (anchorIdx === -1) continue;

    const anchor = result[anchorIdx]!;
    const newSection = layoutSection(insert.id, insert.component ?? "Footer01", {
      required: insert.required ?? false,
      priority: anchor.priority + 5,
      variants: ["Footer01", "Footer02"],
    });

    result.splice(anchorIdx + 1, 0, newSection);
  }

  return sortLayoutSections(result);
}

function applySmartConstraints(
  sections: LayoutSection[],
  constraints: readonly SmartOrderConstraint[],
): LayoutSection[] {
  let order = sortLayoutSections(sections).map((section) => section.id);

  for (const { before, after } of constraints) {
    const afterIdx = order.indexOf(after);
    const beforeIdx = order.indexOf(before);
    if (afterIdx === -1 || beforeIdx === -1) continue;
    if (afterIdx >= beforeIdx) {
      order = order.filter((id) => id !== after);
      const nextBeforeIdx = order.indexOf(before);
      if (nextBeforeIdx === -1) continue;
      order.splice(nextBeforeIdx, 0, after);
    }
  }

  return reorderLayoutSections(sections, order);
}

/** Apply industry smart rules — skipped when AI supplies explicit sectionOrder. */
export function applySmartLayoutRules(
  layoutId: LayoutId,
  sections: LayoutSection[],
): LayoutSection[] {
  const rules = getSmartLayoutRules(layoutId);
  if (!rules) return sections;

  let next = sections;
  if (rules.inserts?.length) {
    next = applySmartInserts(next, rules.inserts);
  }
  if (rules.constraints?.length) {
    next = applySmartConstraints(next, rules.constraints);
  }

  return next;
}

export function smartRulePreservedComponents(
  before: LayoutSection[],
  after: LayoutSection[],
): boolean {
  const beforeMap = new Map(before.map((section) => [section.id, section]));
  for (const section of after) {
    const original = beforeMap.get(section.id);
    if (!original) continue;
    if (original.component !== section.component) return false;
    if (original.required !== section.required) return false;
    if (JSON.stringify(original.variants) !== JSON.stringify(section.variants)) {
      return false;
    }
  }
  return true;
}
