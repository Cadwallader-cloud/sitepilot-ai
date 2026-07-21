import type { UiTone } from "./theme";
import { responsiveTypography } from "./responsive";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type HeadingSize = "sm" | "md" | "lg" | "xl";

export const toneHeadingClass: Record<UiTone, string> = {
  light: "text-white",
  dark: "text-zinc-900",
  brand: "",
  muted: "text-zinc-800",
};

export const toneTextClass: Record<UiTone, string> = {
  light: "text-white/90",
  dark: "text-zinc-600",
  brand: "text-zinc-600",
  muted: "text-zinc-500",
};

export const headingSizeClass: Record<HeadingSize, string> = {
  sm: responsiveTypography.headingSm,
  md: responsiveTypography.headingMd,
  lg: responsiveTypography.headingLg,
  xl: responsiveTypography.headingXl,
};

export const textSizeClass: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const typographyScale = {
  subheadline: responsiveTypography.subheadline,
} as const;
