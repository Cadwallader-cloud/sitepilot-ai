"use client";

import { useThemeStyle } from "./theme-context";

export type ThemeBarProps = {
  className?: string;
};

/** Accent rule/bar — color from injected theme. */
export function ThemeBar({ className = "h-1 w-16 rounded-full" }: ThemeBarProps) {
  const { bg } = useThemeStyle();

  return <div className={className} style={bg()} data-component="ThemeBar" />;
}
