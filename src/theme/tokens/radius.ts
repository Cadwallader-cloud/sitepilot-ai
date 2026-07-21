import type { DesignBorderRadius } from "@/lib/design-system";

/** Radius scale — components use radius.md, never border-radius: 12px. */
export type RadiusToken = "none" | "sm" | "md" | "lg" | "xl" | "full";

export const RADIUS_TOKENS: readonly RadiusToken[] = [
  "none",
  "sm",
  "md",
  "lg",
  "xl",
  "full",
] as const;

export type RadiusTokenStyle = {
  rem: string;
  className: string;
};

export type RadiusScale = Record<RadiusToken, RadiusTokenStyle>;

/** Canonical radius definitions — rem + Tailwind class */
export const radius: RadiusScale = {
  none: { rem: "0", className: "rounded-none" },
  sm: { rem: "0.5rem", className: "rounded-lg" },
  md: { rem: "0.75rem", className: "rounded-xl" },
  lg: { rem: "1rem", className: "rounded-2xl" },
  xl: { rem: "1.5rem", className: "rounded-3xl" },
  full: { rem: "9999px", className: "rounded-full" },
};

/** Theme Engine design scale → site base radius token */
const DESIGN_RADIUS_BASE: Record<DesignBorderRadius, RadiusToken> = {
  Sharp: "sm",
  Medium: "lg",
  Soft: "xl",
};

export type ThemeButtonStyle = "sharp" | "rounded" | "pill";

export function radiusClass(token: RadiusToken): string {
  return radius[token].className;
}

export function radiusRem(token: RadiusToken): string {
  return radius[token].rem;
}

export function radiusPxFor(design: DesignBorderRadius): string {
  const token = DESIGN_RADIUS_BASE[design] ?? "lg";
  return radius[token].rem;
}

export function radiusTokensFor(design: DesignBorderRadius): {
  scale: DesignBorderRadius;
  base: string;
} & RadiusScale {
  const baseToken = DESIGN_RADIUS_BASE[design] ?? "lg";
  return {
    scale: design,
    base: radius[baseToken].rem,
    ...radius,
  };
}

export function buttonStyleFromRadius(
  design: DesignBorderRadius,
): ThemeButtonStyle {
  if (design === "Sharp") return "sharp";
  if (design === "Soft") return "pill";
  return "rounded";
}

export function buttonRadiusToken(style: ThemeButtonStyle): RadiusToken {
  if (style === "sharp") return "none";
  if (style === "pill") return "full";
  return "sm";
}

export function buttonRadiusPx(style: ThemeButtonStyle): string {
  return radiusRem(buttonRadiusToken(style));
}

export function buttonRadiusClass(style: ThemeButtonStyle): string {
  return radiusClass(buttonRadiusToken(style));
}

export function radiusCssVars(radiusTheme: {
  base: string;
} & RadiusScale): Record<string, string> {
  const vars: Record<string, string> = { "--site-radius": radiusTheme.base };
  for (const key of RADIUS_TOKENS) {
    vars[`--radius-${key}`] = radiusTheme[key].rem;
  }
  return vars;
}
