/**
 * Template Selector — AI module (React block picks)
 *
 * Input: Industry, Brand, Theme, Business Type
 * Output: { hero, services, faq, … } — catalog ids only
 *
 * Distinct from template-selector.ts (Template Library: construction-premium, variant A/B/C).
 */

import {
  parseAiTemplateSelection,
  type AiTemplateBlockSelection,
} from "@/lib/template-engine/parse-ai-template";
import {
  findInvalidTemplatePicks,
  logRejectedTemplatePicks,
} from "@/lib/template-engine/template-rules";
import {
  selectTemplateBlocks,
  type TemplateBlocks,
} from "@/lib/template-engine";
import { completeJsonObject, getEngineOpenAI } from "./openai-json";
import { qaSelectorsUseAi } from "./theme-selector-ai";
import {
  TEMPLATE_SELECTOR_AI_SYSTEM,
  templateSelectorAiUser,
  type TemplateSelectorPromptInput,
} from "./prompts/template-selector-ai";
import type { BusinessBrief, WebsitePlan } from "./types";

/** Public input contract for Template Selector AI. */
export type TemplateSelectorInput = {
  industry: string;
  brand: string;
  theme: string;
  businessType: string;
  city?: string;
  tone?: string;
  templateLibraryId?: string;
  variant?: string;
};

/** Flat AI output — partial picks are OK (Crestis fills the rest). */
export type TemplateSelectorOutput = AiTemplateBlockSelection;

export function templateSelectorInputFromPipeline(params: {
  brief: BusinessBrief;
  plan: WebsitePlan;
  templateId: string;
  designTheme?: string;
  brandingTone?: string;
}): TemplateSelectorInput {
  const { brief, plan, templateId, designTheme, brandingTone } = params;
  const brand =
    brandingTone?.trim() ||
    brief.personality?.voice ||
    brief.dna.brandPersonality.slice(0, 3).join(", ") ||
    brief.dna.brandPosition ||
    brief.niche;

  return {
    industry: brief.dna.industry?.trim() || brief.niche,
    brand,
    theme:
      designTheme?.trim() ||
      plan.colorDirection?.trim() ||
      brief.dna.websiteStyle?.trim() ||
      plan.tone,
    businessType:
      brief.dna.subcategory?.trim() ||
      plan.pageType?.trim() ||
      brief.niche,
    city: brief.city,
    tone: plan.tone,
    templateLibraryId: templateId,
    variant: plan.variant,
  };
}

function deterministicFallback(input: TemplateSelectorInput): TemplateBlocks {
  return selectTemplateBlocks({
    templateId: input.templateLibraryId || "local-service-standard",
    variant: input.variant,
  });
}

/** Rule-based block picks — no LLM (Sprint C / QA fast path). */
export function selectTemplateBlocksWithRules(
  input: TemplateSelectorInput,
): TemplateBlocks {
  return deterministicFallback(input);
}

/**
 * AI Template Selector — picks React block ids from catalog.
 * Falls back to deterministic picks when OpenAI is unavailable or fails.
 */
export async function runTemplateSelector(
  input: TemplateSelectorInput,
  options?: {
    userEmail?: string | null;
    fallback?: TemplateBlocks;
    /** When false, skip OpenAI and use rules only (default). */
    useAi?: boolean;
  },
): Promise<TemplateBlocks> {
  const fallback = options?.fallback ?? deterministicFallback(input);

  if (options?.useAi === false || !qaSelectorsUseAi()) {
    return fallback;
  }

  if (!getEngineOpenAI()) {
    return fallback;
  }

  try {
    const ai = await completeJsonObject<TemplateSelectorOutput>({
      stage: "template_selector_ai",
      userEmail: options?.userEmail,
      temperature: 0.2,
      maxCompletionTokens: 512,
      system: TEMPLATE_SELECTOR_AI_SYSTEM,
      user: templateSelectorAiUser(input),
    });

    const rejected = findInvalidTemplatePicks(ai);
    if (rejected.length > 0) {
      logRejectedTemplatePicks(rejected);
    }

    return parseAiTemplateSelection(ai, fallback);
  } catch (error) {
    console.warn("Template Selector AI failed, using deterministic fallback:", error);
    return fallback;
  }
}

/** @deprecated Use runTemplateSelector */
export async function selectTemplateBlocksWithAi(params: {
  brief: BusinessBrief;
  plan: WebsitePlan;
  templateId: string;
  userEmail?: string | null;
  designTheme?: string;
  brandingTone?: string;
}): Promise<TemplateBlocks> {
  const input = templateSelectorInputFromPipeline(params);
  return runTemplateSelector(input, {
    userEmail: params.userEmail,
    fallback: deterministicFallback(input),
  });
}

export { templateSelectorAiUser, TEMPLATE_SELECTOR_AI_SYSTEM };
