import {
  designSystemFromTemplate,
  isTemplateId,
  TEMPLATE_IDS,
  type TemplateId,
} from "@/lib/template-library";
import { defineTheme } from "./define";
import type { Theme } from "./types";
import { constructionModern as ConstructionModern } from "./themes/construction-modern";
import { constructionPremium as ConstructionPremium } from "./themes/construction-premium";
import { lawClassic as LawClassic } from "./themes/law-classic";
import { medicalClean as MedicalClean } from "./themes/medical-clean";
import { restaurantDark as RestaurantDark } from "./themes/restaurant-dark";

export type ThemePresetId = TemplateId;

export const THEME_PRESET_IDS = TEMPLATE_IDS;

/** Hand-authored themes — preset id → resolved Theme bundle. */
export const ThemeRegistry = {
  "construction-modern": ConstructionModern,
  "medical-clean": MedicalClean,
  "restaurant-dark": RestaurantDark,
} as const satisfies Record<string, Theme>;

export type ThemeRegistryId = keyof typeof ThemeRegistry;

const LEGACY_PRESET_ALIASES = {
  "restaurant-luxury": "restaurant-dark",
} as const satisfies Record<string, ThemePresetId>;

export type LegacyThemePresetId = keyof typeof LEGACY_PRESET_ALIASES;

const EXTENDED_CURATED_THEMES: Partial<Record<ThemePresetId, Theme>> = {
  ...ThemeRegistry,
  "construction-premium": ConstructionPremium,
  "law-corporate": LawClassic,
};

export function normalizeThemePresetId(value: string): ThemePresetId | null {
  const id =
    value in LEGACY_PRESET_ALIASES
      ? LEGACY_PRESET_ALIASES[value as LegacyThemePresetId]
      : value;
  return isTemplateId(id) ? id : null;
}

export function isThemePresetId(value: unknown): value is ThemePresetId {
  if (typeof value !== "string") return false;
  if (isTemplateId(value)) return true;
  return value in LEGACY_PRESET_ALIASES;
}

function resolvePresetId(id: ThemePresetId | LegacyThemePresetId): ThemePresetId {
  return LEGACY_PRESET_ALIASES[id as LegacyThemePresetId] ?? id;
}

function themeFromTemplateLibrary(id: ThemePresetId): Theme {
  const visual = designSystemFromTemplate(id);
  return defineTheme({
    id,
    name: visual.theme,
    palette: visual.palette,
    font: visual.font,
    radius: visual.borderRadius,
    spacing: visual.spacing,
    animation: visual.animation,
    imageStyle: visual.imageStyle,
    sectionStyle: visual.sectionStyle,
  });
}

export function getTheme(id: ThemePresetId | LegacyThemePresetId): Theme {
  const presetId = resolvePresetId(id as ThemePresetId);
  return EXTENDED_CURATED_THEMES[presetId] ?? themeFromTemplateLibrary(presetId);
}

/** @deprecated Use getTheme */
export function getThemeDefinition(id: ThemePresetId): Theme {
  return getTheme(id);
}

export function listRegisteredThemes(): Theme[] {
  return TEMPLATE_IDS.map((id) => getTheme(id));
}

/** @deprecated Use ThemeRegistry */
export const CURATED_THEMES = EXTENDED_CURATED_THEMES;

export {
  ConstructionModern,
  ConstructionPremium,
  LawClassic,
  MedicalClean,
  RestaurantDark,
};
