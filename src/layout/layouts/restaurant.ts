import type { LayoutDefinition } from "../types";

/** Hospitality layout — atmosphere and booking first. */
export const restaurantLayout = {
  id: "restaurant",
  name: "Restaurant",
  industries: [
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
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "menu", label: "Menu" },
    { id: "gallery", label: "Gallery" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Reserve" },
  ],
  stickyCTA: true,
  floatingPhone: false,
  heroVariant: "A",
  rationale: [
    "Food businesses lead with atmosphere and menu highlights.",
    "Gallery reinforces room and plating before social proof.",
  ],
} as const satisfies LayoutDefinition;
