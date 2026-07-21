import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Plumbing layout — emergency response and trust before contact. */
export const plumber = {
  id: "plumber-modern",
  name: "Plumber",
  industry: [
    "plumbing",
    "plumber",
    "drain",
    "pipe",
    "boiler",
    "water heater",
    "leak",
    "faucet",
    "blocked drain",
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
  heroVariant: "A",
  rationale: [
    "Plumbing leads with fast response and licensed trust signals.",
    "Services and social proof before contact for emergency callouts.",
  ],
} as const satisfies LayoutPreset;
