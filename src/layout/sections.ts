import type { LayoutSection } from "./types";

/** Default registry component + variants per section id. */
export const SECTION_COMPONENT_DEFAULTS: Record<
  string,
  Pick<LayoutSection, "component" | "variants">
> = {
  hero: {
    component: "Hero03",
    variants: ["Hero01", "Hero02", "Hero03", "Hero04", "Hero05"],
  },
  trust: {
    component: "About01",
    variants: ["About01", "About02"],
  },
  services: {
    component: "Services02",
    variants: ["Services01", "Services02", "Services03"],
  },
  about: {
    component: "About01",
    variants: ["About01", "About02"],
  },
  projects: {
    component: "Services03",
    variants: ["Services01", "Services02", "Services03"],
  },
  gallery: {
    component: "Services03",
    variants: ["Services02", "Services03"],
  },
  menu: {
    component: "Services02",
    variants: ["Services01", "Services02"],
  },
  testimonials: {
    component: "About02",
    variants: ["About01", "About02"],
  },
  faq: {
    component: "FAQAccordion01",
    variants: ["FAQAccordion01", "FAQGrid01"],
  },
  cta: {
    component: "Footer01",
    variants: ["Footer01", "Footer02"],
  },
  contact: {
    component: "Footer01",
    variants: ["Footer01", "Footer02"],
  },
};

export function layoutSection(
  id: string,
  component?: string,
  options?: Partial<Omit<LayoutSection, "id" | "component">>,
): LayoutSection {
  const defaults = SECTION_COMPONENT_DEFAULTS[id];
  return {
    id,
    component: component ?? defaults?.component ?? "About01",
    required: options?.required ?? (id === "hero" || id === "contact"),
    priority: options?.priority ?? 50,
    variants: options?.variants ?? defaults?.variants ?? ["About01"],
  };
}

export function sortLayoutSections(sections: LayoutSection[]): LayoutSection[] {
  return sections.slice().sort((a, b) => a.priority - b.priority);
}
