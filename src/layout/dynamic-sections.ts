import type { GeneratedSite, WebsiteContent } from "@/lib/site-types";
import { visibleTestimonials } from "@/lib/testimonials";
import { sortLayoutSections } from "./sections";
import type { LayoutSection } from "./types";

/** Content availability — optional layout bands drop when false. */
export type LayoutContentSignals = {
  /** Business has review content worth rendering */
  hasTestimonials?: boolean;
  /** Theme / site has gallery images */
  hasGallery?: boolean;
  /** Project portfolio items exist */
  hasProjects?: boolean;
};

export type LayoutContentInput = {
  testimonials?: WebsiteContent["testimonials"];
  galleryImages?: string[];
  projects?: unknown[];
  mode?: "preview" | "live";
};

const OPTIONAL_DYNAMIC_SECTIONS = new Set([
  "testimonials",
  "gallery",
  "projects",
]);

/** Derive signals from generated website JSON. */
export function layoutContentSignalsFromSite(
  site: GeneratedSite,
  mode: "preview" | "live" = "live",
): LayoutContentSignals {
  return layoutContentSignalsFromContent({
    testimonials: site.testimonials,
    galleryImages: site.images?.gallery,
    mode,
  });
}

export function layoutContentSignalsFromContent(
  input: LayoutContentInput,
): LayoutContentSignals {
  const mode = input.mode ?? "live";
  const testimonials = input.testimonials ?? [];
  const reviews =
    mode === "live"
      ? visibleTestimonials(testimonials, "live")
      : testimonials;

  return {
    hasTestimonials: reviews.length > 0,
    hasGallery: (input.galleryImages ?? []).some((src) => src.trim().length > 0),
    hasProjects: (input.projects ?? []).length > 0,
  };
}

export function shouldIncludeDynamicSection(
  sectionId: string,
  signals: LayoutContentSignals,
): boolean {
  if (sectionId === "hero" || sectionId === "contact") return true;

  if (sectionId === "testimonials") {
    return signals.hasTestimonials !== false;
  }
  if (sectionId === "gallery") {
    return signals.hasGallery !== false;
  }
  if (sectionId === "projects") {
    return signals.hasProjects !== false;
  }

  return true;
}

/** Drop optional sections when the business has no content for them. */
export function applyDynamicLayoutSections(
  sections: LayoutSection[],
  signals: LayoutContentSignals,
): LayoutSection[] {
  const filtered = sections.filter((section) => {
    if (section.required) return true;
    if (!OPTIONAL_DYNAMIC_SECTIONS.has(section.id)) return true;
    return shouldIncludeDynamicSection(section.id, signals);
  });

  return sortLayoutSections(filtered);
}

export function applyDynamicSiteSectionIds<T extends { id: string }>(
  sections: readonly T[],
  signals: LayoutContentSignals,
): T[] {
  return sections.filter((section) => shouldIncludeDynamicSection(section.id, signals));
}
