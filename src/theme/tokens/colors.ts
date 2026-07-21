import type { DesignPaletteName } from "@/lib/design-system";

/** Semantic color roles — components use palette.text, never #71717a. */
export type ColorToken =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "surface"
  | "text"
  | "muted"
  | "border"
  | "success"
  | "warning"
  | "danger";

export const COLOR_TOKENS: readonly ColorToken[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "muted",
  "border",
  "success",
  "warning",
  "danger",
] as const;

export type SemanticColors = Record<ColorToken, string>;

/** Universal status colors — consistent across presets */
const STATUS_COLORS: Pick<SemanticColors, "success" | "warning" | "danger"> = {
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
};

/** Default neutrals — overridden per preset when needed */
const NEUTRAL_COLORS: Pick<
  SemanticColors,
  "background" | "surface" | "text" | "muted" | "border"
> = {
  background: "#ffffff",
  surface: "#fafafa",
  text: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
};

type PaletteSeed = {
  primary: string;
  secondary: string;
  accent: string;
  surface?: string;
  background?: string;
};

const PALETTE_SEEDS: Record<DesignPaletteName, PaletteSeed> = {
  "Dark Blue": {
    primary: "#1e3a5f",
    secondary: "#334155",
    accent: "#2563eb",
    surface: "#f8fafc",
  },
  Teal: {
    primary: "#0f766e",
    secondary: "#115e59",
    accent: "#14b8a6",
    surface: "#f0fdfa",
  },
  "Clinical Mint": {
    primary: "#0e7490",
    secondary: "#155e75",
    accent: "#67e8f9",
    surface: "#f0f9ff",
  },
  "Warm Burgundy": {
    primary: "#7f1d1d",
    secondary: "#991b1b",
    accent: "#f59e0b",
    surface: "#fffbeb",
  },
  Slate: {
    primary: "#1f2937",
    secondary: "#374151",
    accent: "#6b7280",
    surface: "#f4f4f5",
  },
  Forest: {
    primary: "#15803d",
    secondary: "#166534",
    accent: "#22c55e",
    surface: "#f0fdf4",
  },
  "Amber Trade": {
    primary: "#a16207",
    secondary: "#ca8a04",
    accent: "#eab308",
    surface: "#fefce8",
  },
  "Electric Orange": {
    primary: "#c2410c",
    secondary: "#ea580c",
    accent: "#f97316",
    surface: "#fff7ed",
  },
};

export type SemanticPalette = SemanticColors & { name: DesignPaletteName };

export function semanticPaletteFor(
  palette: DesignPaletteName,
): SemanticPalette {
  const seed = PALETTE_SEEDS[palette] ?? PALETTE_SEEDS["Dark Blue"];
  return {
    name: palette,
    primary: seed.primary,
    secondary: seed.secondary,
    accent: seed.accent,
    background: seed.background ?? NEUTRAL_COLORS.background,
    surface: seed.surface ?? NEUTRAL_COLORS.surface,
    text: NEUTRAL_COLORS.text,
    muted: NEUTRAL_COLORS.muted,
    border: NEUTRAL_COLORS.border,
    ...STATUS_COLORS,
  };
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHex(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : normalized;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function mixHex(a: string, b: string, ratio: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(ar + (br - ar) * ratio, ag + (bg - ag) * ratio, ab + (bb - ab) * ratio);
}

/** Derive accessible dark palette from a light semantic palette. */
export function darkSemanticPaletteFor(light: SemanticPalette): SemanticPalette {
  const background = "#09090b";
  const surface = mixHex(background, light.primary, 0.18);

  return {
    name: light.name,
    primary: lightenHex(light.primary, 0.35),
    secondary: lightenHex(light.secondary, 0.28),
    accent: lightenHex(light.accent, 0.12),
    background,
    surface,
    text: "#fafafa",
    muted: "#a1a1aa",
    border: mixHex("#3f3f46", light.primary, 0.12),
    success: light.success,
    warning: light.warning,
    danger: light.danger,
  };
}

export function semanticModesFor(
  palette: DesignPaletteName,
): { light: SemanticPalette; dark: SemanticPalette } {
  const light = semanticPaletteFor(palette);
  return {
    light,
    dark: darkSemanticPaletteFor(light),
  };
}

/** @deprecated Prefer semanticPaletteFor — legacy primary/accent shim */
export function colorsForPalette(palette: DesignPaletteName): {
  primary: string;
  accent: string;
} {
  const full = semanticPaletteFor(palette);
  return { primary: full.primary, accent: full.accent };
}

export function colorCssVars(palette: SemanticColors): Record<string, string> {
  return {
    "--color-primary": palette.primary,
    "--color-secondary": palette.secondary,
    "--color-accent": palette.accent,
    "--color-background": palette.background,
    "--color-surface": palette.surface,
    "--color-text": palette.text,
    "--color-muted": palette.muted,
    "--color-border": palette.border,
    "--color-success": palette.success,
    "--color-warning": palette.warning,
    "--color-danger": palette.danger,
    "--site-primary": palette.primary,
    "--site-accent": palette.accent,
    "--theme-primary": palette.primary,
    "--theme-accent": palette.accent,
  };
}

/** Store both mode palettes — toggle with data-theme on .theme-root */
export function colorModeStorageVars(modes: {
  light: SemanticColors;
  dark: SemanticColors;
}): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const mode of ["light", "dark"] as const) {
    for (const key of COLOR_TOKENS) {
      vars[`--theme-${mode}-${key}`] = modes[mode][key];
    }
  }
  return vars;
}
