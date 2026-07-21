import Image from "next/image";

export type HeroImageProps = {
  src?: string;
  alt?: string;
  fallbackColor?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/** Hero photo or color fallback — always fills its container. */
export function HeroImage({
  src,
  alt = "",
  fallbackColor,
  sizes = "100vw",
  priority = true,
  className = "object-cover",
}: HeroImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
        data-component="HeroImage"
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: fallbackColor ?? "#0f172a" }}
      data-component="HeroImage"
      aria-hidden
    />
  );
}
