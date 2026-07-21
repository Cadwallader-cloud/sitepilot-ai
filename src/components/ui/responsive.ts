/**
 * Crestis Responsive System — Mobile → Tablet (md) → Desktop (lg).
 * Rule: breakpoint prefixes live ONLY in this file.
 */

import {
  bodyScaleClass,
  headingScaleClass,
} from "@/theme/tokens/typography";

export const VIEWPORTS = ["mobile", "tablet", "desktop"] as const;

export type Viewport = (typeof VIEWPORTS)[number];

export const RESPONSIVE_SYSTEM_RULE =
  "No manual sm:/md:/lg: in components — use responsive.* presets." as const;

/** Tailwind breakpoint prefixes */
export const BREAKPOINT = {
  tablet: "md",
  desktop: "lg",
} as const;

/** Compose mobile → tablet → desktop utility classes */
export function responsive(mobile: string, tablet?: string, desktop?: string): string {
  const parts = [mobile];
  if (tablet) parts.push(`${BREAKPOINT.tablet}:${tablet}`);
  if (desktop) parts.push(`${BREAKPOINT.desktop}:${desktop}`);
  return parts.join(" ");
}

export type AxisDirection = "row" | "column";

export type ResponsiveDirection =
  | AxisDirection
  | { mobile: AxisDirection; tablet?: AxisDirection; desktop?: AxisDirection };

export type ResponsiveAlign = "start" | "center" | "end" | "stretch";

export type ResponsiveAlignValue =
  | ResponsiveAlign
  | { mobile?: ResponsiveAlign; tablet?: ResponsiveAlign; desktop?: ResponsiveAlign };

const directionClass: Record<AxisDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};

const alignClass: Record<ResponsiveAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function resolveDirection(direction: ResponsiveDirection): string {
  if (direction === "row" || direction === "column") {
    return directionClass[direction];
  }

  const parts = [directionClass[direction.mobile]];
  if (direction.tablet) {
    parts.push(`${BREAKPOINT.tablet}:${directionClass[direction.tablet]}`);
  }
  if (direction.desktop) {
    parts.push(`${BREAKPOINT.desktop}:${directionClass[direction.desktop]}`);
  }
  return parts.join(" ");
}

export function resolveAlign(align: ResponsiveAlignValue): string {
  if (typeof align === "string") {
    return alignClass[align];
  }

  const parts: string[] = [];
  if (align.mobile) parts.push(alignClass[align.mobile]);
  if (align.tablet) parts.push(`${BREAKPOINT.tablet}:${alignClass[align.tablet]}`);
  if (align.desktop) parts.push(`${BREAKPOINT.desktop}:${alignClass[align.desktop]}`);
  return parts.join(" ");
}

/** Horizontal padding — site gutters */
export const responsivePaddingX = {
  site: responsive("px-5", "px-8", "px-12"),
} as const;

/** Vertical padding — sections & lists */
export const responsivePaddingY = {
  sectionLg: responsive("py-16", undefined, "py-24"),
} as const;

/** Grid columns — 1 col mobile, scale up on tablet/desktop */
export const responsiveGridCols = {
  1: "grid-cols-1",
  2: responsive("grid-cols-1", undefined, "grid-cols-2"),
  3: responsive("grid-cols-1", "grid-cols-2", "grid-cols-3"),
  threeFromTablet: responsive("grid-cols-1", "grid-cols-3"),
  4: responsive("grid-cols-1", "grid-cols-2", "grid-cols-4"),
} as const;

/** Layout sizes */
export const responsiveSize = {
  heroMin: responsive("min-h-[420px]", "min-h-[520px]"),
  heroMinLg: responsive("min-h-[480px]", "min-h-[560px]"),
  heroPanelMin: responsive("min-h-[360px]", "min-h-[440px]"),
  heroSplitImageMin: responsive("min-h-[280px]", undefined, "min-h-full"),
  aboutImage: responsive("h-64", "h-72"),
} as const;

/** Layout presets */
export const responsiveLayout = {
  heroSplit: `grid overflow-hidden ${responsive("grid-cols-1", undefined, "grid-cols-2")}`,
  flexAlignEndCenter: responsive("items-end", "items-center"),
  aboutSplit: `${responsive("grid-cols-1", undefined, "grid-cols-2")} ${resolveAlign({ desktop: "center" })}`,
} as const;

/** Visibility */
export const responsiveVisibility = {
  navDesktop: `hidden ${BREAKPOINT.tablet}:flex`,
  navDesktopLg: `hidden ${BREAKPOINT.desktop}:flex`,
  inlineFromTablet: `hidden ${BREAKPOINT.tablet}:inline-flex`,
} as const;

/** Typography scales — sourced from theme tokens */
export const responsiveTypography = {
  subheadline: bodyScaleClass.subheadline,
  headingSm: headingScaleClass.sm,
  headingMd: headingScaleClass.md,
  headingLg: headingScaleClass.lg,
  headingXl: headingScaleClass.xl,
} as const;

/** Insets with viewport scaling */
export const responsiveInset = {
  heroCard: responsive("p-8", "p-10"),
} as const;

/** Stack / flex direction presets */
export const responsiveStack = {
  columnRow: resolveDirection({ mobile: "column", tablet: "row" }),
  itemsStartFromTablet: resolveAlign({ tablet: "start" }),
} as const;

export type ResponsiveGridCols = keyof typeof responsiveGridCols;
