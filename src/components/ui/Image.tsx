"use client";

import NextImage from "next/image";
import { useThemeStyle } from "./theme-context";

export type ImageProps = {
  src?: string;
  alt?: string;
  fallbackColor?: string;
  /** Hex alpha suffix appended to theme primary, e.g. "22". */
  fallbackTint?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function Image({
  src,
  alt = "",
  fallbackColor,
  fallbackTint,
  sizes = "100vw",
  priority = true,
  className = "object-cover",
}: ImageProps) {
  const { primary, tint } = useThemeStyle();

  if (src) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
        data-component="Image"
      />
    );
  }

  const fallbackStyle =
    fallbackColor != null
      ? { backgroundColor: fallbackColor }
      : fallbackTint
        ? tint(fallbackTint)
        : { backgroundColor: primary };

  return (
    <div
      className="absolute inset-0"
      style={fallbackStyle}
      data-component="Image"
      aria-hidden
    />
  );
}
