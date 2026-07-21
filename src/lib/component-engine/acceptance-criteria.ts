/**
 * Phase 2.2 gate — acceptance criteria before next phase.
 */

export const ACCEPTANCE_CRITERIA = [
  "Hero composes from small ui/ components",
  "About composes from small ui/ components",
  "Services composes from small ui/ components",
  "FAQ composes from small ui/ components",
  "No duplicate Button implementation",
  "No duplicate Card implementation",
  "No duplicate Container implementation",
  "All block components support Theme injection",
] as const;

export type AcceptanceCriterion = (typeof ACCEPTANCE_CRITERIA)[number];

/** Block template paths scanned for primitive duplication. */
export const COMPOSITION_SCAN_PATHS = [
  "components/hero",
  "components/services",
  "components/templates/about",
  "components/templates/faq",
  "components/templates/navbar",
  "components/templates/footer",
  "components/templates/renderer.tsx",
] as const;

/** Canonical primitive locations — only these files may define Button / Card / Container. */
export const CANONICAL_PRIMITIVE_PATHS = {
  Button: "components/ui/Button.tsx",
  Card: "components/ui/Card.tsx",
  Container: "components/ui/Container.tsx",
} as const;

/** Inline CTA/button markup forbidden outside ui/Button.tsx. */
export const FORBIDDEN_DUPLICATE_BUTTON_PATTERN =
  /inline-flex items-center justify-center(?:[\s\S]{0,80}?)(?:px-6 py-3|rounded-full px-[46])/;

/** Inline card surfaces forbidden outside ui/Card.tsx. */
export const FORBIDDEN_DUPLICATE_CARD_PATTERN =
  /\bborder border-zinc-(?:100|200) bg-(?:white|zinc-50)\b/;

/** Container layout forbidden outside ui/Container.tsx. */
export const FORBIDDEN_DUPLICATE_CONTAINER_PATTERN =
  /\bmx-auto max-w-(?:\dxl|\d)\b/;

/** Components that consume injected theme (must use useTheme / useThemeStyle). */
export const THEME_AWARE_UI_COMPONENTS = [
  "Button",
  "Heading",
  "Text",
  "Logo",
  "Badge",
  "Section",
  "Image",
  "Accordion",
  "ThemeBar",
  "ThemeGradient",
] as const;

export type ThemeAwareUiComponent = (typeof THEME_AWARE_UI_COMPONENTS)[number];
