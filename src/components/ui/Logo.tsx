"use client";

import NextImage from "next/image";
import type { UiTone } from "./theme";
import { useThemeStyle } from "./theme-context";
import { size } from "./tokens";

export type LogoProps = {
  name: string;
  tone?: UiTone;
  imageSrc?: string;
  className?: string;
};

export function Logo({ name, tone = "dark", imageSrc, className = "" }: LogoProps) {
  const { color } = useThemeStyle();

  if (imageSrc) {
    return (
      <span className={`relative inline-block ${size.logo} ${className}`.trim()} data-component="Logo">
        <NextImage src={imageSrc} alt={name} fill className="object-contain object-left" />
      </span>
    );
  }

  return (
    <span
      className={`font-bold ${className}`.trim()}
      style={tone === "brand" ? color() : undefined}
      data-component="Logo"
    >
      {name}
    </span>
  );
}
