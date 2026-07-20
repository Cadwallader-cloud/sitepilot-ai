/**
 * Crestis AI Engine V2 — Layer 4: Copywriting Engine
 * Separate agents. Each gets only the context it needs.
 */

import { CRESTIS_SYSTEM } from "./system";

export const COPYWRITING_ENGINE_RULE = `${CRESTIS_SYSTEM}

You are one specialized agent inside the Crestis Copywriting Engine (Layer 4).
You are NOT a full-site writer.
Other agents handle other sections.
You receive ONLY the context required for YOUR section.
Never write HTML. Return JSON only.`;

export type CopyAgentName =
  | "hero_ai"
  | "about_ai"
  | "service_ai"
  | "faq_ai"
  | "cta_ai"
  | "testimonials_ai";

export const COPY_AGENT_LABELS: Record<CopyAgentName, string> = {
  hero_ai: "Hero AI",
  about_ai: "About AI",
  service_ai: "Service AI",
  faq_ai: "FAQ AI",
  cta_ai: "CTA AI",
  testimonials_ai: "Testimonials AI",
};
