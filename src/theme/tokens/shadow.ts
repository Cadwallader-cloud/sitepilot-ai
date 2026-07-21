import type { DesignBorderRadius, DesignPaletteName } from "@/lib/design-system";

/** Shadow scale — components use shadow.medium, never box-shadow: 0 4px 12px. */
export type ShadowToken = "none" | "soft" | "medium" | "large";

export const SHADOW_TOKENS: readonly ShadowToken[] = [
  "none",
  "soft",
  "medium",
  "large",
] as const;

export type ShadowTokenStyle = {
  value: string;
  className: string;
};

export type ShadowScale = Record<ShadowToken, ShadowTokenStyle>;

/** Canonical shadow definitions — CSS value + Tailwind class */
export const shadow: ShadowScale = {
  none: { value: "none", className: "shadow-none" },
  soft: {
    value: "0 1px 3px rgb(15 23 42 / 0.08)",
    className: "shadow-sm",
  },
  medium: {
    value: "0 6px 16px rgb(15 23 42 / 0.1)",
    className: "shadow-md",
  },
  large: {
    value: "0 16px 40px rgb(15 23 42 / 0.14)",
    className: "shadow-lg",
  },
};

const SHADOW_BY_RADIUS: Record<
  DesignBorderRadius,
  Pick<ShadowScale, "soft" | "medium" | "large">
> = {
  Sharp: {
    soft: {
      value: "0 1px 2px rgb(15 23 42 / 0.06)",
      className: "shadow-sm",
    },
    medium: {
      value: "0 4px 12px rgb(15 23 42 / 0.08)",
      className: "shadow-md",
    },
    large: {
      value: "0 12px 32px rgb(15 23 42 / 0.12)",
      className: "shadow-lg",
    },
  },
  Medium: {
    soft: {
      value: "0 1px 3px rgb(15 23 42 / 0.08)",
      className: "shadow-sm",
    },
    medium: {
      value: "0 6px 16px rgb(15 23 42 / 0.1)",
      className: "shadow-md",
    },
    large: {
      value: "0 16px 40px rgb(15 23 42 / 0.14)",
      className: "shadow-lg",
    },
  },
  Soft: {
    soft: {
      value: "0 2px 4px rgb(15 23 42 / 0.06)",
      className: "shadow-sm",
    },
    medium: {
      value: "0 8px 24px rgb(15 23 42 / 0.1)",
      className: "shadow-md",
    },
    large: {
      value: "0 20px 48px rgb(15 23 42 / 0.14)",
      className: "shadow-xl",
    },
  },
};

const BUTTON_SHADOW_BY_RADIUS: Record<DesignBorderRadius, ShadowToken> = {
  Sharp: "soft",
  Medium: "soft",
  Soft: "medium",
};

const CARD_SHADOW_BY_RADIUS: Record<DesignBorderRadius, ShadowToken> = {
  Sharp: "soft",
  Medium: "soft",
  Soft: "medium",
};

const PALETTE_SHADOW_BOOST: Partial<Record<DesignPaletteName, number>> = {
  "Amber Trade": 1.08,
  "Electric Orange": 1.06,
  "Warm Burgundy": 1.05,
};

function boostShadowValue(value: string, factor: number): string {
  if (factor === 1 || value === "none") return value;
  return value.replace(
    /rgb\(15 23 42 \/ ([\d.]+)\)/g,
    (_, alpha: string) =>
      `rgb(15 23 42 / ${Math.min(0.2, parseFloat(alpha) * factor).toFixed(3)})`,
  );
}

function boostShadowStyle(
  style: ShadowTokenStyle,
  factor: number,
): ShadowTokenStyle {
  if (factor === 1) return style;
  return {
    ...style,
    value: boostShadowValue(style.value, factor),
  };
}

export function shadowClass(token: ShadowToken): string {
  return shadow[token].className;
}

export function shadowValue(token: ShadowToken): string {
  return shadow[token].value;
}

export function buttonShadowToken(
  borderRadius: DesignBorderRadius,
): ShadowToken {
  return BUTTON_SHADOW_BY_RADIUS[borderRadius] ?? "soft";
}

export function cardShadowToken(borderRadius: DesignBorderRadius): ShadowToken {
  return CARD_SHADOW_BY_RADIUS[borderRadius] ?? "soft";
}

export function shadowsForPreset(
  palette: DesignPaletteName,
  borderRadius: DesignBorderRadius,
): ShadowScale {
  const base = SHADOW_BY_RADIUS[borderRadius] ?? SHADOW_BY_RADIUS.Medium;
  const factor = PALETTE_SHADOW_BOOST[palette] ?? 1;

  return {
    none: shadow.none,
    soft: boostShadowStyle(base.soft, factor),
    medium: boostShadowStyle(base.medium, factor),
    large: boostShadowStyle(base.large, factor),
  };
}

export function shadowCssVars(shadowTheme: ShadowScale): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of SHADOW_TOKENS) {
    vars[`--shadow-${key}`] = shadowTheme[key].value;
  }
  return vars;
}

/** @deprecated Use ShadowScale */
export type ThemeShadowTokens = ShadowScale;
