/**
 * Theme Injection — components receive colors from ThemeProvider, never hardcode palette.
 */

export {
  resolveTheme,
  ThemeProvider,
  useTheme,
  useThemeStyle,
  type InjectedTheme,
} from "@/components/ui/theme-context";

export const THEME_INJECTION_RULE =
  "Components do not resolve colors — ThemeProvider injects primary/accent; use useTheme() or brand tone." as const;

/** Forbidden in component-engine scan paths (except theme.ts + theme-context.tsx). */
export const FORBIDDEN_THEME_COLOR_PATTERN =
  /\b(?:uiPrimary|uiAccent)\(|theme\.primary|theme\.accent|accentColor=\{|color=\{theme/;

export const THEME_RESOLVER_PATHS = [
  "components/ui/theme.ts",
  "components/ui/theme-context.tsx",
] as const;

export const THEME_SCAN_PATHS = [
  "components/ui",
  "components/hero",
  "components/services",
  "components/templates/about",
  "components/templates/faq",
  "components/templates/navbar",
  "components/templates/footer",
  "components/templates/renderer.tsx",
  "components/templates/template-website-view.tsx",
] as const;
