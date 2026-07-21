/** Renderer semantic CSS variables — var(--primary), never hex in components. */
export const css = {
  bg: "bg-[var(--background)]",
  text: "text-[var(--text)]",
  primary: "text-[var(--primary)]",
  primaryBg: "bg-[var(--primary)]",
  accent: "text-[var(--accent)]",
  surface: "bg-[var(--surface)]",
  border: "border-[var(--border)]",
  borderAll: "border border-[var(--border)]",
  muted: "text-[var(--muted)]",
  radius: "rounded-[var(--radius)]",
  shadow: "[box-shadow:var(--shadow)]",
  fontHeading: "[font-family:var(--font-heading)]",
  invertedBg: "bg-[var(--text)]",
  invertedText: "text-[var(--background)]",
  onPrimary: "text-[var(--background)]",
} as const;
