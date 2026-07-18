import Link from "next/link";
import { brand } from "@/lib/brand";
import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/demos" className="transition-colors hover:text-foreground">
            Demos
          </Link>
          <Link
            href="/projects"
            className="transition-colors hover:text-foreground"
          >
            Projects
          </Link>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AuthButton compact />
          </div>
          <Link
            href="/create"
            className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-light"
          >
            {brand.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}
