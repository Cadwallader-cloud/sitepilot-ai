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
    <Link href={href} className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-lg shadow-brand/30">
        C
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-semibold tracking-tight">
          {brand.name}
        </span>
        {showTagline && (
          <span className="block text-xs font-normal text-muted">
            {brand.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
