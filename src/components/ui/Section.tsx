"use client";

import type { ReactNode } from "react";
import type { SectionSpacingToken } from "./tokens";
import { sectionSpacing } from "./tokens";
import { useThemeStyle } from "./theme-context";

export type SectionBackground =
  | { variant: "solid"; color?: string }
  | { variant: "gradient"; color?: string; gradient?: string }
  | { variant: "overlay" }
  | { variant: "dim" }
  | { variant: "none" };

export type SectionSpacing = SectionSpacingToken;

export type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  template?: string;
  background?: SectionBackground;
  spacing?: SectionSpacing;
};

function SectionBackgroundLayer({
  background,
  primary,
}: {
  background: SectionBackground;
  primary: string;
}) {
  if (background.variant === "none") return null;

  if (background.variant === "overlay") {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20"
        data-component="SectionBackground"
        aria-hidden
      />
    );
  }

  if (background.variant === "dim") {
    return (
      <div className="absolute inset-0 bg-black/45" data-component="SectionBackground" aria-hidden />
    );
  }

  if (background.variant === "gradient") {
    const color = background.color ?? primary;

    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            background.gradient ??
            `linear-gradient(135deg, ${color}, var(--text))`,
        }}
        data-component="SectionBackground"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: background.color ?? primary }}
      data-component="SectionBackground"
      aria-hidden
    />
  );
}

export function Section({
  id,
  children,
  className = "",
  template,
  background,
  spacing = "none",
}: SectionProps) {
  const { primary } = useThemeStyle();

  return (
    <section
      id={id}
      className={`relative ${sectionSpacing[spacing]} ${className}`.trim()}
      data-component="Section"
      data-template={template}
    >
      {background ? <SectionBackgroundLayer background={background} primary={primary} /> : null}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}
