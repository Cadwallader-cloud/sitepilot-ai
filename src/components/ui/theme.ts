import { buttonRadiusClass as themeButtonRadiusClass } from "@/theme/tokens/radius";

export type UiTone = "light" | "dark" | "brand" | "muted";
export type UiAlign = "left" | "center" | "right";

export { themeButtonRadiusClass as buttonRadiusClass };

export function alignClass(align: UiAlign): string {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}
