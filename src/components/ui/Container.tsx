import type { ReactNode } from "react";
import type { MaxWidthToken, PaddingXToken } from "./tokens";
import { maxWidth, paddingX } from "./tokens";

export type ContainerPadding = PaddingXToken;

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  maxWidth?: MaxWidthToken;
  padding?: ContainerPadding;
};

export function Container({
  children,
  className = "",
  align = "left",
  maxWidth: width = "full",
  padding = "site",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto ${maxWidth[width]} ${paddingX[padding]} ${align === "center" ? "text-center" : ""} ${className}`.trim()}
      data-component="Container"
    >
      {children}
    </div>
  );
}
