import Link from "next/link";
import { BUSINESS_FEATURES, PRO_UNLOCK_FEATURES } from "@/lib/plans";

const FREE_PLAN_FEATURES = ["1 website", "AI generation", "Preview"] as const;

const PRO_PLAN_FEATURES = PRO_UNLOCK_FEATURES;

export function PricingFlow() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-surface-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Pricing</h2>
        <p className="mt-3 text-center text-muted">
          Start free. Upgrade when you&apos;re ready to publish.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-surface-border bg-surface px-6 py-7">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">Free</p>
              <span className="rounded-md bg-zinc-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Beta
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">$0</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {FREE_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              className="mt-8 flex h-11 items-center justify-center rounded-full border border-surface-border bg-background/60 text-sm font-semibold transition hover:border-brand/40"
            >
              Start Free
            </Link>
          </div>

          <div className="rounded-2xl border border-brand bg-brand/10 px-6 py-7 shadow-lg shadow-brand/15">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">Pro</p>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                Recommended
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">
              $29
              <span className="text-lg font-medium text-muted">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {PRO_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/checkout?plan=pro"
              className="mt-8 flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-light"
            >
              Upgrade
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-surface-border bg-surface/40 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Business</p>
              <p className="mt-1 text-sm text-muted">
                {BUSINESS_FEATURES.slice(0, 3).join(" · ")}
              </p>
            </div>
            <Link
              href="/checkout?plan=business"
              className="inline-flex h-10 items-center justify-center rounded-full border border-surface-border px-5 text-sm font-semibold transition hover:border-brand/40"
            >
              Upgrade to Business
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
