/**
 * Button variant presets — one map, no inline branching in Button.tsx.
 */

import { css } from "./semantic-css";

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Variant surfaces — colors from Renderer CSS variables only. */
export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: `${css.primaryBg} ${css.onPrimary}`,
  secondary: `${css.borderAll} ${css.surface} ${css.text}`,
  ghost: "bg-transparent text-[var(--primary)]",
};
