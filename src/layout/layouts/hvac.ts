import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** HVAC layout — comfort, seasonal service, and credentials first. */
export const hvac = {
  id: "hvac-modern",
  name: "HVAC",
  industry: [
    "hvac",
    "heating",
    "cooling",
    "air conditioning",
    "furnace",
    "heat pump",
    "air con",
    "ac repair",
    "ventilation",
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
    layoutSection("why_us", "About02", {
      required: false,
      priority: 50,
      variants: ["About01", "About02"],
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
  heroVariant: "B",
  rationale: [
    "HVAC sites prioritize licensed comfort checks before seasonal upsells.",
    "Process band answers maintenance vs emergency paths early.",
  ],
} as const satisfies LayoutPreset;
