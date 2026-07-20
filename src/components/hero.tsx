import Link from "next/link";
import { RequestAccess } from "@/components/request-access";
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
        <h1 className="text-5xl font-bold uppercase tracking-[0.18em] text-foreground md:text-7xl">
          {brand.name}
        </h1>
        <p className="mt-4 text-lg font-medium text-brand-light md:text-2xl">
          {brand.tagline}
        </p>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          Launch a professional website in 60 seconds. No coding. No designers.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/create"
            className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-10 text-lg font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-light"
          >
            {brand.cta}
          </Link>
          <a
            href="#early-access"
            className="inline-flex h-14 items-center justify-center rounded-full border border-surface-border px-8 text-lg font-semibold transition hover:border-brand/40"
          >
            Get Early Access
          </a>
        </div>

        <p className="mt-4 text-sm text-muted">
          Free preview · No credit card · Ready in under a minute
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-lg">
        <RequestAccess />
      </div>
    </section>
  );
}
