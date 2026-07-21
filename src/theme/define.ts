import type {
  DesignAnimation,
  DesignBorderRadius,
  DesignFont,
  DesignImageStyle,
  DesignPaletteName,
  DesignSectionStyle,
  DesignSpacing,
  DesignSystem,
  DesignThemeName,
} from "@/lib/design-system";
import type { TemplateId } from "@/lib/template-library";
import type { Theme, ThemeMode } from "./types";
import { animationsForPreset, animationCssVars } from "./tokens/animation";
import {
  colorModeStorageVars,
  semanticModesFor,
} from "./tokens/colors";
import {
  buttonRadiusPx,
  buttonStyleFromRadius,
  radiusCssVars,
  radiusTokensFor,
} from "./tokens/radius";
import {
  buttonShadowToken,
  cardShadowToken,
  shadowCssVars,
  shadowsForPreset,
} from "./tokens/shadow";
import { spacingCssVars, spacingPxFor } from "./tokens/spacing";
import { typographyCssVars, typographyTokensFor } from "./tokens/typography";
import { rendererCssVars } from "./renderer-vars";

export type ThemeConfig = {
  id: TemplateId;
  name: DesignThemeName;
  palette: DesignPaletteName;
  font: DesignFont;
  radius: DesignBorderRadius;
  spacing: DesignSpacing;
  animation: DesignAnimation;
  imageStyle: DesignImageStyle;
  sectionStyle: DesignSectionStyle;
};

export type ThemeBuildMeta = {
  design: DesignSystem;
  imageStyle: DesignImageStyle;
  sectionStyle: DesignSectionStyle;
};

const THEME_META = new WeakMap<Theme, ThemeBuildMeta>();

export function themeBuildMeta(theme: Theme): ThemeBuildMeta | undefined {
  return THEME_META.get(theme);
}

export function defineTheme(config: ThemeConfig): Theme {
  const modes = semanticModesFor(config.palette);
  const light = modes.light;
  const typography = typographyTokensFor(config.font);
  const radiusTokens = radiusTokensFor(config.radius);
  const buttonStyle = buttonStyleFromRadius(config.radius);
  const shadows = shadowsForPreset(config.palette, config.radius);
  const spacingPx = spacingPxFor(config.spacing);
  const buttonRadius = buttonRadiusPx(buttonStyle);
  const animations = animationsForPreset(config.animation);

  const theme: Theme = {
    id: config.id,
    name: config.name,
    modes: {
      light: {
        name: light.name,
        primary: light.primary,
        secondary: light.secondary,
        accent: light.accent,
        background: light.background,
        surface: light.surface,
        text: light.text,
        muted: light.muted,
        border: light.border,
        success: light.success,
        warning: light.warning,
        danger: light.danger,
      },
      dark: {
        name: modes.dark.name,
        primary: modes.dark.primary,
        secondary: modes.dark.secondary,
        accent: modes.dark.accent,
        background: modes.dark.background,
        surface: modes.dark.surface,
        text: modes.dark.text,
        muted: modes.dark.muted,
        border: modes.dark.border,
        success: modes.dark.success,
        warning: modes.dark.warning,
        danger: modes.dark.danger,
      },
    },
    palette: {
      name: light.name,
      primary: light.primary,
      secondary: light.secondary,
      accent: light.accent,
      background: light.background,
      surface: light.surface,
      text: light.text,
      muted: light.muted,
      border: light.border,
      success: light.success,
      warning: light.warning,
      danger: light.danger,
    },
    typography: {
      font: typography.font,
      stack: typography.stack,
      heading: typography.heading,
      body: typography.body,
      button: typography.button,
      small: typography.small,
      hero: typography.hero,
    },
    spacing: {
      scale: config.spacing,
      section: spacingPx.section,
      gap: spacingPx.gap,
    },
    radius: {
      scale: radiusTokens.scale,
      base: radiusTokens.base,
      none: radiusTokens.none,
      sm: radiusTokens.sm,
      md: radiusTokens.md,
      lg: radiusTokens.lg,
      xl: radiusTokens.xl,
      full: radiusTokens.full,
    },
    shadow: shadows,
    animation: animations,
    button: {
      style: buttonStyle,
      radius: buttonRadius,
      shadow: shadows[buttonShadowToken(config.radius)].value,
    },
    card: {
      radius: radiusTokens.base,
      shadow: shadows[cardShadowToken(config.radius)].value,
    },
  };

  THEME_META.set(theme, {
    design: {
      theme: config.name,
      palette: config.palette,
      font: config.font,
      borderRadius: config.radius,
      spacing: config.spacing,
      animation: config.animation,
      imageStyle: config.imageStyle,
      sectionStyle: config.sectionStyle,
    },
    imageStyle: config.imageStyle,
    sectionStyle: config.sectionStyle,
  });

  return theme;
}

export function paletteFor(theme: Theme, mode: ThemeMode = "light"): Theme["palette"] {
  return theme.modes[mode];
}

export function themeCssVars(
  theme: Theme,
  _mode: ThemeMode = "light",
): Record<string, string> {
  return {
    ...spacingCssVars(),
    ...colorModeStorageVars(theme.modes),
    ...rendererCssVars(theme),
    ...typographyCssVars(theme.typography),
    ...radiusCssVars(theme.radius),
    ...animationCssVars(theme.animation),
    "--site-section-y": theme.spacing.section,
    "--site-gap": theme.spacing.gap,
    ...shadowCssVars(theme.shadow),
    "--theme-button-radius": theme.button.radius,
  };
}
