"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  paletteFor,
  resolveThemePresetOrNull,
  themeCssVars,
  type Theme,
  type ThemeMode,
  type ThemeModes,
} from "@/theme";
import type { WebsiteTheme } from "@/lib/website";
import { buttonRadiusClass } from "./theme";

export type InjectedTheme = {
  ref: WebsiteTheme;
  theme: Theme;
  mode: ThemeMode;
  modes: ThemeModes;
  palette: Theme["palette"];
  primary: string;
  accent: string;
  buttonRadius: string;
  cssVars: Record<string, string>;
};

export function resolveTheme(
  ref: WebsiteTheme,
  mode: ThemeMode = "light",
): InjectedTheme {
  const theme =
    resolveThemePresetOrNull(ref.id) ??
    resolveThemePresetOrNull("local-service-standard")!;
  const palette = paletteFor(theme, mode);

  return {
    ref,
    theme,
    mode,
    modes: theme.modes,
    palette,
    primary: palette.primary,
    accent: palette.accent,
    buttonRadius: buttonRadiusClass(theme.button.style),
    cssVars: themeCssVars(theme, mode),
  };
}

const ThemeContext = createContext<InjectedTheme | null>(null);

export type ThemeProviderProps = {
  theme: WebsiteTheme;
  mode?: ThemeMode;
  children: ReactNode;
};

/** Injects resolved Theme tokens — Theme Engine → components → render. */
export function ThemeProvider({
  theme,
  mode = "light",
  children,
}: ThemeProviderProps) {
  const value = useMemo(() => resolveTheme(theme, mode), [theme, mode]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="theme-root"
        data-theme={mode}
        style={value.cssVars as CSSProperties}
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
  const { primary, accent, buttonRadius, palette } = useTheme();
  const surface = palette.surface;

  return useMemo(
    () => ({
      primary,
      accent,
      buttonRadius,
      bg: () => ({ backgroundColor: primary }),
      color: () => ({ color: primary }),
      border: () => ({ borderColor: primary }),
      tint: (alpha: string) => ({ backgroundColor: `${primary}${alpha}`, color: primary }),
      gradient: (fallback = surface) => ({
        background: `linear-gradient(135deg, ${primary}33, ${fallback})`,
      }),
    }),
    [primary, accent, buttonRadius, surface],
  );
}
