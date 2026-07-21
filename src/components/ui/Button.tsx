"use client";

import { buttonVariantClass, type ButtonVariant } from "./button-variants";
import { inset } from "./tokens";
import { typographyRoleClass } from "./typography";
import { useTheme } from "./theme-context";

export type { ButtonVariant } from "./button-variants";
export { BUTTON_VARIANTS } from "./button-variants";

export type ButtonProps = {
  children: string;
  variant?: ButtonVariant;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const { buttonRadius } = useTheme();

  return (
    <span
      className={`inline-flex items-center justify-center ${typographyRoleClass("button")} ${inset.button} ${buttonRadius} ${buttonVariantClass[variant]} ${className}`.trim()}
      data-component="Button"
      data-variant={variant}
    >
      {children}
    </span>
  );
}
