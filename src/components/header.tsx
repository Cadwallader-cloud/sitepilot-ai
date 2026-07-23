import Link from "next/link";
import { brand } from "@/lib/brand";
import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { SiteNav } from "@/components/site-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/60 bg-background/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <BrandLogo />

        <SiteNav />

        <div className="flex items-center gap-2 sm:gap-3">
          <AuthButton compact showAdminLink={false} />
          <Link
            href="/create"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:px-5"
          >
            {brand.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}
