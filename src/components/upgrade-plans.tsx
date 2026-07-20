import { UpgradeRequired } from "@/components/upgrade-required";
import {
  BUSINESS_FEATURES,
  FREE_FEATURES,
  PRO_FEATURES,
} from "@/lib/plans";
import Link from "next/link";

type UpgradePlansProps = {
  projectId?: string | null;
  businessName?: string | null;
  compact?: boolean;
};

/** Pricing comparison Free / Pro / Business + upgrade CTAs. */
export function UpgradePlans({
  businessName,
  compact = false,
}: UpgradePlansProps) {
  return (
    <div className={compact ? "mt-6 space-y-8" : "space-y-10"}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-surface/60 p-6 text-left">
          <p className="text-lg font-bold">Free</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">Free</p>
          <p className="mt-2 text-sm text-muted">
            Build and preview before you go live
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-brand bg-brand/10 p-6 text-left shadow-lg shadow-brand/15">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">
            Most popular
          </p>
          <p className="text-lg font-bold">Pro</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">Pro</p>
          <p className="mt-2 text-sm text-muted">
            Publish, domains, analytics, AI editing
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/checkout?plan=pro"
            className="mt-6 flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-light"
          >
            Upgrade to Pro
          </Link>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface/60 p-6 text-left">
          <p className="text-lg font-bold">Business</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">Business</p>
          <p className="mt-2 text-sm text-muted">
            Team, white label, API, priority support
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            {BUSINESS_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/checkout?plan=business"
            className="mt-6 flex h-11 items-center justify-center rounded-full border border-surface-border text-sm font-semibold transition hover:border-brand/40"
          >
            Upgrade to Business
          </Link>
        </div>
      </div>

      <UpgradeRequired businessName={businessName} compact={compact} />
    </div>
  );
}
