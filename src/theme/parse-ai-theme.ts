/**
 * AI Theme Selection — JSON contract.
 *
 * AI returns: { "theme": "construction-modern" }
 * Never:      { "color": "#0EA5E9" }
 */

import { isThemePresetId, type ThemePresetId } from "./registry";

export type AiThemeSelection = {
  theme: ThemePresetId;
};

const HEX_COLOR_KEY = /^(?:color|primary|accent|backgroundColor|bg)$/i;
const HEX_VALUE = /^#[0-9a-fA-F]{3,8}$/;

function readThemeField(raw: Record<string, unknown>): string | undefined {
  const theme = raw.theme;
  if (typeof theme === "string" && theme.trim()) return theme.trim();
  return undefined;
}

export function assertNoHexThemeFields(raw: unknown): void {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const obj = raw as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === "string" &&
      HEX_COLOR_KEY.test(key) &&
      HEX_VALUE.test(value.trim())
    ) {
      throw new Error(
        `THEME_ENGINE: AI must return preset id { "theme": "construction-modern" }, not hex { "${key}": "${value}" }`,
      );
    }
  }
  if ("colors" in obj && obj.colors && typeof obj.colors === "object") {
    throw new Error(
      "THEME_ENGINE: AI must return preset id, not a colors object with hex values",
    );
  }
}

export function parseAiThemeSelection(raw: unknown): AiThemeSelection | null {
  assertNoHexThemeFields(raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const theme = readThemeField(raw as Record<string, unknown>);
  if (!theme) return null;
  if (!isThemePresetId(theme)) return null;
  return { theme };
}

export function parseAiThemeSelectionOrThrow(raw: unknown): AiThemeSelection {
  const parsed = parseAiThemeSelection(raw);
  if (!parsed) {
    throw new Error(
      'THEME_ENGINE: expected { "theme": "<preset-id>" } from template library',
    );
  }
  return parsed;
}
