import type { GeneratedSite } from "./site-types";

export type SiteTestimonial = GeneratedSite["testimonials"][number];

/**
 * Demo / preview: show labeled example reviews (demo:true).
 * Live published sites: only real reviews (demo:false). Hide section if none.
 */
export function visibleTestimonials(
  testimonials: SiteTestimonial[] | undefined,
  mode: "preview" | "live",
): SiteTestimonial[] {
  const list = Array.isArray(testimonials) ? testimonials : [];
  if (mode === "preview") return list;
  return list.filter((t) => t.demo === false);
}

export function shouldShowTestimonialsSection(
  testimonials: SiteTestimonial[] | undefined,
  mode: "preview" | "live",
): boolean {
  return visibleTestimonials(testimonials, mode).length > 0;
}
