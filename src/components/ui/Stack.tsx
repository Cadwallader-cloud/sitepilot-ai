import type { ReactNode } from "react";
import {
  resolveAlign,
  resolveDirection,
  type ResponsiveAlignValue,
  type ResponsiveDirection,
} from "./responsive";
import { stackGapClass, type StackGap } from "./layout";

export type StackProps = {
  children: ReactNode;
  direction?: ResponsiveDirection;
  gap?: StackGap;
  align?: ResponsiveAlignValue;
  className?: string;
};

export function Stack({
  children,
  direction = "column",
  gap = "md",
  align = "stretch",
  className = "",
}: StackProps) {
  return (
    <div
      className={`flex ${resolveDirection(direction)} ${stackGapClass[gap]} ${resolveAlign(align)} ${className}`.trim()}
      data-component="Stack"
    >
      {children}
    </div>
  );
}
