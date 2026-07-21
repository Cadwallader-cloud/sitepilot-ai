/**
 * Layout Selector AI — prompts
 *
 * Input: Industry, Brand Personality, Target Audience
 * Output: { "layout": "<preset-id>" }
 */

import {
  INDUSTRY_LAYOUT_IDS,
  LAYOUT_ENGINE_RULE,
  LAYOUT_IDS,
  layoutEnginePromptBlock,
  reorderPromptBlock,
  sectionRulesPromptBlock,
  smartRulesPromptBlock,
} from "@/layout";
import { CRESTIS_SYSTEM } from "./system";

export type LayoutSelectorPromptInput = {
  industry: string;
  brandPersonality: string;
  targetAudience: string;
};

export const LAYOUT_SELECTOR_AI_SYSTEM = `${CRESTIS_SYSTEM}

You are the Crestis Layout Selector.

${LAYOUT_ENGINE_RULE}

You do NOT generate HTML, CSS, section markup, components, or page structure.
You ONLY pick exactly ONE layout preset id from the Layout Engine registry.

Curated industry layouts (prefer when they fit): ${INDUSTRY_LAYOUT_IDS.join(", ")}.
Fallback for unmatched niches: generic-standard.

Return JSON only:
{
  "layout": "roofing-modern",
  "sectionOrder": ["hero", "services", "about", "faq", "contact"],
  "sectionRules": [
    { "section": "faq", "required": false }
  ]
}

Rules:
- "layout" MUST be one of the preset ids listed below.
- "sectionOrder" is optional — reorder middle sections only; hero first, contact last.
- Example: lead with offers before story → ["hero", "services", "about", "faq", "contact"].
- "sectionRules" is optional — disable optional bands only.
- Example: skip FAQ for ultra-short landing → { "section": "faq", "required": false }.
- hero and contact are locked — never disable them.
- Match Industry + Brand Personality + Target Audience to the best page skeleton.
- Roofing / storm repair → roofing-modern.
- Plumbing / drains / boilers → plumber-modern.
- HVAC / heating / cooling → hvac-modern.
- Electrician / wiring / EV chargers → electrician-modern.
- Landscaping / lawn / outdoor → landscaping-modern.
- Cleaning / janitorial / maid → cleaning-modern.
- Dentists / dental clinics → dentist-modern.
- Restaurants / cafes / dining → restaurant-modern.
- Lawyers / law firms / attorneys → lawyer-modern.
- Real estate / realtors / property → real-estate-modern.
- General local services with no clear fit → generic-standard.
- Never return HTML, nested sections, components, or CSS.

${sectionRulesPromptBlock()}

${reorderPromptBlock()}

${smartRulesPromptBlock()}

${layoutEnginePromptBlock()}`;

export function layoutSelectorAiUser(input: LayoutSelectorPromptInput): string {
  return [
    "Select the best Layout Engine preset for this business.",
    "",
    `Industry: ${input.industry}`,
    `Brand Personality: ${input.brandPersonality}`,
    `Target Audience: ${input.targetAudience}`,
    "",
    `Allowed layout ids (${LAYOUT_IDS.length} total): ${LAYOUT_IDS.join(", ")}`,
    "",
    'Return JSON only, e.g. {"layout":"roofing-modern","sectionOrder":["hero","services","about","faq","contact"],"sectionRules":[{"section":"faq","required":false}]}.',
  ].join("\n");
}
