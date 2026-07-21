import type { DesignFont } from "@/lib/design-system";

/** Typography roles — components use typography.body, never font-size: 18px. */
export type TypographyRole = "heading" | "body" | "button" | "small" | "hero";

export const TYPOGRAPHY_ROLES: readonly TypographyRole[] = [
  "heading",
  "body",
  "button",
  "small",
  "hero",
] as const;

export type TypographyRoleTokens = {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  /** Tailwind preset — defined only in this file */
  className: string;
};

export type TypographyTokens = {
  font: DesignFont;
  stack: string;
  heading: TypographyRoleTokens;
  body: TypographyRoleTokens;
  button: TypographyRoleTokens;
  small: TypographyRoleTokens;
  hero: TypographyRoleTokens;
};

const FONT_STACK: Record<DesignFont, string> = {
  Geist: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  Manrope: '"Manrope", ui-sans-serif, system-ui, sans-serif',
  "DM Sans": '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  "Source Serif": '"Source Serif 4", Georgia, "Times New Roman", serif',
  Inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
};

/** Role definitions — rem values + Tailwind classes */
const ROLE_TOKENS: Record<TypographyRole, TypographyRoleTokens> = {
  hero: {
    fontSize: "2.25rem",
    fontWeight: "700",
    lineHeight: "1.1",
    letterSpacing: "-0.025em",
    className: "text-4xl font-bold tracking-tight md:text-6xl",
  },
  heading: {
    fontSize: "1.875rem",
    fontWeight: "700",
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
    className: "text-3xl font-bold leading-tight md:text-4xl",
  },
  body: {
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.625",
    letterSpacing: "0",
    className: "text-base leading-relaxed md:text-lg",
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.25",
    letterSpacing: "0",
    className: "text-sm font-semibold leading-tight",
  },
  small: {
    fontSize: "0.75rem",
    fontWeight: "500",
    lineHeight: "1.375",
    letterSpacing: "0.025em",
    className: "text-xs leading-snug",
  },
};

/** Responsive heading scale — maps UI Heading sizes to role classes */
export const headingScaleClass = {
  sm: "text-2xl font-bold leading-tight md:text-3xl",
  md: ROLE_TOKENS.heading.className,
  lg: "text-4xl font-bold leading-tight md:text-5xl",
  xl: ROLE_TOKENS.hero.className,
} as const;

export const bodyScaleClass = {
  subheadline: ROLE_TOKENS.body.className,
} as const;

export function fontStackFor(font: DesignFont): string {
  return FONT_STACK[font] ?? FONT_STACK.Geist;
}

export function typographyTokensFor(font: DesignFont): TypographyTokens {
  return {
    font,
    stack: fontStackFor(font),
    ...ROLE_TOKENS,
  };
}

export function typographyRoleClass(role: TypographyRole): string {
  return ROLE_TOKENS[role].className;
}

export function typographyCssVars(
  typography: Pick<TypographyTokens, TypographyRole | "stack">,
): Record<string, string> {
  const vars: Record<string, string> = {
    "--font-family": typography.stack,
    "--site-font": typography.stack,
  };
  for (const role of TYPOGRAPHY_ROLES) {
    const t = typography[role];
    vars[`--font-${role}-size`] = t.fontSize;
    vars[`--font-${role}-weight`] = t.fontWeight;
    vars[`--font-${role}-line-height`] = t.lineHeight;
    vars[`--font-${role}-letter-spacing`] = t.letterSpacing;
  }
  return vars;
}
