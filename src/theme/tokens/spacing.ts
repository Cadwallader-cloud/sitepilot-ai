import type { DesignSpacing } from "@/lib/design-system";

/**
 * Crestis spacing scale — single source of truth.
 * Components use spacing.xl, never padding: 76px.
 */
export const spacing = {
  none: {
    rem: "0",
    gap: "gap-0",
    p: "",
    px: "",
    py: "",
    mt: "",
  },
  xs: {
    rem: "0.25rem",
    gap: "gap-1",
    p: "",
    px: "",
    py: "",
    mt: "mt-1",
  },
  sm: {
    rem: "0.5rem",
    gap: "gap-2",
    p: "p-4",
    px: "px-4",
    py: "py-2",
    mt: "mt-4",
  },
  md: {
    rem: "0.75rem",
    gap: "gap-3",
    p: "p-6",
    px: "px-4",
    py: "py-3",
    mt: "mt-6",
  },
  lg: {
    rem: "1rem",
    gap: "gap-4",
    p: "p-8",
    px: "px-6",
    py: "py-4",
    mt: "mt-8",
  },
  xl: {
    rem: "1.5rem",
    gap: "gap-6",
    p: "p-10",
    px: "",
    py: "py-10",
    mt: "mt-10",
  },
  "2xl": {
    rem: "2rem",
    gap: "gap-8",
    p: "",
    px: "",
    py: "py-12",
    mt: "mt-12",
  },
  "3xl": {
    rem: "2.5rem",
    gap: "gap-10",
    p: "",
    px: "",
    py: "py-14",
    mt: "",
  },
  "4xl": {
    rem: "3rem",
    gap: "gap-12",
    p: "",
    px: "",
    py: "",
    mt: "",
  },
} as const;

export type SpacingToken = keyof typeof spacing;

/** Section rhythm — maps Theme Engine DesignSpacing → rem */
export const spacingSection = {
  Compact: "2.5rem",
  Medium: "3.5rem",
  Large: "4.5rem",
} as const satisfies Record<DesignSpacing, string>;

/** Inter-block gap per design scale */
export const spacingGap = {
  Compact: spacing.sm.rem,
  Medium: spacing.lg.rem,
  Large: spacing.xl.rem,
} as const satisfies Record<DesignSpacing, string>;

export function spacingRem(token: SpacingToken): string {
  return spacing[token].rem;
}

export function gapClass(token: SpacingToken): string {
  return spacing[token].gap;
}

export function paddingClass(token: SpacingToken): string {
  return spacing[token].p;
}

export function paddingYClass(token: SpacingToken): string {
  return spacing[token].py;
}

export function paddingXClass(token: SpacingToken): string {
  return spacing[token].px;
}

export function marginTopClass(token: SpacingToken): string {
  return spacing[token].mt;
}

export function spacingPxFor(scale: DesignSpacing): {
  section: string;
  gap: string;
} {
  return {
    section: spacingSection[scale] ?? spacingSection.Medium,
    gap: spacingGap[scale] ?? spacingGap.Medium,
  };
}

export function spacingCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(spacing)) {
    vars[`--spacing-${key}`] = value.rem;
  }
  vars["--spacing-section-compact"] = spacingSection.Compact;
  vars["--spacing-section-medium"] = spacingSection.Medium;
  vars["--spacing-section-large"] = spacingSection.Large;
  return vars;
}
