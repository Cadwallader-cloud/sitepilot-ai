/**
 * Design Tokens — no magic px/rem/hex in components.
 *
 * ❌ padding: 76px
 * ✅ spacing.xl
 *
 * ❌ color: "#71717a"
 * ✅ palette.muted
 */

export const DESIGN_TOKENS_RULE =
  "No magic spacing, color, typography, radius, shadow, or animation values — use spacing.xl, palette.text, typography.body, radius.md, shadow.medium, animation.fade from design tokens." as const;

/** Forbidden inline styles outside token definition files */
export const FORBIDDEN_MAGIC_SPACING_PATTERN =
  /\b(?:padding|margin|gap|top|right|bottom|left|width|height|minHeight|maxWidth|minWidth)\s*:\s*["']?\d+(?:\.\d+)?(?:px|rem)/;

export const FORBIDDEN_MAGIC_COLOR_PATTERN =
  /\b(?:color|backgroundColor|borderColor|fill|stroke)\s*:\s*["']?#[0-9a-fA-F]{3,8}/;

export const FORBIDDEN_ARBITRARY_SPACING_PATTERN =
  /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-(?:\d+(?:\.\d+)?|\[[^\]]+\])/;

export const SPACING_TOKEN_SOURCES = [
  "src/theme/tokens/spacing.ts",
  "src/components/ui/tokens.ts",
  "src/components/ui/responsive.ts",
] as const;

export const FORBIDDEN_MAGIC_TYPOGRAPHY_PATTERN =
  /\b(?:fontSize|lineHeight|letterSpacing|font-weight)\s*:\s*["']?[\d.]+(?:px|rem)/;

export const COLOR_TOKEN_SOURCES = ["src/theme/tokens/colors.ts"] as const;

export const TYPOGRAPHY_TOKEN_SOURCES = [
  "src/theme/tokens/typography.ts",
  "src/components/ui/typography.ts",
] as const;

export const FORBIDDEN_MAGIC_RADIUS_PATTERN =
  /\b(?:borderRadius|border-radius)\s*:\s*["']?\d+(?:\.\d+)?(?:px|rem)/;

export const RADIUS_TOKEN_SOURCES = ["src/theme/tokens/radius.ts"] as const;

export const FORBIDDEN_MAGIC_SHADOW_PATTERN =
  /\b(?:boxShadow|box-shadow)\s*:\s*["']?(?!none\b)[^"']+\d+(?:\.\d+)?(?:px|rem)/;

export const SHADOW_TOKEN_SOURCES = ["src/theme/tokens/shadow.ts"] as const;

export const FORBIDDEN_MAGIC_ANIMATION_PATTERN =
  /\b(?:animation|transitionDuration|transition-duration)\s*:\s*["']?[\d.]+(?:ms|s)/;

export const ANIMATION_TOKEN_SOURCES = ["src/theme/tokens/animation.ts"] as const;
