import type { LayoutDefinition } from "../types";

/** Default local-service skeleton. */
export const genericLayout = {
  id: "generic",
  name: "Local Service",
  industries: ["general", "local", "service", "business"],
  sections: [
    { id: "hero", label: "Hero" },
    { id: "trust", label: "Trust" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ],
  stickyCTA: true,
  floatingPhone: false,
  heroVariant: "B",
  rationale: [
    "Balanced local-service flow: trust, offers, proof, then contact.",
  ],
} as const satisfies LayoutDefinition;
