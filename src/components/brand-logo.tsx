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
      aria-label={`${brand.name} home`}
      className={`group inline-flex flex-col justify-center leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-sm ${className}`}
    >
      <span className="text-xl font-bold tracking-tight text-foreground transition group-hover:text-brand-light">
        {brand.name}
      </span>
      {showTagline && (
        <span className="mt-1 max-w-[14rem] text-[10px] font-medium leading-snug text-muted">
          {brand.tagline}
        </span>
      )}
    </Link>
  );
}
