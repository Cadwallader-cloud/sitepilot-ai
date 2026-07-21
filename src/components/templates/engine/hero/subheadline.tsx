import type { EngineTone } from "../types";

export type SubheadlineProps = {
  children: string;
  tone?: EngineTone;
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: "text-white/90",
  dark: "text-zinc-600",
  brand: "text-zinc-600",
  muted: "text-zinc-500",
};

export function Subheadline({
  children,
  tone = "dark",
  className = "",
}: SubheadlineProps) {
  return (
    <p
      className={`mt-4 text-base sm:text-lg ${toneClass[tone]} ${className}`.trim()}
      data-component="Subheadline"
    >
      {children}
    </p>
  );
}
