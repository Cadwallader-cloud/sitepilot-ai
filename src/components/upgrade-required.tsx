import { UPGRADE_REQUIRED_FEATURES } from "@/lib/plans";
import Link from "next/link";

type UpgradeRequiredProps = {
  businessName?: string | null;
  /** Compact inline (e.g. under Publish CTA) */
  compact?: boolean;
};

export function UpgradeRequired({
  businessName,
  compact = false,
}: UpgradeRequiredProps) {
  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-brand/30 bg-brand/10 p-6 text-center sm:p-8"
          : "mx-auto max-w-md rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center"
      }
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
        Upgrade Required
      </p>
      <h2 className="mt-2 text-2xl font-bold text-foreground">
        Unlock Pro or Business
      </h2>
      {businessName && (
        <p className="mt-2 text-sm text-muted">
          For <span className="text-foreground">{businessName}</span>
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        Free includes 1 website, preview, and draft editing. Upgrade for
        publish, domains, analytics, and more.
      </p>

      <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-sm">
        {UPGRADE_REQUIRED_FEATURES.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-foreground">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/checkout?plan=pro"
          className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-light"
        >
          Upgrade to Pro
        </Link>
        <Link
          href="/checkout?plan=business"
          className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-surface-border px-6 text-sm font-semibold transition hover:border-brand/40"
        >
          Upgrade to Business
        </Link>
      </div>

      <p className="mt-6">
        <Link
          href="/dashboard"
          className="text-xs text-muted transition hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
