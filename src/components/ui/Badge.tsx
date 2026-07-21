"use client";

import type { UiTone } from "./theme";
import { css } from "./tokens";
import { toneTextClass } from "./typography";

export type BadgeProps = {
  label: string;
  tone?: UiTone;
  className?: string;
};

const toneClass: Record<UiTone, string> = {
  light: `${css.invertedText}/90`,
  dark: css.muted,
  brand: css.primary,
  muted: css.muted,
};

export function Badge({ label, tone = "brand", className = "" }: BadgeProps) {
  if (!label.trim()) return null;

  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.2em] ${toneClass[tone] ?? toneTextClass[tone]} ${className}`.trim()}
      data-component="Badge"
    >
      {label}
    </p>
  );
}
