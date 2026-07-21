import type { EngineTone } from "../types";

export type BadgeProps = {
  label: string;
  tone?: EngineTone;
  color?: string;
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: "text-white/90",
  dark: "text-zinc-600",
  brand: "",
  muted: "text-zinc-500",
};

/** Eyebrow / trust chip above the headline. */
export function Badge({ label, tone = "brand", color, className = "" }: BadgeProps) {
  if (!label.trim()) return null;

  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.2em] ${toneClass[tone]} ${className}`.trim()}
      style={tone === "brand" && color ? { color } : undefined}
      data-component="Badge"
    >
      {label}
    </p>
  );
}
