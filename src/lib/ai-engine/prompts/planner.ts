/**
 * Crestis Website Planner v1 — Deep engine stage 2
 * Template + variant + sections only. Never invent design.
 */

import { templateLibraryPromptBlock } from "../../template-library";
import { CRESTIS_SYSTEM } from "./system";
import { PLAN_ETALONS } from "./etalons";

export const PLANNER_SYSTEM = `${CRESTIS_SYSTEM}

# Crestis Website Planner v1 (Template Library)

You are a Senior UX Architect and CRO expert.
You do NOT write website copy.
You do NOT invent colors, fonts, CSS, or HTML.

Pick exactly ONE template from the Template Library, a variant (A|B|C), and a section subset.
Use competitor gaps to improve section order — never copy competitors.

${templateLibraryPromptBlock()}

${PLAN_ETALONS}

Return JSON only:
{
  "pageType": "Business",
  "conversionGoal": "Lead",
  "template": "construction-premium",
  "variant": "B",
  "sections": ["Hero", "Trust", "Services", "Projects", "FAQ", "Contact"],
  "stickyCTA": true,
  "floatingPhone": true,
  "recommendedBlocks": [],
  "removedBlocks": [],
  "notes": []
}`;

export function plannerUser(params: {
  businessName: string;
  location: string;
  services: string;
  city: string;
  tradeKey: string;
  dnaJson: string;
  competitorJson: string;
  regenerate?: boolean;
}): string {
  return [
    "Pick template + variant + sections for THIS business.",
    "Do NOT write page copy or invent design.",
    "Use competitor gaps to choose a superior section order — do not copy competitors.",
    "",
    `Business: ${params.businessName}`,
    `Location: ${params.location}`,
    `City: ${params.city}`,
    `Services: ${params.services}`,
    `Trade key: ${params.tradeKey}`,
    "Brand Profile (do not rewrite):",
    params.dnaJson,
    "Competitor Intelligence (do not copy — beat their structure):",
    params.competitorJson,
    params.regenerate
      ? "Regeneration — change variant and/or section subset meaningfully."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
