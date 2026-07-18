import Link from "next/link";
import { brand } from "@/lib/brand";

type BrandLogoProps = {
  showTagline?: boolean;
  href?: string;
  className?: string;
};

export function BrandLogo({
  showTagline = true,
  href = "/",
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex flex-col justify-center leading-none ${className}`}
    >
      <span className="text-xl font-bold uppercase tracking-[0.22em] text-foreground transition group-hover:text-brand-light">
        {brand.name}
      </span>
      {showTagline && (
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          {brand.tagline}
        </span>
      )}
    </Link>
  );
}
