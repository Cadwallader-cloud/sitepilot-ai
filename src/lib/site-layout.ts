import type { GeneratedSite, SiteLayoutSection } from "./site-types";
import {
  applyDynamicSiteSectionIds,
  layoutContentSignalsFromSite,
} from "@/layout/dynamic-sections";

const DEFAULT_SECTIONS: SiteLayoutSection[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "CTA" },
];

/** Resolve planner sections for the renderer (legacy sites → default). */
export function getSiteSections(
  site: GeneratedSite,
  mode: "preview" | "live" = "live",
): SiteLayoutSection[] {
  const base = site.layout?.sections?.length ? site.layout.sections : DEFAULT_SECTIONS;
  const signals = layoutContentSignalsFromSite(site, mode);
  return applyDynamicSiteSectionIds(base, signals);
}

export function sectionLabel(
  sections: SiteLayoutSection[],
  id: SiteLayoutSection["id"],
  fallback: string,
): string {
  return sections.find((s) => s.id === id)?.label ?? fallback;
}
