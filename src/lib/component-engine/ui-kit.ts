/**
 * Crestis UI Kit — canonical component list (Phase 2.2 design system).
 * Rule: one component, one responsibility.
 */

export const UI_KIT_COMPONENTS = [
  "Button",
  "Card",
  "Section",
  "Container",
  "Grid",
  "Stack",
  "Heading",
  "Text",
  "Input",
  "Textarea",
  "Accordion",
  "Navbar",
  "Footer",
  "Badge",
  "Avatar",
  "Logo",
  "Icon",
] as const;

export type UiKitComponent = (typeof UI_KIT_COMPONENTS)[number];
