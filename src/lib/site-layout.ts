import type { GeneratedSite, SiteLayoutSection } from "./site-types";

const DEFAULT_SECTIONS: SiteLayoutSection[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "CTA" },
];

/** Resolve planner sections for the renderer (legacy sites → default). */
export function getSiteSections(site: GeneratedSite): SiteLayoutSection[] {
  if (site.layout?.sections?.length) return site.layout.sections;
  return DEFAULT_SECTIONS;
}

export function sectionLabel(
  sections: SiteLayoutSection[],
  id: SiteLayoutSection["id"],
  fallback: string,
): string {
  return sections.find((s) => s.id === id)?.label ?? fallback;
}
