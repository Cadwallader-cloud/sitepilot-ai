import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { DemosGallery } from "@/components/demos-gallery";
import { brand } from "@/lib/brand";
import { showcaseDemoCount } from "@/lib/showcase-demos";

export const metadata = {
  title: `Demo Showcase — ${brand.name}`,
  description:
    "Free demo websites for local businesses — plumbing, HVAC, dental, law firms, restaurants, and more — see Crestis quality instantly.",
};

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/create"
            className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light"
          >
            {brand.cta}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
            Free demo showcase
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            {showcaseDemoCount} ready-made local business websites
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Plumbing, HVAC, dental, law, restaurants, and more — open any demo
            to see the quality your customers will notice.
          </p>
        </div>

        <div className="mt-12">
          <DemosGallery />
        </div>

        <div className="mt-16 rounded-2xl border border-brand/30 bg-brand/10 p-10 text-center">
          <h2 className="text-2xl font-bold">Want a site like this?</h2>
          <p className="mt-3 text-muted">
            Generate yours free — publish when you&apos;re ready
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 font-semibold text-white hover:bg-brand-light"
          >
            Get started
          </Link>
        </div>
      </main>
    </div>
  );
}
