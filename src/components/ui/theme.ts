import type { Theme } from "@/lib/website";
import { colorsForPalette, type DesignPaletteName } from "@/lib/design-system";
import { radius } from "./tokens";

export type UiTone = "light" | "dark" | "brand" | "muted";
export type UiAlign = "left" | "center" | "right";

export function uiPrimary(theme: Theme): string {
  return colorsForPalette(theme.palette as DesignPaletteName).primary;
}

export function uiAccent(theme: Theme): string {
  return colorsForPalette(theme.palette as DesignPaletteName).accent;
}

export function uiButtonRadius(theme: Theme): string {
  if (theme.buttonStyle === "sharp") return radius.none;
  if (theme.buttonStyle === "pill") return radius.full;
  return radius.sm;
}

export function alignClass(align: UiAlign): string {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}
