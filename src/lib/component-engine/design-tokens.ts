/**
 * Design Tokens rule — UI Kit consumes tokens from theme + components/ui/tokens.ts.
 */

export const DESIGN_TOKENS_RULE =
  "No magic spacing values in UI Kit — use spacing.xl, padding.md, marginTop.lg, etc." as const;

export const DESIGN_TOKEN_SOURCES = [
  "@/theme/tokens/spacing",
  "@/components/ui/tokens",
  "@/components/ui",
] as const;

/** Tailwind utility patterns forbidden outside token definition files */
export const FORBIDDEN_SPACING_PATTERN =
  /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(?:\d+(?:\.\d+)?|\[[^\]]+\])/;
