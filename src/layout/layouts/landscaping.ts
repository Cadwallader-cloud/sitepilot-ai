import { layoutSection } from "../sections";
import type { LayoutPreset } from "../types";

/** Landscaping layout — outdoor proof and gallery before contact. */
export const landscaping = {
  id: "landscaping-modern",
  name: "Landscaping",
  industry: [
    "landscaping",
    "landscape",
    "lawn care",
    "garden",
    "outdoor living",
    "yard",
    "hardscape",
    "irrigation",
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
    layoutSection("gallery", "Services03", {
      required: false,
      priority: 40,
      variants: ["Services02", "Services03"],
    }),
    layoutSection("projects", "Services03", {
      required: false,
      priority: 50,
      variants: ["Services01", "Services02", "Services03"],
    }),
    layoutSection("about", "About01", {
      required: false,
      priority: 60,
      variants: ["About01", "About02"],
    }),
    layoutSection("testimonials", "About02", {
      required: false,
      priority: 70,
      variants: ["About01", "About02"],
    }),
    layoutSection("faq", "FAQAccordion01", {
      required: false,
      priority: 80,
      variants: ["FAQAccordion01", "FAQGrid01"],
    }),
    layoutSection("contact", "Footer01", {
      required: true,
      priority: 90,
      variants: ["Footer01", "Footer02"],
    }),
  ],
  stickyCTA: true,
  floatingPhone: false,
  heroVariant: "B",
  rationale: [
    "Landscaping sells through outdoor visuals and project proof.",
    "Gallery and portfolio bands reinforce design credibility.",
  ],
} as const satisfies LayoutPreset;
