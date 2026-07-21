/**
 * Crestis Design Tokens — semantic spacing & sizing for the UI Kit.
 * Tailwind classes derived from @/theme/tokens/spacing (single source).
 */

import {
  gapClass,
  marginTopClass,
  paddingClass,
  paddingXClass,
  paddingYClass,
  spacing as spacingScale,
  type SpacingToken,
} from "@/theme/tokens/spacing";
import {
  radius as radiusScale,
  radiusClass,
  type RadiusToken,
} from "@/theme/tokens/radius";
import {
  shadow as shadowScale,
  shadowClass,
  type ShadowToken,
} from "@/theme/tokens/shadow";
import {
  animation as animationScale,
  animationClass,
  type AnimationToken,
} from "@/theme/tokens/animation";
import {
  responsiveGridCols,
  responsiveInset,
  responsivePaddingX,
  responsivePaddingY,
  responsiveSize,
  type ResponsiveGridCols,
} from "./responsive";

export type { SpacingToken };

export type SpacingTokenKey = SpacingToken;
export type PaddingToken = "none" | "sm" | "md" | "lg" | "xl";
export type PaddingXToken = keyof typeof paddingX;
export type PaddingYToken = keyof typeof paddingY;
export type SectionSpacingToken = keyof typeof sectionSpacing;
export type MarginTopToken = keyof typeof marginTop;
export type SizeToken = keyof typeof size;

/** Gap between flex/grid items — spacing.xl not gap-6 */
export const spacing = {
  none: gapClass("none"),
  xs: gapClass("xs"),
  sm: gapClass("sm"),
  md: gapClass("md"),
  lg: gapClass("lg"),
  xl: gapClass("xl"),
  "2xl": gapClass("2xl"),
  "3xl": gapClass("3xl"),
} as const;

/** Padding — all sides */
export const padding = {
  none: paddingClass("none"),
  sm: paddingClass("sm"),
  md: paddingClass("md"),
  lg: paddingClass("lg"),
  xl: paddingClass("xl"),
} as const;

/** Horizontal padding */
export const paddingX = {
  none: "",
  site: responsivePaddingX.site,
  button: paddingXClass("lg"),
  input: paddingXClass("sm"),
  badge: paddingXClass("sm"),
} as const;

/** Vertical padding */
export const paddingY = {
  none: "",
  sm: paddingYClass("sm"),
  md: paddingYClass("md"),
  lg: paddingYClass("lg"),
  xl: paddingYClass("xl"),
  "2xl": paddingYClass("2xl"),
  "3xl": paddingYClass("3xl"),
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
  none: marginTopClass("none"),
  tight: marginTopClass("xs"),
  sm: marginTopClass("sm"),
  md: marginTopClass("md"),
  lg: marginTopClass("lg"),
  xl: marginTopClass("xl"),
  "2xl": marginTopClass("2xl"),
} as const;

/** Fixed component insets */
export const inset = {
  button: `${paddingX.button} ${paddingY.md}`,
  input: `${paddingX.input} ${paddingY.input}`,
  badge: `${paddingX.badge} ${paddingY.sm}`,
  accordionItem: paddingY.lg,
  heroCard: responsiveInset.heroCard,
} as const;

export type { RadiusToken, ShadowToken, AnimationToken };

/** Border radius — radius.md not rounded-xl */
export const radius = {
  none: radiusClass("none"),
  sm: radiusClass("sm"),
  md: radiusClass("md"),
  lg: radiusClass("lg"),
  xl: radiusClass("xl"),
  full: radiusClass("full"),
} as const;

/** Box shadow — shadow.medium not shadow-md literals in templates */
export const shadow = {
  none: shadowClass("none"),
  soft: shadowClass("soft"),
  medium: shadowClass("medium"),
  large: shadowClass("large"),
} as const;

/** Motion — animation.fade not animate-fade-in literals in templates */
export const animation = {
  none: animationClass("none"),
  fade: animationClass("fade"),
  slide: animationClass("slide"),
  scale: animationClass("scale"),
} as const;

/** Renderer CSS variables — re-export from semantic-css (breaks typography cycle). */
export { css } from "./semantic-css";

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

/** Re-export canonical rem scale for Theme Engine consumers */
export { spacingScale, radiusScale, shadowScale, animationScale };
