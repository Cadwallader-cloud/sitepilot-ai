import type { EngineTone } from "../types";

export type HeadlineProps = {
  children: string;
  tone?: EngineTone;
  color?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: "text-white",
  dark: "text-zinc-900",
  brand: "",
  muted: "text-zinc-800",
};

const sizeClass = {
  md: "text-3xl font-bold leading-tight sm:text-4xl",
  lg: "text-4xl font-bold leading-tight sm:text-5xl",
  xl: "text-4xl font-bold tracking-tight sm:text-6xl",
};

export function Headline({
  children,
  tone = "dark",
  color,
  size = "lg",
  className = "",
}: HeadlineProps) {
  return (
    <h1
      className={`${sizeClass[size]} ${toneClass[tone]} ${className}`.trim()}
      style={tone === "brand" && color ? { color } : undefined}
      data-component="Headline"
    >
      {children}
    </h1>
  );
}
