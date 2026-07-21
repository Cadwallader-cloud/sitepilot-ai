/**
 * Theme Injection — components receive colors from Renderer CSS variables.
 */

export {
  resolveTheme,
  ThemeProvider,
  useTheme,
  useThemeStyle,
  type InjectedTheme,
} from "@/components/ui/theme-context";

export const THEME_INJECTION_RULE =
  "Components do not hardcode colors — Renderer injects --primary, --background, --radius, --shadow, --font-heading via ThemeProvider." as const;

/** Forbidden in component-engine scan paths (except theme.ts + theme-context.tsx). */
export const FORBIDDEN_THEME_COLOR_PATTERN =
  /\b(?:uiPrimary|uiAccent)\(|theme\.primary|theme\.accent|accentColor=\{|color=\{theme|#[0-9a-fA-F]{3,8}|text-zinc-|bg-zinc-|border-zinc-/;

export const THEME_RESOLVER_PATHS = [
  "components/ui/theme.ts",
  "components/ui/theme-context.tsx",
  "components/templates/renderer.tsx",
] as const;

export const THEME_SCAN_PATHS = [
  "components/ui",
  "components/hero",
  "components/services",
  "components/templates/about",
  "components/templates/faq",
  "components/templates/navbar",
  "components/templates/footer",
  "components/templates/engine",
  "components/templates/renderer.tsx",
  "components/templates/template-website-view.tsx",
] as const;

export const RENDERER_CSS_VAR_NAMES = [
  "--primary",
  "--background",
  "--radius",
  "--shadow",
  "--font-heading",
] as const;
