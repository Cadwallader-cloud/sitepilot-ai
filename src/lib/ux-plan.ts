/**
 * Crestis AI Engine V2 — Layer 3 UX Plan
 * Section order / UX only — never website copy.
 */

import type { SiteLayoutSection } from "./site-types";

export type UxPlan = {
  /** Ordered UX sections for the page */
  sections: SiteLayoutSection[];
  /** Short UX rationale (not marketing copy) */
  rationale: string[];
  /** Niche key used for defaults, e.g. restaurant | roofing */
  nicheKey: string;
};

/** Map free-form UX labels → Crestis section ids */
export function mapUxLabelToSection(
  raw: string,
  nicheKey: string,
): SiteLayoutSection | null {
  const label = raw.trim();
  if (!label) return null;
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (key === "hero") return { id: "hero", label: "Hero" };
  if (key === "trust" || key === "why choose us" || key === "why us") {
    return { id: "trust", label: label === "Trust" ? "Trust" : label };
  }
  if (key === "about") return { id: "about", label: "About" };
  if (key === "services" || key === "practice areas") {
    return {
      id: "services",
      label: nicheKey === "lawyer" ? "Practice Areas" : "Services",
    };
  }
  if (key === "menu") return { id: "menu", label: "Menu" };
  if (key === "projects" || key === "portfolio" || key === "work") {
    return { id: "projects", label: "Projects" };
  }
  if (key === "gallery") return { id: "gallery", label: "Gallery" };
  if (key === "testimonials" || key === "reviews") {
    return { id: "testimonials", label: "Testimonials" };
  }
  if (key === "faq") return { id: "faq", label: "FAQ" };
  if (key === "contact" || key === "cta" || key === "book" || key === "reserve") {
    return { id: "contact", label: key === "reserve" ? "Reserve" : "Contact" };
  }
  return null;
}

/**
 * Niche UX defaults — restaurants differ from trades.
 */
export function defaultUxSections(nicheKey: string): SiteLayoutSection[] {
  switch (nicheKey) {
    case "restaurant":
      return [
        { id: "hero", label: "Hero" },
        { id: "menu", label: "Menu" },
        { id: "gallery", label: "Gallery" },
        { id: "trust", label: "Trust" },
        { id: "testimonials", label: "Testimonials" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
      ];
    case "dentist":
      return [
        { id: "hero", label: "Hero" },
        { id: "trust", label: "Trust" },
        { id: "services", label: "Services" },
        { id: "testimonials", label: "Testimonials" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
      ];
    case "lawyer":
      return [
        { id: "hero", label: "Hero" },
        { id: "trust", label: "Trust" },
        { id: "services", label: "Practice Areas" },
        { id: "testimonials", label: "Testimonials" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
      ];
    default:
      // Trades / local services — user example shape
      return [
        { id: "hero", label: "Hero" },
        { id: "trust", label: "Trust" },
        { id: "services", label: "Services" },
        { id: "projects", label: "Projects" },
        { id: "testimonials", label: "Testimonials" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
      ];
  }
}

export function normalizeUxSections(
  raw: unknown,
  nicheKey: string,
): SiteLayoutSection[] {
  const fallback = defaultUxSections(nicheKey);
  const names = Array.isArray(raw)
    ? raw.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const row = item as { label?: string; id?: string; name?: string };
          return String(row.label ?? row.name ?? row.id ?? "").trim();
        }
        return "";
      })
    : [];

  const mapped = names
    .map((n) => mapUxLabelToSection(n, nicheKey))
    .filter((s): s is SiteLayoutSection => Boolean(s));

  // Dedupe by id, keep first occurrence
  const seen = new Set<string>();
  const sections: SiteLayoutSection[] = [];
  for (const s of mapped) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    sections.push(s);
  }

  if (sections.length < 4) return fallback;
  if (!sections.some((s) => s.id === "hero")) {
    sections.unshift({ id: "hero", label: "Hero" });
  }
  if (!sections.some((s) => s.id === "contact")) {
    sections.push({ id: "contact", label: "Contact" });
  }
  return sections;
}
