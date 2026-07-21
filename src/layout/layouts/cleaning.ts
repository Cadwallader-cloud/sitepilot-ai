import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Cleaning layout — recurring trust and reviews before booking. */
export const cleaning = {
  id: "cleaning-modern",
  name: "Cleaning",
  industry: [
    "cleaning",
    "cleaner",
    "janitor",
    "maid",
    "house cleaning",
    "office cleaning",
    "commercial cleaning",
    "janitorial",
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
    layoutSection("testimonials", "About02", {
      required: false,
      priority: 50,
      variants: ["About01", "About02"],
    }),
    layoutSection("faq", "FAQAccordion01", {
      required: false,
      priority: 60,
      variants: ["FAQAccordion01", "FAQGrid01"],
    }),
    layoutSection("contact", "Footer01", {
      required: true,
      priority: 70,
      variants: ["Footer01", "Footer02"],
    }),
  ],
  stickyCTA: true,
  floatingPhone: true,
  heroVariant: "B",
  rationale: [
    "Cleaning sites lead with reliability and recurring schedule clarity.",
    "Reviews reinforce trust before quote or booking contact.",
  ],
} as const satisfies LayoutPreset;
