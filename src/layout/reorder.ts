import { layoutSection, sortLayoutSections } from "./sections";
import type { LayoutSection } from "./types";

export const REORDER_ENGINE_RULE =
  "Engine reorders sections by priority only — component, variants, and required flags stay unchanged." as const;

const KNOWN_SECTION_IDS = new Set([
  "hero",
  "trust",
  "services",
  "about",
  "why_us",
  "projects",
  "gallery",
  "menu",
  "testimonials",
  "faq",
  "cta",
  "contact",
]);

export function reorderPromptBlock(): string {
  return [
    "SECTION REORDER — priority only, components unchanged:",
    'Example: ["hero", "services", "about", "faq", "contact"]',
    "hero must stay first, contact must stay last.",
  ].join("\n");
}

/** Parse AI / planner section order hints. */
export function parseSectionOrder(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim().toLowerCase();
    if (!KNOWN_SECTION_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

function enforceReorderEnds(sections: LayoutSection[]): LayoutSection[] {
  const sorted = sortLayoutSections(sections);
  const byId = new Map(sorted.map((section) => [section.id, section]));
  const middle = sorted.filter((s) => s.id !== "hero" && s.id !== "contact");

  const hero =
    byId.get("hero") ??
    layoutSection("hero", undefined, { required: true, priority: 10 });
  const contact =
    byId.get("contact") ??
    layoutSection("contact", undefined, { required: true, priority: 999 });

  let priority = 20;
  const middleWithPriority = middle.map((section) => ({
    ...section,
    priority: priority++,
  }));

  return [
    { ...hero, priority: 10 },
    ...middleWithPriority,
    { ...contact, priority: (middleWithPriority.at(-1)?.priority ?? 20) + 10 },
  ];
}

/**
 * Reorder sections by id list — keeps component + variants + required intact.
 * Unknown ids are ignored; missing sections append in prior priority order.
 */
export function reorderLayoutSections(
  sections: LayoutSection[],
  order: readonly string[],
): LayoutSection[] {
  if (!order.length) return sortLayoutSections(sections);

  const byId = new Map(sections.map((section) => [section.id, section]));
  const used = new Set<string>();
  const reordered: LayoutSection[] = [];
  let priority = 10;

  for (const id of order) {
    const section = byId.get(id);
    if (!section || used.has(id)) continue;
    used.add(id);
    reordered.push({ ...section, priority });
    priority += 10;
  }

  for (const section of sortLayoutSections(sections)) {
    if (used.has(section.id)) continue;
    reordered.push({ ...section, priority });
    priority += 10;
  }

  return enforceReorderEnds(reordered);
}

/** Verify reorder changed order but not component bindings. */
export function reorderPreservedComponents(
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
