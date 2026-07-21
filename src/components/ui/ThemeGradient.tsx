"use client";

import { useThemeStyle } from "./theme-context";

export type ThemeGradientProps = {
  className?: string;
  fallback?: string;
};

/** Subtle brand gradient fill — color from injected theme. */
export function ThemeGradient({ className = "absolute inset-0", fallback }: ThemeGradientProps) {
  const { gradient } = useThemeStyle();

  return <div className={className} style={gradient(fallback)} data-component="ThemeGradient" aria-hidden />;
}
