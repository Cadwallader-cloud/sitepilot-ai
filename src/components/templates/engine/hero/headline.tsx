import type { EngineTone } from "../types";
import { css } from "@/components/ui/tokens";

export type HeadlineProps = {
  children: string;
  tone?: EngineTone;
  size?: "md" | "lg" | "xl";
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: css.invertedText,
  dark: css.text,
  brand: css.primary,
  muted: css.muted,
};

const sizeClass = {
  md: "text-3xl font-bold leading-tight sm:text-4xl",
  lg: "text-4xl font-bold leading-tight sm:text-5xl",
  xl: "text-4xl font-bold tracking-tight sm:text-6xl",
};

export function Headline({
  children,
  tone = "dark",
  size = "lg",
  className = "",
}: HeadlineProps) {
  return (
    <h1
      className={`${css.fontHeading} ${sizeClass[size]} ${toneClass[tone]} ${className}`.trim()}
      data-component="Headline"
    >
      {children}
    </h1>
  );
}
