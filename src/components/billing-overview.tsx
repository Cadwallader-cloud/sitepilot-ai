"use client";

import { canUpgradeTo } from "@/lib/billing/catalog";
import type { CurrentPlan } from "@/lib/billing/service";
import {
  BUSINESS_FEATURES,
  FREE_FEATURES,
  PRO_FEATURES,
} from "@/lib/plans";
import Link from "next/link";

const FEATURES_BY_PLAN = {
  free: FREE_FEATURES,
  pro: PRO_FEATURES,
  business: BUSINESS_FEATURES,
} as const;

type BillingOverviewProps = {
  current: CurrentPlan;
};

export function BillingOverview({ current }: BillingOverviewProps) {
  const effectivePlanId = current.entitlements.planId;
  const features = FEATURES_BY_PLAN[effectivePlanId] ?? FREE_FEATURES;
  const showUpgradePro = canUpgradeTo(effectivePlanId, "pro");
  const showUpgradeBusiness = canUpgradeTo(effectivePlanId, "business");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-surface-border bg-surface/40 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Current plan
        </p>
        <h2 className="mt-2 text-3xl font-bold">{current.plan.name}</h2>
        <p className="mt-2 text-sm text-muted">{current.plan.description}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Status
            </dt>
            <dd className="mt-1 font-semibold capitalize">{current.status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Renewal date
            </dt>
            <dd className="mt-1 font-semibold">
              {current.renewalDate
                ? new Date(current.renewalDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Provider
            </dt>
            <dd className="mt-1 font-semibold capitalize">
              {current.provider ?? "manual"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold">Available features</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold">Refund policy</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Unless required by applicable law, subscription fees are non-refundable.
          Refund requests may be considered at Crestis&apos; sole discretion in
          cases of duplicate charges, billing errors, or technical issues
          preventing use of the Service.{" "}
          <Link href="/refund" className="text-brand-light hover:underline">
            Full policy
          </Link>
        </p>
      </div>

      {(showUpgradePro || showUpgradeBusiness) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {showUpgradePro && (
            <Link
              href="/checkout?plan=pro"
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-light"
            >
              Upgrade to Pro
            </Link>
          )}
          {showUpgradeBusiness && (
            <Link
              href="/checkout?plan=business"
              className="flex h-12 flex-1 items-center justify-center rounded-full border border-surface-border text-sm font-semibold transition hover:border-brand/40"
            >
              Upgrade to Business
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
