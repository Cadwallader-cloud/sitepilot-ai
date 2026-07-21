import type { SiteTheme } from "./site-types";
import { animationDurationFor } from "@/theme/tokens/animation";
import { colorsForPalette as themeColorsForPalette } from "@/theme/tokens/colors";
import { radiusPxFor } from "@/theme/tokens/radius";
import { spacingPxFor } from "@/theme/tokens/spacing";
import { fontStackFor } from "@/theme/tokens/typography";

/**
 * Layer 5 — Visual AI tokens (Crestis design system).
 * OpenAI returns this JSON; Crestis maps tokens → CSS. Never HTML.
 */
export type DesignSystem = {
  theme: DesignThemeName;
  palette: DesignPaletteName;
  font: DesignFont;
  /** Stored as borderRadius; Visual AI field is `radius` */
  borderRadius: DesignBorderRadius;
  spacing: DesignSpacing;
  animation: DesignAnimation;
  imageStyle: DesignImageStyle;
  sectionStyle: DesignSectionStyle;
};

export type DesignThemeName =
  | "Modern Premium"
  | "Clean Clinical"
  | "Warm Hospitality"
  | "Bold Trade"
  | "Classic Professional";

export type DesignPaletteName =
  | "Dark Blue"
  | "Teal"
  | "Clinical Mint"
  | "Warm Burgundy"
  | "Slate"
  | "Forest"
  | "Amber Trade"
  | "Electric Orange";

export type DesignFont =
  | "Geist"
  | "Manrope"
  | "DM Sans"
  | "Source Serif"
  | "Inter";

export type DesignSpacing = "Compact" | "Medium" | "Large";
export type DesignBorderRadius = "Sharp" | "Medium" | "Soft";
export type DesignAnimation = "None" | "Soft" | "Bold";
export type DesignImageStyle =
  | "Professional"
  | "Lifestyle"
  | "Editorial"
  | "Documentary";
export type DesignSectionStyle = "Alternating" | "Stacked" | "Banded";

export function colorsForPalette(palette: DesignPaletteName): {
  primary: string;
  accent: string;
} {
  return themeColorsForPalette(palette);
}

const PALETTE_NAMES: DesignPaletteName[] = [
  "Dark Blue",
  "Teal",
  "Clinical Mint",
  "Warm Burgundy",
  "Slate",
  "Forest",
  "Amber Trade",
  "Electric Orange",
];

/** Google Fonts URL for non-Geist stacks (Geist is already in root layout). */
export function googleFontsHrefFor(font: DesignFont): string | null {
  switch (font) {
    case "Manrope":
      return "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap";
    case "DM Sans":
      return "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
    case "Source Serif":
      return "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap";
    case "Inter":
      return "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    default:
      return null;
  }
}

/** Map planner colorDirection string → known Crestis palette, if possible */
export function resolvePaletteDirection(
  colorDirection?: string,
): DesignPaletteName | undefined {
  if (!colorDirection?.trim()) return undefined;
  const needle = colorDirection.trim().toLowerCase();
  const exact = PALETTE_NAMES.find((p) => p.toLowerCase() === needle);
  if (exact) return exact;
  return PALETTE_NAMES.find(
    (p) => needle.includes(p.toLowerCase()) || p.toLowerCase().includes(needle),
  );
}

const THEME_NAMES: DesignThemeName[] = [
  "Modern Premium",
  "Clean Clinical",
  "Warm Hospitality",
  "Bold Trade",
  "Classic Professional",
];
const FONT_NAMES: DesignFont[] = [
  "Geist",
  "Manrope",
  "DM Sans",
  "Source Serif",
  "Inter",
];
const SPACING_NAMES: DesignSpacing[] = ["Compact", "Medium", "Large"];
const RADIUS_NAMES: DesignBorderRadius[] = ["Sharp", "Medium", "Soft"];
const ANIMATION_NAMES: DesignAnimation[] = ["None", "Soft", "Bold"];
const IMAGE_STYLE_NAMES: DesignImageStyle[] = [
  "Professional",
  "Lifestyle",
  "Editorial",
  "Documentary",
];
const SECTION_STYLE_NAMES: DesignSectionStyle[] = [
  "Alternating",
  "Stacked",
  "Banded",
];

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  if (typeof value !== "string") return undefined;
  const needle = value.trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === needle);
}

