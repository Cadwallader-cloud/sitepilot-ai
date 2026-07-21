import type { LayoutSection, SectionRule } from "./types";

export type { SectionRule };

export const SECTION_RULES_ENGINE_RULE =
  "AI may disable optional sections via { section, required: false } — never HTML or markup." as const;

/** Sections AI/planner must never remove. */
export const LOCKED_SECTION_IDS = new Set(["hero", "contact"]);

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

export function sectionRulesPromptBlock(): string {
  return [
    "SECTION RULES — optional overrides only:",
    '- Disable FAQ: { "section": "faq", "required": false }',
    '- Disable Testimonials: { "section": "testimonials", "required": false }',
    '- Disable Gallery: { "section": "gallery", "required": false }',
    "hero and contact are locked — AI cannot disable them.",
    "Never return HTML, components, or nested section markup.",
  ].join("\n");
}

export function parseAiSectionRule(raw: unknown): SectionRule | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { section?: unknown; required?: unknown };
  if (typeof row.section !== "string") return null;
  if (typeof row.required !== "boolean") return null;

  const section = row.section.trim().toLowerCase();
  if (!KNOWN_SECTION_IDS.has(section)) return null;
  if (LOCKED_SECTION_IDS.has(section) && row.required === false) return null;

  return { section, required: row.required };
}

export function parseAiSectionRules(raw: unknown): SectionRule[] {
  if (!Array.isArray(raw)) return [];

  const out: SectionRule[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const rule = parseAiSectionRule(item);
    if (!rule || seen.has(rule.section)) continue;
    seen.add(rule.section);
    out.push(rule);
  }

  return out;
}

/** Merge AI rules onto layout sections (updates required flags). */
export function applySectionRules(
  sections: LayoutSection[],
  rules: readonly SectionRule[],
): LayoutSection[] {
  if (!rules.length) return sections;

  const ruleMap = new Map(rules.map((rule) => [rule.section, rule.required]));

  return sections.map((section) => {
    const override = ruleMap.get(section.id);
    if (override === undefined) return section;
    if (LOCKED_SECTION_IDS.has(section.id)) return section;
    return { ...section, required: override };
  });
}

/** Remove sections explicitly disabled by AI rules (required: false). */
export function filterDisabledSections(
  sections: LayoutSection[],
  rules?: readonly SectionRule[],
): LayoutSection[] {
  if (!rules?.length) return sections;

  const disabled = new Set(
    rules.filter((rule) => rule.required === false).map((rule) => rule.section),
  );

  return sections.filter((section) => {
    if (LOCKED_SECTION_IDS.has(section.id)) return true;
    return !disabled.has(section.id);
  });
}

export function resolveSectionsWithRules(
  sections: LayoutSection[],
  rules?: readonly SectionRule[],
): LayoutSection[] {
  return filterDisabledSections(applySectionRules(sections, rules ?? []), rules);
}
