export interface Palette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

export interface TypographyRoleStyle {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  className: string;
}

export interface Typography {
  font: string;
  stack: string;
  heading: TypographyRoleStyle;
  body: TypographyRoleStyle;
  button: TypographyRoleStyle;
  small: TypographyRoleStyle;
  hero: TypographyRoleStyle;
}

export interface Spacing {
  scale: string;
  section: string;
  gap: string;
}

export interface RadiusTokenStyle {
  rem: string;
  className: string;
}

export interface Radius {
  scale: string;
  base: string;
  none: RadiusTokenStyle;
  sm: RadiusTokenStyle;
  md: RadiusTokenStyle;
  lg: RadiusTokenStyle;
  xl: RadiusTokenStyle;
  full: RadiusTokenStyle;
}

export interface ShadowTokenStyle {
  value: string;
  className: string;
}

export interface Shadow {
  none: ShadowTokenStyle;
  soft: ShadowTokenStyle;
  medium: ShadowTokenStyle;
  large: ShadowTokenStyle;
}

export type AnimationToken = "none" | "fade" | "slide" | "scale";

export interface AnimationTokenStyle {
  duration: string;
  className: string;
}

export type AnimationScale = Record<AnimationToken, AnimationTokenStyle>;

export interface Animation extends AnimationScale {
  style: string;
  entrance: AnimationToken;
  duration: string;
}

export interface ButtonTheme {
  style: "sharp" | "rounded" | "pill";
  radius: string;
  shadow: string;
}

export interface CardTheme {
  radius: string;
  shadow: string;
}

export type ThemeMode = "light" | "dark";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark"] as const;

export interface ThemeModes {
  light: Palette;
  dark: Palette;
}

export interface Theme {
  id: string;
  name: string;
  /** Light + dark semantic palettes — every preset supports both modes. */
  modes: ThemeModes;
  /** Active light palette — alias for modes.light (backward compat). */
  palette: Palette;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadow: Shadow;
  animation: Animation;
  button: ButtonTheme;
  card: CardTheme;
}