/** Visual AI "Premium" → Crestis "Modern Premium" */
function resolveTheme(value: unknown): DesignThemeName | undefined {
  if (typeof value !== "string") return undefined;
  const needle = value.trim().toLowerCase();
  if (needle === "premium" || needle === "modern premium") {
    return "Modern Premium";
  }
  return pickEnum(value, THEME_NAMES);
}

/** Merge Visual AI JSON onto a Crestis baseline (enums only). */
export function applyDesignRecommendations(
  base: DesignSystem,
  ai: {
    theme?: string;
    colors?: string;
    palette?: string;
    font?: string;
    radius?: string;
    borderRadius?: string;
    imageStyle?: string;
    spacing?: string;
    animation?: string;
    sectionStyle?: string;
  },
): DesignSystem {
  return {
    theme: resolveTheme(ai.theme) ?? base.theme,
    palette:
      resolvePaletteDirection(ai.colors) ||
      resolvePaletteDirection(ai.palette) ||
      base.palette,
    font: pickEnum(ai.font, FONT_NAMES) ?? base.font,
    spacing: pickEnum(ai.spacing, SPACING_NAMES) ?? base.spacing,
    borderRadius:
      pickEnum(ai.radius, RADIUS_NAMES) ||
      pickEnum(ai.borderRadius, RADIUS_NAMES) ||
      base.borderRadius,
    animation: pickEnum(ai.animation, ANIMATION_NAMES) ?? base.animation,
    imageStyle: pickEnum(ai.imageStyle, IMAGE_STYLE_NAMES) ?? base.imageStyle,
    sectionStyle:
      pickEnum(ai.sectionStyle, SECTION_STYLE_NAMES) ?? base.sectionStyle,
  };
}

/** Map Crestis design tokens → CSS variables for the renderer */
export function designSystemToCssVars(
  design: DesignSystem,
  theme: SiteTheme,
): Record<string, string> {
  const spacing = spacingPxFor(design.spacing);
  const radius = radiusPxFor(design.borderRadius);
  const font = fontStackFor(design.font);
  return {
    "--site-primary": theme.primary,
    "--site-accent": theme.accent,
    "--site-section-y": spacing.section,
    "--site-gap": spacing.gap,
    "--site-radius": radius,
    "--site-font": font,
    "--site-anim": animationDurationFor(design.animation),
  };
}

/** Background for content sections based on Visual AI sectionStyle */
export function sectionSurfaceClass(
  sectionStyle: DesignSectionStyle | undefined,
  index: number,
): string {
  const style = sectionStyle ?? "Alternating";
  if (style === "Stacked") return "bg-white";
  if (style === "Banded") {
    return index % 2 === 0 ? "bg-zinc-50" : "bg-zinc-100/80";
  }
  // Alternating
  return index % 2 === 0 ? "bg-white" : "bg-zinc-50";
}

export function defaultDesignSystem(): DesignSystem {
  return {
    theme: "Modern Premium",
    palette: "Dark Blue",
    font: "Geist",
    spacing: "Large",
    borderRadius: "Medium",
    animation: "Soft",
    imageStyle: "Professional",
    sectionStyle: "Alternating",
  };
}

