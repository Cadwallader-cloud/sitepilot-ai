import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-lg shadow-brand/30">
            SP
          </span>
          <span className="text-lg font-semibold tracking-tight">
            SitePilot <span className="text-brand-light">AI</span>
            <span className="ml-1.5 hidden text-sm font-normal text-muted sm:inline">
              for Contractors
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="/demos" className="transition-colors hover:text-foreground">
            Demos
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>

        <Link
          href="/create"
          className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-light"
        >
          Generate my website
        </Link>
      </div>
    </header>
  );
}
