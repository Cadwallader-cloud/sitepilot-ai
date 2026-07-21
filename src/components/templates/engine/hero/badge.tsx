import type { EngineTone } from "../types";
import { css } from "@/components/ui/tokens";

export type BadgeProps = {
  label: string;
  tone?: EngineTone;
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: `${css.invertedText}/90`,
  dark: css.muted,
  brand: css.primary,
  muted: css.muted,
};

/** Eyebrow / trust chip above the headline. */
export function Badge({ label, tone = "brand", className = "" }: BadgeProps) {
  if (!label.trim()) return null;

  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.2em] ${toneClass[tone]} ${className}`.trim()}
      data-component="Badge"
    >
      {label}
    </p>
  );
}
