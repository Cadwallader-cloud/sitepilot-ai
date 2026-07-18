import Link from "next/link";
import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_55%)]"
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
      />

      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm text-brand-light">
          {brand.name} · {brand.tagline}
        </p>

        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Launch a professional website in{" "}
          <span className="bg-gradient-to-r from-brand-light to-indigo-300 bg-clip-text text-transparent">
            60 seconds
          </span>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted md:text-2xl">
          {brand.heroSubtitle}
        </p>

        <p className="mt-4 text-lg text-muted">No coding. No designers.</p>

        <div className="mt-10">
          <Link
            href="/create"
            className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-10 text-lg font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-light"
          >
            {brand.cta}
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted">
          Free preview · No credit card · Ready in under a minute
        </p>
      </div>
    </section>
  );
}
