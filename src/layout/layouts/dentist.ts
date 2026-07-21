import type { LayoutDefinition } from "../types";

/** Medical layout — calm trust before booking. */
export const dentistLayout = {
  id: "dentist",
  name: "Dentist",
  industries: [
    "dentist",
    "dental",
    "orthodont",
    "teeth",
    "tooth",
    "smile clinic",
    "oral care",
  ],
  sections: [
    { id: "hero", label: "Hero" },
    { id: "trust", label: "Trust" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Book" },
  ],
  stickyCTA: true,
  floatingPhone: false,
  heroVariant: "B",
  rationale: [
    "Healthcare sites prioritize reassurance and clear services.",
    "FAQ answers insurance and first-visit anxiety early.",
  ],
} as const satisfies LayoutDefinition;
