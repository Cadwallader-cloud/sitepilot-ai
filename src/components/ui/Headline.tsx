import { headingSizeClass, toneHeadingClass, type HeadingSize } from "./typography";
import type { UiTone } from "./theme";

export type HeadlineProps = {
  children: string;
  tone?: UiTone;
  color?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
};

const headlineSizeMap: Record<NonNullable<HeadlineProps["size"]>, HeadingSize> = {
  md: "md",
  lg: "lg",
  xl: "xl",
};

/** @deprecated Prefer Heading with level={1} */
export function Headline({
  children,
  tone = "dark",
  color,
  size = "lg",
  className = "",
}: HeadlineProps) {
  return (
    <h1
      className={`${headingSizeClass[headlineSizeMap[size]]} ${toneHeadingClass[tone]} ${className}`.trim()}
      style={tone === "brand" && color ? { color } : undefined}
      data-component="Headline"
    >
      {children}
    </h1>
  );
}
