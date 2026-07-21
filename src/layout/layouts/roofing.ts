import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Trades layout — proof of work before contact. */
export const roofing = {
  id: "roofing-modern",
  name: "Roofing Trade",
  industry: [
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
    layoutSection("hero", "Hero03", {
      required: true,
      priority: 10,
      variants: ["Hero01", "Hero02", "Hero03", "Hero04", "Hero05"],
    }),
    layoutSection("trust", "About01", {
      required: true,
      priority: 20,
      variants: ["About01", "About02"],
    }),
    layoutSection("services", "Services02", {
      required: true,
      priority: 30,
      variants: ["Services01", "Services02", "Services03"],
    }),
    layoutSection("about", "About01", {
      required: false,
      priority: 40,
      variants: ["About01", "About02"],
    }),
    layoutSection("projects", "Services03", {
      required: false,
      priority: 50,
      variants: ["Services01", "Services02", "Services03"],
    }),
    layoutSection("testimonials", "About02", {
      required: false,
      priority: 60,
      variants: ["About01", "About02"],
    }),
    layoutSection("faq", "FAQAccordion01", {
      required: false,
      priority: 70,
      variants: ["FAQAccordion01", "FAQGrid01"],
    }),
    layoutSection("contact", "Footer01", {
      required: true,
      priority: 80,
      variants: ["Footer01", "Footer02"],
    }),
  ],
  stickyCTA: true,
  floatingPhone: true,
  heroVariant: "A",
  rationale: [
    "Trades need trust and proof of work before contact.",
    "Projects band supports storm and repair credibility.",
  ],
} as const satisfies LayoutPreset;
