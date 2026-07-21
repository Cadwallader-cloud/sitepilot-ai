/**
 * Layout Selector — AI module (Layout Engine preset id)
 *
 * Input: Industry, Brand Personality, Target Audience
 * Output: { "layout": "roofing-modern" }
 *
 * Distinct from planLayout() which resolves sections after the preset is locked.
 */

import {
  parseAiLayoutSelection,
  resolveLayout,
  suggestLayoutId,
  type AiLayoutSelection,
  type LayoutId,
  type LayoutPreset,
} from "@/layout";
import { completeJsonObject, getEngineOpenAI } from "./openai-json";
import {
  LAYOUT_SELECTOR_AI_SYSTEM,
  layoutSelectorAiUser,
  type LayoutSelectorPromptInput,
} from "./prompts/layout-selector-ai";
import type { BusinessBrief } from "./types";

/** Public input contract for Layout Selector AI. */
export type LayoutSelectorInput = LayoutSelectorPromptInput;

export type LayoutSelectorOutput = AiLayoutSelection;

export function layoutSelectorInputFromPipeline(params: {
  brief: BusinessBrief;
  brandingTone?: string;
}): LayoutSelectorInput {
  const { brief, brandingTone } = params;
  const personality = brief.personality;

  const brandPersonality =
    brandingTone?.trim() ||
    [
      personality?.archetype,
      personality?.voice,
      personality?.energy,
      ...(personality?.traits?.slice(0, 3) ?? []),
    ]
      .filter(Boolean)
      .join(", ") ||
    brief.dna.brandPersonality.slice(0, 4).join(", ") ||
    brief.dna.brandPosition ||
    brief.tone;

  return {
    industry: brief.dna.industry?.trim() || brief.niche,
    brandPersonality,
    targetAudience:
      brief.dna.targetAudience.join(", ") ||
      brief.idealCustomer ||
      "Local customers",
  };
}

function deterministicFallback(input: LayoutSelectorInput): LayoutSelectorOutput {
  const layout = suggestLayoutId({
    industry: input.industry,
    industryId: input.industry,
    tradeKey: input.industry,
  });
  return { layout };
}

/**
 * AI Layout Selector — picks Layout Engine preset id only.
 * Falls back to deterministic hints when OpenAI is unavailable or fails.
 */
export async function runLayoutSelector(
  input: LayoutSelectorInput,
  options?: {
    userEmail?: string | null;
    fallbackLayoutId?: LayoutId;
  },
): Promise<LayoutSelectorOutput> {
  const fallback = options?.fallbackLayoutId
    ? { layout: options.fallbackLayoutId }
    : deterministicFallback(input);

  if (!getEngineOpenAI()) {
    return fallback;
  }

  try {
    const ai = await completeJsonObject<LayoutSelectorOutput>({
      stage: "layout_selector_ai",
      userEmail: options?.userEmail,
      temperature: 0.2,
      maxCompletionTokens: 256,
      system: LAYOUT_SELECTOR_AI_SYSTEM,
      user: layoutSelectorAiUser(input),
    });

    const parsed = parseAiLayoutSelection(ai);
    if (!parsed) {
      console.warn("Layout Selector AI returned invalid preset, using fallback:", ai);
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.warn("Layout Selector AI failed, using deterministic fallback:", error);
    return fallback;
  }
}

/** Normalize raw AI / legacy ids to a Layout Engine preset. */
export function resolveLayoutSelectorOutput(
  raw: unknown,
  input: LayoutSelectorInput,
  fallbackLayoutId?: LayoutId,
): LayoutSelectorOutput {
  const parsed = parseAiLayoutSelection(raw);
  if (parsed) return parsed;
  return fallbackLayoutId
    ? { layout: fallbackLayoutId }
    : deterministicFallback(input);
}

/** AI JSON → registry lookup: LayoutRegistry[data.layout] */
export function layoutFromSelectorOutput(data: LayoutSelectorOutput): LayoutPreset {
  return resolveLayout(data);
}

export { layoutSelectorAiUser, LAYOUT_SELECTOR_AI_SYSTEM };
