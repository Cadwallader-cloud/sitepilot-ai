/**
 * Responsive System — Mobile → Tablet (md) → Desktop (lg).
 * Breakpoint prefixes live only in components/ui/responsive.ts.
 */

export {
  BREAKPOINT,
  RESPONSIVE_SYSTEM_RULE,
  VIEWPORTS,
  responsive,
  responsiveGridCols,
  responsiveInset,
  responsiveLayout,
  responsivePaddingX,
  responsivePaddingY,
  responsiveSize,
  responsiveStack,
  responsiveTypography,
  responsiveVisibility,
  resolveAlign,
  resolveDirection,
  type ResponsiveAlignValue,
  type ResponsiveDirection,
  type ResponsiveGridCols,
  type Viewport,
} from "@/components/ui/responsive";

/** Tailwind breakpoint prefixes forbidden outside responsive.ts */
export const FORBIDDEN_BREAKPOINT_PATTERN = /\b(?:sm|md|lg):[a-z]/;

/** Component Engine paths scanned for manual breakpoints */
export const RESPONSIVE_SCAN_PATHS = [
  "components/ui",
  "components/hero",
  "components/services",
  "components/templates/about",
  "components/templates/faq",
  "components/templates/navbar",
  "components/templates/footer",
  "components/templates/renderer.tsx",
] as const;
