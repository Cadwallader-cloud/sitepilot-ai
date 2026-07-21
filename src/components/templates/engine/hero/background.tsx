export type BackgroundProps = {
  variant?: "solid" | "gradient" | "overlay" | "dim";
  color?: string;
  gradient?: string;
  className?: string;
};

/** Section background layer — solid, gradient, or dark overlay. */
export function Background({
  variant = "solid",
  color,
  gradient,
  className = "",
}: BackgroundProps) {
  if (variant === "overlay") {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 ${className}`.trim()}
        data-component="Background"
        aria-hidden
      />
    );
  }

  if (variant === "dim") {
    return (
      <div
        className={`absolute inset-0 bg-black/45 ${className}`.trim()}
        data-component="Background"
        aria-hidden
      />
    );
  }

  if (variant === "gradient") {
    return (
      <div
        className={`absolute inset-0 ${className}`.trim()}
        style={{
          background:
            gradient ??
            `linear-gradient(135deg, ${color ?? "var(--primary)"}, var(--text))`,
        }}
        data-component="Background"
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 ${className}`.trim()}
      style={color ? { backgroundColor: color } : undefined}
      data-component="Background"
      aria-hidden
    />
  );
}
