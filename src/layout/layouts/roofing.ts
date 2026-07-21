import type { LayoutDefinition } from "../types";

/** Trades layout — proof of work before contact. */
export const roofingLayout = {
  id: "roofing",
  name: "Roofing Trade",
  industries: [
    "roofing",
    "roofer",
    "roof",
    "shingle",
    "gutter",
    "chimney",
    "slate roof",
    "tile roof",
  ],
  sections: [
    { id: "hero", label: "Hero" },
    { id: "trust", label: "Trust" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ],
  stickyCTA: true,
  floatingPhone: true,
  heroVariant: "A",
  rationale: [
    "Trades need trust and proof of work before contact.",
    "Projects band supports storm and repair credibility.",
  ],
} as const satisfies LayoutDefinition;
