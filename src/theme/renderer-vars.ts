import type { Theme } from "./types";

/**
 * Canonical CSS variables injected by the Renderer / ThemeProvider.
 * Components consume var(--primary), never hex or zinc-* utilities.
 */
export const RENDERER_CSS_VARS = [
  "primary",
  "background",
  "radius",
  "shadow",
  "font-heading",
] as const;

export type RendererCssVar = (typeof RENDERER_CSS_VARS)[number];

/** Mode-independent renderer tokens (mode colors mapped in globals.css). */
export function rendererCssVars(theme: Theme): Record<string, string> {
  return {
    "--radius": theme.radius.base,
    "--shadow": theme.shadow.soft.value,
    "--font-heading": theme.typography.stack,
    "--font-body": theme.typography.stack,
  };
}

export function rendererThemeVars(theme: Theme): Record<string, string> {
  return rendererCssVars(theme);
}
