import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { brand } from "@/lib/brand";
import { showcaseDemos } from "@/lib/showcase-demos";

export const metadata = {
  title: `Demo Showcase — ${brand.name}`,
  description:
    "Professional local business website demos — roofing, construction, landscaping, electrician, plumbing.",
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
            Demo showcase
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            5 professional contractor websites
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Each demo is fully unique — custom design, photos, animations, and
            mobile layout. This is your shop window.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {showcaseDemos.map((demo, index) => (
            <Link
              key={demo.slug}
              href={`/demos/${demo.slug}`}
              className="group overflow-hidden rounded-2xl border border-surface-border bg-surface transition hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
            >
              <div className="relative h-52 overflow-hidden bg-zinc-800">
                <Image
                  src={demo.heroImage}
                  alt={demo.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: demo.accent }}
                  >
                    {demo.trade}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold group-hover:text-brand-light">{demo.name}</h2>
                <p className="mt-1 text-sm text-muted">{demo.location}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{demo.description}</p>
                <p className="mt-4 text-sm font-semibold text-foreground group-hover:text-brand-light">
                  View live demo →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-brand/30 bg-brand/10 p-10 text-center">
          <h2 className="text-2xl font-bold">Want a site like this?</h2>
          <p className="mt-3 text-muted">
            Fill in your business details — we&apos;ll build yours for $199
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
