/**
 * Theme Selector AI — prompts
 *
 * Input: Industry, Brand Personality, Target Audience
 * Output: { "theme": "<preset-id>" }
 */

import {
  THEME_ENGINE_RULE,
  THEME_PRESET_IDS,
  ThemeRegistry,
  themeEnginePromptBlock,
} from "@/theme";
import { CRESTIS_SYSTEM } from "./system";

export type ThemeSelectorPromptInput = {
  industry: string;
  brandPersonality: string;
  targetAudience: string;
};

const CURATED_PRESET_IDS = Object.keys(ThemeRegistry).join(", ");

export const THEME_SELECTOR_AI_SYSTEM = `${CRESTIS_SYSTEM}

You are the Crestis Theme Selector.

${THEME_ENGINE_RULE}

You do NOT generate HTML, CSS, hex colors, font stacks, or layout markup.
You ONLY pick exactly ONE theme preset id from the Theme Engine registry.

Curated hand-authored presets (prefer when they fit): ${CURATED_PRESET_IDS}.

Return JSON only:
{
  "theme": "construction-modern"
}

Rules:
- "theme" MUST be one of the preset ids listed below.
- Match Industry + Brand Personality + Target Audience to the best preset.
- Bold / trade / urgent brands → construction-modern, local-service-bold, electrician-modern.
- Clinical / calm / trust → medical-clean, dentist-family, hvac-trust.
- Premium dining / luxury hospitality → restaurant-dark.
- Never return colors, fonts, CSS, or nested design objects.

${themeEnginePromptBlock()}`;

export function themeSelectorAiUser(input: ThemeSelectorPromptInput): string {
  return [
    "Select the best Theme Engine preset for this business.",
    "",
    `Industry: ${input.industry}`,
    `Brand Personality: ${input.brandPersonality}`,
    `Target Audience: ${input.targetAudience}`,
    "",
    `Allowed preset ids (${THEME_PRESET_IDS.length} total): ${THEME_PRESET_IDS.join(", ")}`,
    "",
    'Return JSON only, e.g. {"theme":"construction-modern"}.',
  ].join("\n");
}
