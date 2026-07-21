import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Default local-service skeleton. */
export const generic = {
  id: "generic-standard",
  name: "Local Service",
  industry: ["general", "local", "service", "business"],
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
  floatingPhone: false,
  heroVariant: "B",
  rationale: [
    "Balanced local-service flow: trust, offers, proof, then contact.",
  ],
} as const satisfies LayoutPreset;
