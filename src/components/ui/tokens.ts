/**
 * Crestis Design Tokens — semantic spacing & sizing for the UI Kit.
 * Responsive breakpoints: see responsive.ts (single source).
 */

import {
  responsiveGridCols,
  responsiveInset,
  responsivePaddingX,
  responsivePaddingY,
  responsiveSize,
  type ResponsiveGridCols,
} from "./responsive";

export type SpacingToken = keyof typeof spacing;
export type PaddingToken = keyof typeof padding;
export type PaddingXToken = keyof typeof paddingX;
export type PaddingYToken = keyof typeof paddingY;
export type SectionSpacingToken = keyof typeof sectionSpacing;
export type MarginTopToken = keyof typeof marginTop;
export type RadiusToken = keyof typeof radius;
export type SizeToken = keyof typeof size;

/** Gap between flex/grid items */
export const spacing = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
  "2xl": "gap-8",
  "3xl": "gap-10",
} as const;

/** Padding — all sides */
export const padding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
} as const;

/** Horizontal padding */
export const paddingX = {
  none: "",
  site: responsivePaddingX.site,
  button: "px-6",
  input: "px-4",
  badge: "px-4",
} as const;

/** Vertical padding */
export const paddingY = {
  none: "",
  sm: "py-2",
  md: "py-3",
  lg: "py-4",
  xl: "py-10",
  "2xl": "py-12",
  "3xl": "py-14",
  "4xl": responsivePaddingY.sectionLg,
  input: "py-2.5",
  list: "py-5",
} as const;

/** Section vertical rhythm */
export const sectionSpacing = {
  none: paddingY.none,
  md: paddingY["3xl"],
  lg: paddingY["4xl"],
} as const;

/** Margin top */
export const marginTop = {
  none: "",
  tight: "mt-1",
  sm: "mt-4",
  md: "mt-6",
  lg: "mt-8",
  xl: "mt-10",
  "2xl": "mt-12",
} as const;

/** Fixed component insets */
export const inset = {
  button: `${paddingX.button} ${paddingY.md}`,
  input: `${paddingX.input} ${paddingY.input}`,
  badge: `${paddingX.badge} ${paddingY.sm}`,
  accordionItem: paddingY.lg,
  heroCard: responsiveInset.heroCard,
} as const;

/** Border radius */
export const radius = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  full: "rounded-full",
} as const;

/** Layout sizes */
export const size = {
  heroMin: responsiveSize.heroMin,
  heroMinLg: responsiveSize.heroMinLg,
  heroPanelMin: responsiveSize.heroPanelMin,
  heroSplitImageMin: responsiveSize.heroSplitImageMin,
  aboutImage: responsiveSize.aboutImage,
  avatarSm: "h-8 w-8 text-xs",
  avatarMd: "h-10 w-10 text-sm",
  avatarLg: "h-14 w-14 text-base",
  logo: "h-8 w-28",
  serviceIconSm: "h-9 w-9",
  serviceIconMd: "h-10 w-10",
  serviceIconLg: "h-12 w-12",
} as const;

/** Max content width */
export const maxWidth = {
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  full: "max-w-full",
} as const;

/** Responsive grid column presets */
export const gridCols = responsiveGridCols;

/** Padding bottom */
export const paddingBottom = {
  sm: "pb-4",
} as const;

/** Stack gap aliases */
export const stackGap = {
  none: spacing.none,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.lg,
  lg: spacing["2xl"],
} as const;

/** Grid gap aliases */
export const gridGap = {
  sm: spacing.md,
  md: spacing.xl,
  lg: spacing["3xl"],
} as const;

export type StackGapToken = keyof typeof stackGap;
export type GridGapToken = keyof typeof gridGap;
export type GridColsToken = ResponsiveGridCols;
export type MaxWidthToken = keyof typeof maxWidth;

export { typographyScale } from "./typography";
