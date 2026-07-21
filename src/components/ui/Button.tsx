"use client";

import type { CSSProperties } from "react";
import { buttonVariantClass, type ButtonVariant } from "./button-variants";
import { inset } from "./tokens";
import { useTheme } from "./theme-context";

export type { ButtonVariant } from "./button-variants";
export { BUTTON_VARIANTS } from "./button-variants";

export type ButtonProps = {
  children: string;
  variant?: ButtonVariant;
  className?: string;
};

function buttonVariantStyle(variant: ButtonVariant, primary: string): CSSProperties | undefined {
  if (variant === "primary") {
    return { backgroundColor: primary };
  }
  if (variant === "ghost") {
    return { color: primary };
  }
  return undefined;
}

export function Button({
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const { primary, buttonRadius } = useTheme();

  return (
    <span
      className={`inline-flex items-center justify-center text-sm font-semibold ${inset.button} ${buttonRadius} ${buttonVariantClass[variant]} ${className}`.trim()}
      style={buttonVariantStyle(variant, primary)}
      data-component="Button"
      data-variant={variant}
    >
      {children}
    </span>
  );
}
