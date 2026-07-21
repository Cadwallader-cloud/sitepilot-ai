"use client";

import type { ElementType, ReactNode } from "react";
import type { UiTone } from "./theme";
import {
  headingSizeClass,
  toneHeadingClass,
  type HeadingSize,
} from "./typography";
import { css } from "./semantic-css";

export type HeadingProps = {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  tone?: UiTone;
  size?: HeadingSize;
  className?: string;
};

const headingTags: Record<NonNullable<HeadingProps["level"]>, ElementType> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

export function Heading({
  children,
  level = 2,
  tone = "dark",
  size = "lg",
  className = "",
}: HeadingProps) {
  const Tag = headingTags[level];

  return (
    <Tag
      className={`${css.fontHeading} ${headingSizeClass[size]} ${toneHeadingClass[tone]} ${className}`.trim()}
      data-component="Heading"
    >
      {children}
    </Tag>
  );
}
