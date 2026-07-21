import type { Theme } from "@/theme";
import { buttonRadiusClass, radiusClass } from "@/theme/tokens/radius";

export type EngineTone = "light" | "dark" | "brand" | "muted";
export type EngineAlign = "left" | "center" | "right";

export type EngineThemeSlice = {
  theme: Theme;
};

export function enginePrimary(theme: Theme): string {
  return theme.palette.primary;
}

export function engineAccent(theme: Theme): string {
  return theme.palette.accent;
}

export function engineButtonRadius(theme: Theme): string {
  return buttonRadiusClass(theme.button.style);
}

export { radiusClass, buttonRadiusClass };

export function alignClass(align: EngineAlign): string {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}
