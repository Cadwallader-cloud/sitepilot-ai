import type { UiTone } from "./theme";
import {
  bodyScaleClass,
  headingScaleClass,
  typographyRoleClass,
} from "@/theme/tokens/typography";
import { css } from "./semantic-css";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type HeadingSize = "sm" | "md" | "lg" | "xl";

export const toneHeadingClass: Record<UiTone, string> = {
  light: css.invertedText,
  dark: css.text,
  brand: css.primary,
  muted: css.muted,
};

export const toneTextClass: Record<UiTone, string> = {
  light: `${css.invertedText}/90`,
  dark: css.muted,
  brand: css.muted,
  muted: css.muted,
};

/** Heading sizes → typography.heading / typography.hero tokens */
export const headingSizeClass: Record<HeadingSize, string> = {
  sm: headingScaleClass.sm,
  md: headingScaleClass.md,
  lg: headingScaleClass.lg,
  xl: headingScaleClass.xl,
};

/** Text sizes → typography.body / typography.small tokens */
export const textSizeClass: Record<TextSize, string> = {
  xs: typographyRoleClass("small"),
  sm: typographyRoleClass("button"),
  base: typographyRoleClass("body"),
  lg: typographyRoleClass("body"),
  xl: typographyRoleClass("heading"),
};

export const typographyScale = {
  subheadline: bodyScaleClass.subheadline,
  hero: typographyRoleClass("hero"),
  heading: typographyRoleClass("heading"),
  body: typographyRoleClass("body"),
  button: typographyRoleClass("button"),
  small: typographyRoleClass("small"),
} as const;

export { typographyRoleClass };
