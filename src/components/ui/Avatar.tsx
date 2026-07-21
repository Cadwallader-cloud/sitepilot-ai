import { css, radius } from "./tokens";

export type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const avatarSizeClass = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function Avatar({
  initials,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-[color-mix(in_srgb,var(--primary)_15%,var(--surface))] font-semibold uppercase ${css.text} ${radius.full} ${avatarSizeClass[size]} ${className}`.trim()}
      data-component="Avatar"
    >
      {initials}
    </span>
  );
}