/** Fill missing Visual AI fields on older Website JSON */
export function normalizeDesignSystem(
  partial?: Partial<DesignSystem> | null,
): DesignSystem {
  const base = defaultDesignSystem();
  if (!partial) return base;
  return applyDesignRecommendations(base, {
    theme: partial.theme,
    palette: partial.palette,
    font: partial.font,
    radius: partial.borderRadius,
    borderRadius: partial.borderRadius,
    spacing: partial.spacing,
    animation: partial.animation,
    imageStyle: partial.imageStyle,
    sectionStyle: partial.sectionStyle,
  });
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function pickVariant<T>(variants: T[], seed: string): T {
  return variants[hashSeed(seed) % variants.length]!;
}

/**
 * Crestis Visual baseline — trade defaults + seed variants so sites differ
 * even before Visual AI runs. Never OpenAI HTML.
 */
export function planDesignSystem(params: {
  tradeKey: string;
  tone: string;
  /** business + city + runId — rotates palette/font within the niche */
  seed?: string;
}): DesignSystem {
  const { tradeKey, tone } = params;
  const seed = params.seed?.trim() || `${tradeKey}:${tone}`;
  const bold = tone === "bold" || tone === "Bold";

  switch (tradeKey) {
    case "dentist":
      return {
        theme: "Clean Clinical",
        ...pickVariant(
          [
            { palette: "Clinical Mint" as const, font: "DM Sans" as const },
            { palette: "Teal" as const, font: "Geist" as const },
            { palette: "Slate" as const, font: "Manrope" as const },
          ],
          seed,
        ),
        spacing: "Large",
        borderRadius: "Soft",
        animation: "Soft",
        imageStyle: "Professional",
        sectionStyle: pickVariant(
          ["Alternating", "Stacked"] as const,
          seed + ":sec",
        ),
      };
    case "restaurant":
      return {
        theme: "Warm Hospitality",
        ...pickVariant(
          [
            {
              palette: "Warm Burgundy" as const,
              font: "Source Serif" as const,
            },
            { palette: "Amber Trade" as const, font: "DM Sans" as const },
            { palette: "Forest" as const, font: "Source Serif" as const },
          ],
          seed,
        ),
        spacing: "Medium",
        borderRadius: "Medium",
        animation: bold ? "Bold" : "Soft",
        imageStyle: "Lifestyle",
        sectionStyle: "Banded",
      };
    case "lawyer":
      return {
        theme: "Classic Professional",
        ...pickVariant(
          [
            { palette: "Slate" as const, font: "Source Serif" as const },
            { palette: "Dark Blue" as const, font: "Source Serif" as const },
            { palette: "Warm Burgundy" as const, font: "DM Sans" as const },
          ],
          seed,
        ),
        spacing: "Large",
        borderRadius: "Sharp",
        animation: "Soft",
        imageStyle: "Editorial",
        sectionStyle: "Stacked",
      };
    case "landscaping":
      return {
        theme: "Modern Premium",
        ...pickVariant(
          [
            { palette: "Forest" as const, font: "Manrope" as const },
            { palette: "Teal" as const, font: "DM Sans" as const },
            { palette: "Amber Trade" as const, font: "Geist" as const },
          ],
          seed,
        ),
        spacing: "Large",
        borderRadius: "Medium",
        animation: "Soft",
        imageStyle: "Lifestyle",
        sectionStyle: "Alternating",
      };
    case "electrician":
      return {
        theme: "Bold Trade",
        ...pickVariant(
          [
            {
              palette: "Electric Orange" as const,
              font: "Manrope" as const,
            },
            { palette: "Amber Trade" as const, font: "Geist" as const },
            { palette: "Slate" as const, font: "DM Sans" as const },
          ],
          seed,
        ),
        spacing: "Medium",
        borderRadius: "Medium",
        animation: "Bold",
        imageStyle: "Documentary",
        sectionStyle: "Banded",
      };
    case "plumbing":
      return {
        theme: "Modern Premium",
        ...pickVariant(
          [
            { palette: "Teal" as const, font: "Geist" as const },
            { palette: "Dark Blue" as const, font: "Manrope" as const },
            { palette: "Slate" as const, font: "DM Sans" as const },
          ],
          seed,
        ),
        spacing: "Large",
        borderRadius: "Medium",
        animation: "Soft",
        imageStyle: "Professional",
        sectionStyle: "Alternating",
      };
    case "construction":
      return {
        theme: "Bold Trade",
        ...pickVariant(
          [
            { palette: "Amber Trade" as const, font: "Manrope" as const },
            {
              palette: "Electric Orange" as const,
              font: "Geist" as const,
            },
            { palette: "Slate" as const, font: "Manrope" as const },
          ],
          seed,
        ),
        spacing: "Medium",
        borderRadius: "Sharp",
        animation: "Soft",
        imageStyle: "Documentary",
        sectionStyle: "Banded",
      };
    case "roofing":
      return {
        theme: "Modern Premium",
        ...pickVariant(
          [
            { palette: "Dark Blue" as const, font: "Manrope" as const },
            { palette: "Slate" as const, font: "Geist" as const },
            { palette: "Amber Trade" as const, font: "DM Sans" as const },
            {
              palette: "Electric Orange" as const,
              font: "Manrope" as const,
            },
          ],
          seed,
        ),
        spacing: "Large",
        borderRadius: "Medium",
        animation: "Soft",
        imageStyle: "Professional",
        sectionStyle: pickVariant(
          ["Alternating", "Banded"] as const,
          seed + ":sec",
        ),
      };
    default:
      return {
        ...defaultDesignSystem(),
        ...pickVariant(
          [
            { palette: "Dark Blue" as const, font: "Manrope" as const },
            { palette: "Teal" as const, font: "DM Sans" as const },
            { palette: "Forest" as const, font: "Geist" as const },
            { palette: "Slate" as const, font: "Source Serif" as const },
          ],
          seed,
        ),
      };
  }
}
