import type { ReactNode } from "react";
import { gridColsClass, gridGapClass, type GridCols, type GridGap } from "./layout";

export type GridProps = {
  children: ReactNode;
  cols?: GridCols;
  gap?: GridGap;
  className?: string;
};

export function Grid({ children, cols = 1, gap = "md", className = "" }: GridProps) {
  return (
    <div
      className={`grid ${gridColsClass[cols]} ${gridGapClass[gap]} ${className}`.trim()}
      data-component="Grid"
    >
      {children}
    </div>
  );
}
