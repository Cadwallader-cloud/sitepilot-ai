"use client";

import { CryptoCheckout } from "@/components/crypto-checkout";
import { PRO_UNLOCK_FEATURES } from "@/lib/plans";
import type { PlanId } from "@/lib/billing/types";
import Link from "next/link";

const CHECKOUT_STEPS = ["Free", "Pro", "Crypto Checkout"] as const;

type CheckoutFlowProps = {
  currentPlanId?: PlanId | null;
  projectId?: string | null;
  initialOrderId?: string | null;
  planId?: "pro" | "business";
};

function CheckoutStepper({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-1 text-xs sm:gap-2 sm:text-sm">
      {CHECKOUT_STEPS.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const done = step < activeStep;
        const current = step === activeStep;
        return (
          <li key={label} className="flex items-center gap-1 sm:gap-2">
            {index > 0 && (
              <span className="text-muted/60" aria-hidden>
                ↓
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 font-medium ${
                done
                  ? "bg-emerald-500/15 text-emerald-300"
                  : current
                    ? "bg-brand/20 text-brand-light ring-1 ring-brand/40"
                    : "bg-surface text-muted"
              }`}
            >
              {done ? "✓ " : ""}
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ProUnlockList({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {PRO_UNLOCK_FEATURES.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CheckoutFlow({
  currentPlanId = "free",
  projectId = null,
  initialOrderId = null,
  planId = "pro",
}: CheckoutFlowProps) {
  const onFree = currentPlanId === "free";
  const activeStep: 1 | 2 | 3 = initialOrderId ? 3 : 2;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-bold">Upgrade to Pro</h1>
        {onFree && (
          <p className="mt-2 text-sm text-muted">
            You&apos;re on Free — unlock publishing with one crypto payment.
          </p>
        )}
      </div>

      <CheckoutStepper activeStep={activeStep} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-xl border p-4 ${
            onFree
              ? "border-surface-border bg-surface/40"
              : "border-surface-border/60 bg-surface/20 opacity-70"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {CHECKOUT_STEPS[0]}
          </p>
          <p className="mt-1 font-bold">$0</p>
          <p className="mt-1 text-xs text-muted">1 website · preview only</p>
        </div>
        <div className="rounded-xl border border-brand bg-brand/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">
            {CHECKOUT_STEPS[1]}
          </p>
          <p className="mt-1 font-bold">Pro</p>
          <p className="mt-1 text-xs text-muted">Pay with crypto below</p>
        </div>
      </div>

      <ProUnlockList title="After payment, unlock" />

      <CryptoCheckout
        projectId={projectId}
        initialOrderId={initialOrderId}
        planId={planId}
        embedded
      />

      <p className="text-center text-xs text-muted">
        Subscription fees are generally non-refundable. See our{" "}
        <Link href="/refund" className="text-brand-light hover:underline">
          Refund Policy
        </Link>
        .
      </p>
    </div>
  );
}

export { ProUnlockList, CHECKOUT_STEPS };
