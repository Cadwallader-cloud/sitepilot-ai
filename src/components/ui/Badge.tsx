"use client";

import type { UiTone } from "./theme";
import { useThemeStyle } from "./theme-context";

export type BadgeProps = {
  label: string;
  tone?: UiTone;
  className?: string;
};

const toneClass: Record<UiTone, string> = {
  light: "text-white/90",
  dark: "text-zinc-600",
  brand: "",
  muted: "text-zinc-500",
};

export function Badge({ label, tone = "brand", className = "" }: BadgeProps) {
  const { color } = useThemeStyle();

  if (!label.trim()) return null;

  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.2em] ${toneClass[tone]} ${className}`.trim()}
      style={tone === "brand" ? color() : undefined}
      data-component="Badge"
    >
      {label}
    </p>
  );
}
