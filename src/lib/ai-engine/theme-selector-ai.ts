/**
 * Theme Selector — AI module (Theme Engine preset id)
 *
 * Input: Industry, Brand Personality, Target Audience
 * Output: { "theme": "construction-modern" }
 *
 * Distinct from theme-selector.ts (resolves DesignSystem + assets after preset is locked).
 */

import {
  parseAiThemeSelection,
  type AiThemeSelection,
  type ThemePresetId,
} from "@/theme";
import { suggestTemplateFromHints } from "../template-library";
import { completeJsonObject, getEngineOpenAI } from "./openai-json";
import {
  THEME_SELECTOR_AI_SYSTEM,
  themeSelectorAiUser,
  type ThemeSelectorPromptInput,
} from "./prompts/theme-selector-ai";
import type { BusinessBrief } from "./types";

/** Public input contract for Theme Selector AI. */
export type ThemeSelectorInput = ThemeSelectorPromptInput;

export type ThemeSelectorOutput = AiThemeSelection;

export function themeSelectorInputFromPipeline(params: {
  brief: BusinessBrief;
  brandingTone?: string;
}): ThemeSelectorInput {
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

function deterministicFallback(
  input: ThemeSelectorInput,
  fallbackTemplateId?: ThemePresetId,
): ThemeSelectorOutput {
  if (fallbackTemplateId) {
    return { theme: fallbackTemplateId };
  }

  const theme = suggestTemplateFromHints({
    industry: input.industry,
    tone: input.brandPersonality,
    brandPosition: input.brandPersonality,
    websiteStyle: input.brandPersonality,
    subcategory: input.targetAudience,
  });

  return { theme };
}

/** Rule-based theme pick — no LLM (Sprint C / QA fast path). */
export function selectThemeWithRules(
  input: ThemeSelectorInput,
  fallbackTemplateId?: ThemePresetId,
): ThemeSelectorOutput {
  return deterministicFallback(input, fallbackTemplateId);
}

export function qaSelectorsUseAi(): boolean {
  const raw = process.env.CRESTIS_QA_AI_SELECTORS?.trim().toLowerCase();
  return raw === "true" || raw === "1";
}

/**
 * AI Theme Selector — picks Theme Engine preset id only.
 * Falls back to deterministic hints when OpenAI is unavailable or fails.
 */
export async function runThemeSelector(
  input: ThemeSelectorInput,
  options?: {
    userEmail?: string | null;
    fallbackTemplateId?: ThemePresetId;
    /** When false, skip OpenAI and use rules only (default). */
    useAi?: boolean;
  },
): Promise<ThemeSelectorOutput> {
  const fallback = deterministicFallback(input, options?.fallbackTemplateId);

  if (options?.useAi === false || !qaSelectorsUseAi()) {
    return fallback;
  }

  if (!getEngineOpenAI()) {
    return fallback;
  }

  try {
    const ai = await completeJsonObject<ThemeSelectorOutput>({
      stage: "theme_selector_ai",
      userEmail: options?.userEmail,
      temperature: 0.2,
      maxCompletionTokens: 256,
      system: THEME_SELECTOR_AI_SYSTEM,
      user: themeSelectorAiUser(input),
    });

    const parsed = parseAiThemeSelection(ai);
    if (!parsed) {
      console.warn("Theme Selector AI returned invalid preset, using fallback:", ai);
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.warn("Theme Selector AI failed, using deterministic fallback:", error);
    return fallback;
  }
}

/** Normalize raw AI / legacy ids to a Theme Engine preset. */
export function resolveThemeSelectorOutput(
  raw: unknown,
  input: ThemeSelectorInput,
  fallbackTemplateId?: ThemePresetId,
): ThemeSelectorOutput {
  const parsed = parseAiThemeSelection(raw);
  if (parsed) return parsed;
  return deterministicFallback(input, fallbackTemplateId);
}

/** @deprecated Use runThemeSelector */
export async function selectThemePresetWithAi(params: {
  brief: BusinessBrief;
  brandingTone?: string;
  userEmail?: string | null;
  fallbackTemplateId?: ThemePresetId;
}): Promise<ThemeSelectorOutput> {
  const input = themeSelectorInputFromPipeline(params);
  return runThemeSelector(input, {
    userEmail: params.userEmail,
    fallbackTemplateId: params.fallbackTemplateId,
  });
}

export { themeSelectorAiUser, THEME_SELECTOR_AI_SYSTEM };
