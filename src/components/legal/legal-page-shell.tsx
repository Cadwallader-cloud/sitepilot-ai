import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Footer } from "@/components/features";

type LegalPageShellProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, updated, children }: LegalPageShellProps) {
  return (
    <>
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <article className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-muted">
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
