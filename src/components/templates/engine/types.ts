import type { Theme } from "@/lib/website";
import { colorsForPalette, type DesignPaletteName } from "@/lib/design-system";

export type EngineTone = "light" | "dark" | "brand" | "muted";
export type EngineAlign = "left" | "center" | "right";

export type EngineThemeSlice = {
  theme: Theme;
};

export function enginePrimary(theme: Theme): string {
  return colorsForPalette(theme.palette as DesignPaletteName).primary;
}

export function engineAccent(theme: Theme): string {
  return colorsForPalette(theme.palette as DesignPaletteName).accent;
}

export function engineButtonRadius(theme: Theme): string {
  if (theme.buttonStyle === "sharp") return "rounded-none";
  if (theme.buttonStyle === "pill") return "rounded-full";
  return "rounded-lg";
}

export function alignClass(align: EngineAlign): string {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}
