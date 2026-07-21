import type { ReactNode } from "react";
import type { PaddingToken, RadiusToken } from "./tokens";
import { css } from "./semantic-css";
import { padding, radius } from "./tokens";

export type CardProps = {
  children: ReactNode;
  variant?: "outline" | "elevated" | "ghost" | "overlay";
  padding?: PaddingToken;
  className?: string;
};

const variantClass = {
  outline: `${css.borderAll} ${css.surface}`,
  elevated: `${css.borderAll} ${css.surface} ${css.shadow}`,
  ghost: "bg-transparent",
  overlay: `bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] ${css.shadow} backdrop-blur`,
};

export function Card({
  children,
  variant = "outline",
  padding: pad = "md",
  className = "",
}: CardProps) {
  return (
    <div
      className={`${radius.md} ${variantClass[variant]} ${padding[pad]} ${className}`.trim()}
      data-component="Card"
    >
      {children}
    </div>
  );
}
