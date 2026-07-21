import { DEFAULT_TEMPLATE_BLOCKS, type TemplateBlocks } from "@/lib/template-engine";
import type { WebsiteTheme } from "@/lib/website";
import { themeCssVars } from "./define";
import { getTheme, isThemePresetId, type ThemePresetId } from "./registry";
import type { Theme } from "./types";

export function resolveThemePreset(presetId: ThemePresetId): Theme {
  return getTheme(presetId);
}

export function resolveThemePresetOrNull(
  value: string | undefined | null,
): Theme | null {
  if (!value?.trim()) return null;
  const id = value.trim();
  if (!isThemePresetId(id)) return null;
  return resolveThemePreset(id);
}

export function themeRefFromPreset(
  presetId: ThemePresetId,
  blocks: TemplateBlocks = DEFAULT_TEMPLATE_BLOCKS,
): WebsiteTheme {
  return { id: presetId, blocks };
}

export function themeFieldsFromPreset(
  presetId: ThemePresetId,
): Pick<WebsiteTheme, "id"> {
  return { id: presetId };
}

export function resolveThemeCssVars(theme: Theme): Record<string, string> {
  return themeCssVars(theme);
}

/** @deprecated Resolved preset is now Theme — presetId === theme.id */
export type ResolvedThemePreset = Theme;
