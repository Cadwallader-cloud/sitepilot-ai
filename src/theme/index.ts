/**
 * Theme Engine — AI picks preset id; registry resolves tokens.
 */

import { TEMPLATE_IDS } from "@/lib/template-library";

export const THEME_ENGINE_RULE =
  "AI returns { theme: preset id } only — Theme Engine resolves colors, fonts, radius, spacing, shadows, buttons, animation." as const;

export function themeEnginePromptBlock(): string {
  const lines = TEMPLATE_IDS.map((id) => `- ${id}`);
  return [
    "THEME ENGINE — pick exactly ONE preset id:",
    ...lines,
    "",
    'Return JSON: { "theme": "<preset-id>" }',
    "Never return hex colors, CSS, or font stacks.",
    "Crestis resolves palette, typography, spacing, radius, shadows, and button style from the preset.",
  ].join("\n");
}

export type {
  Animation,
  ButtonTheme,
  CardTheme,
  Palette,
  Radius,
  Shadow,
  Spacing,
  Theme,
  ThemeMode,
  ThemeModes,
  Typography,
  TypographyRoleStyle,
  RadiusTokenStyle,
  ShadowTokenStyle,
  AnimationTokenStyle,
} from "./types";

export type { TypographyRole, TypographyRoleTokens, TypographyTokens } from "./tokens/typography";
export {
  TYPOGRAPHY_ROLES,
  typographyCssVars,
  typographyRoleClass,
  typographyTokensFor,
} from "./tokens/typography";
export { COLOR_TOKENS, colorCssVars, colorModeStorageVars, darkSemanticPaletteFor, semanticModesFor, semanticPaletteFor } from "./tokens/colors";
export { THEME_MODES } from "./types";

export type { ThemeConfig } from "./define";
export { defineTheme, paletteFor, themeBuildMeta, themeCssVars } from "./define";
export {
  RENDERER_CSS_VARS,
  rendererCssVars,
  rendererThemeVars,
  type RendererCssVar,
} from "./renderer-vars";

export {
  isThemePresetId,
  normalizeThemePresetId,
  THEME_PRESET_IDS,
  ThemeRegistry,
  getTheme,
  getThemeDefinition,
  listRegisteredThemes,
  type ThemePresetId,
  type ThemeRegistryId,
  ConstructionModern,
  ConstructionPremium,
  LawClassic,
  MedicalClean,
  RestaurantDark,
} from "./registry";

export {
  buttonRadiusClass,
  buttonRadiusPx,
  buttonStyleFromRadius,
  radiusClass,
  radiusCssVars,
  radiusRem,
  RADIUS_TOKENS,
  type RadiusToken,
} from "./tokens/radius";

export {
  buttonShadowToken,
  cardShadowToken,
  shadow,
  shadowClass,
  shadowCssVars,
  shadowValue,
  shadowsForPreset,
  SHADOW_TOKENS,
  type ShadowScale,
  type ShadowToken,
  type ThemeShadowTokens,
} from "./tokens/shadow";

export {
  animation,
  animationClass,
  animationCssVars,
  animationDuration,
  animationDurationFor,
  animationsForPreset,
  entranceAnimationToken,
  ANIMATION_TOKENS,
  type ThemeAnimation,
} from "./tokens/animation";

export {
  assertNoHexThemeFields,
  parseAiThemeSelection,
  parseAiThemeSelectionOrThrow,
  type AiThemeSelection,
} from "./parse-ai-theme";

export {
  resolveThemeCssVars,
  resolveThemePreset,
  resolveThemePresetOrNull,
  themeFieldsFromPreset,
  themeRefFromPreset,
  type ResolvedThemePreset,
} from "./resolve";

export {
  DESIGN_TOKENS_RULE,
  COLOR_TOKEN_SOURCES,
  FORBIDDEN_ARBITRARY_SPACING_PATTERN,
  FORBIDDEN_MAGIC_COLOR_PATTERN,
  FORBIDDEN_MAGIC_SPACING_PATTERN,
  FORBIDDEN_MAGIC_TYPOGRAPHY_PATTERN,
  SPACING_TOKEN_SOURCES,
  FORBIDDEN_MAGIC_RADIUS_PATTERN,
  RADIUS_TOKEN_SOURCES,
  FORBIDDEN_MAGIC_SHADOW_PATTERN,
  SHADOW_TOKEN_SOURCES,
  FORBIDDEN_MAGIC_ANIMATION_PATTERN,
  ANIMATION_TOKEN_SOURCES,
  TYPOGRAPHY_TOKEN_SOURCES,
} from "./design-tokens";
export { constructionPremium } from "./themes/construction-premium";
export { medicalClean } from "./themes/medical-clean";
export { restaurantDark } from "./themes/restaurant-dark";
export { lawClassic } from "./themes/law-classic";

export { constructionModern } from "./themes/construction-modern";
