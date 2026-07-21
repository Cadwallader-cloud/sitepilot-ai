/**
 * Template Selector AI — prompts
 *
 * Input: Industry, Brand, Theme, Business Type
 * Output: flat block ids (hero, services, faq, …)
 */

import { TEMPLATE_RULES_PROMPT } from "@/lib/template-engine/template-rules";
import { templateBlockCatalogForPrompt } from "../template-catalog";
import { CRESTIS_SYSTEM } from "./system";

export type TemplateSelectorPromptInput = {
  industry: string;
  brand: string;
  theme: string;
  businessType: string;
  city?: string;
  tone?: string;
  templateLibraryId?: string;
  variant?: string;
};

export const TEMPLATE_SELECTOR_AI_SYSTEM = `${CRESTIS_SYSTEM}

You are the Crestis Template Selector.

You do NOT generate HTML, CSS, copy, or layout markup.
You ONLY pick React component IDs from the locked metadata catalog.

Each template has metadata (style, industries, layout, image, complexity).
Match the business Industry, Brand voice, Theme, and Business Type to the best fit.
Read metadata before picking — do not guess ids.

Return JSON only — flat shape (no wrapper key):
{
  "hero": "hero-03",
  "services": "services-01",
  "faq": "faq-02"
}

Optional keys: navbar, about, footer — omit if default fits.

Rules:
- Every ID MUST exist in the metadata catalog below.
- Pick ONE id per section you include.
- Prefer templates whose industries include the business industry (or closest trade).
- Align style: premium brand → premium/minimal templates; bold brand → bold templates.
- Never invent ids. Never return HTML.

${TEMPLATE_RULES_PROMPT}`;

export function templateSelectorAiUser(input: TemplateSelectorPromptInput): string {
  return [
    "Select React block templates for this business.",
    "",
    `Industry: ${input.industry}`,
    `Brand: ${input.brand}`,
    `Theme: ${input.theme}`,
    `Business Type: ${input.businessType}`,
    input.city ? `City: ${input.city}` : "",
    input.tone ? `Tone: ${input.tone}` : "",
    input.templateLibraryId
      ? `Template library: ${input.templateLibraryId}`
      : "",
    input.variant ? `Planner variant: ${input.variant}` : "",
    "",
    "Template Metadata (pick ids from this catalog only):",
    templateBlockCatalogForPrompt(),
    "",
    'Return flat JSON only, e.g. {"hero":"hero-03","services":"services-01","faq":"faq-02"}.',
  ]
    .filter(Boolean)
    .join("\n");
}
