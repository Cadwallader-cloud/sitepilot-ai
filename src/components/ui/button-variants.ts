/**
 * Button variant presets — one map, no inline branching in Button.tsx.
 */

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Static surface classes per variant (color fills come from theme inline). */
export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "border border-zinc-200 bg-white text-zinc-800",
  ghost: "bg-transparent",
};
