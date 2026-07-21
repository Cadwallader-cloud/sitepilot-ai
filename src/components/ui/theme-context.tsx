"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Theme } from "@/lib/website";
import { uiAccent, uiButtonRadius, uiPrimary } from "./theme";

export type InjectedTheme = {
  tokens: Theme;
  primary: string;
  accent: string;
  buttonRadius: string;
};

export function resolveTheme(tokens: Theme): InjectedTheme {
  return {
    tokens,
    primary: uiPrimary(tokens),
    accent: uiAccent(tokens),
    buttonRadius: uiButtonRadius(tokens),
  };
}

const ThemeContext = createContext<InjectedTheme | null>(null);

export type ThemeProviderProps = {
  theme: Theme;
  children: ReactNode;
};

/** Injects resolved palette colors for the UI tree — Theme → components → render. */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const value = useMemo(() => resolveTheme(theme), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={
          {
            "--theme-primary": value.primary,
            "--theme-accent": value.accent,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): InjectedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export type ThemeStyleHelpers = {
  primary: string;
  accent: string;
  buttonRadius: string;
  bg: () => CSSProperties;
  color: () => CSSProperties;
  border: () => CSSProperties;
  tint: (alpha: string) => CSSProperties;
  gradient: (fallback?: string) => CSSProperties;
};

export function useThemeStyle(): ThemeStyleHelpers {
  const { primary, accent, buttonRadius } = useTheme();

  return useMemo(
    () => ({
      primary,
      accent,
      buttonRadius,
      bg: () => ({ backgroundColor: primary }),
      color: () => ({ color: primary }),
      border: () => ({ borderColor: primary }),
      tint: (alpha: string) => ({ backgroundColor: `${primary}${alpha}`, color: primary }),
      gradient: (fallback = "#f4f4f5") => ({
        background: `linear-gradient(135deg, ${primary}33, ${fallback})`,
      }),
    }),
    [primary, accent, buttonRadius],
  );
}
