import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Real estate layout — market trust and listings before agent contact. */
export const realEstate = {
  id: "real-estate-modern",
  name: "Real Estate",
  industry: [
    "real estate",
    "realtor",
    "estate agent",
    "property agent",
    "homes for sale",
    "listing agent",
    "broker",
    "property",
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
  floatingPhone: false,
  heroVariant: "A",
  rationale: [
    "Real estate sites separate buy, sell, and valuation paths early.",
    "Listings and local market proof build agent credibility.",
  ],
} as const satisfies LayoutPreset;
