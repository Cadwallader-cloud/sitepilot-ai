/**
 * Design Tokens rule — UI Kit consumes tokens from components/ui/tokens.ts only.
 */

export const DESIGN_TOKENS_RULE =
  "No magic spacing values in UI Kit — use spacing.xl, padding.md, marginTop.lg, etc." as const;

export const DESIGN_TOKEN_SOURCES = ["@/components/ui/tokens", "@/components/ui"] as const;

/** Tailwind utility patterns forbidden outside tokens.ts */
export const FORBIDDEN_SPACING_PATTERN =
  /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(?:\d+|(?:\d+\.?\d*))/;
