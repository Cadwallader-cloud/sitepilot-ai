import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Hospitality layout — atmosphere and booking first. */
export const restaurant = {
  id: "restaurant-modern",
  name: "Restaurant",
  industry: [
    "restaurant",
    "bistro",
    "diner",
    "eatery",
    "kitchen",
    "grill",
    "dining",
    "brunch",
    "pizza",
    "cafe",
  ],
  sections: [
    layoutSection("hero", "Hero03", {
      required: true,
      priority: 10,
      variants: ["Hero01", "Hero02", "Hero03", "Hero04", "Hero05"],
    }),
    layoutSection("about", "About01", {
      required: true,
      priority: 20,
      variants: ["About01", "About02"],
    }),
    layoutSection("menu", "Services02", {
      required: true,
      priority: 30,
      variants: ["Services01", "Services02"],
    }),
    layoutSection("gallery", "Services03", {
      required: false,
      priority: 40,
      variants: ["Services02", "Services03"],
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
  heroVariant: "A",
  rationale: [
    "Food businesses lead with atmosphere and menu highlights.",
    "Gallery reinforces room and plating before social proof.",
  ],
} as const satisfies LayoutPreset;
