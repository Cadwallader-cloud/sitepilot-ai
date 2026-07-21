"use client";

import type { ReactNode } from "react";
import type { UiTone } from "./theme";
import { useThemeStyle } from "./theme-context";
import { textSizeClass, toneTextClass, type TextSize } from "./typography";

export type TextProps = {
  children: ReactNode;
  tone?: UiTone;
  size?: TextSize;
  as?: "p" | "span" | "div";
  className?: string;
};

export function Text({
  children,
  tone = "dark",
  size = "base",
  as = "p",
  className = "",
}: TextProps) {
  const Tag = as;
  const { color } = useThemeStyle();

  return (
    <Tag
      className={`${textSizeClass[size]} ${toneTextClass[tone]} ${className}`.trim()}
      style={tone === "brand" ? color() : undefined}
      data-component="Text"
    >
      {children}
    </Tag>
  );
}
