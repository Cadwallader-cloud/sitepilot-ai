import type { ReactNode } from "react";
import type { PaddingToken, RadiusToken } from "./tokens";
import { padding, radius } from "./tokens";

export type CardProps = {
  children: ReactNode;
  variant?: "outline" | "elevated" | "ghost" | "overlay";
  padding?: PaddingToken;
  className?: string;
};

const variantClass = {
  outline: "border border-zinc-200 bg-white",
  elevated: "border border-zinc-100 bg-white shadow-sm",
  ghost: "bg-transparent",
  overlay: "bg-white/95 shadow-2xl backdrop-blur",
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
