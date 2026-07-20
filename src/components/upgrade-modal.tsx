"use client";

import {
  BUSINESS_FEATURES,
  FREE_FEATURES,
  PRO_FEATURES,
} from "@/lib/plans";
import type { FeatureKey, PlanId } from "@/lib/billing/types";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

const FEATURE_COPY: Record<FeatureKey, string> = {
  publish: "Publish your website live",
  analytics: "Website analytics",
  custom_domain: "Custom domain",
  create_website: "More websites",
  unlimited_projects: "More websites",
  ai_editing: "AI editing",
  business_features: "Business features",
};

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  feature?: FeatureKey | null;
  businessName?: string | null;
};

function checkoutHref(plan: PlanId) {
  return `/checkout?plan=${plan}`;
}

export function UpgradeModal({
  open,
  onClose,
  feature = null,
  businessName,
}: UpgradeModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-brand/30 bg-background p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-sm text-muted hover:text-foreground"
        >
          ✕
        </button>

        <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
          Upgrade Required
        </p>
        <h2 id={titleId} className="mt-2 text-2xl font-bold">
          {feature ? FEATURE_COPY[feature] : "Choose a plan"}
        </h2>
        {businessName && (
          <p className="mt-2 text-sm text-muted">
            For <span className="text-foreground">{businessName}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Compare Free, Pro, and Business. Payment providers plug in later —
          entitlements stay the same.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-surface-border bg-surface/50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Free
            </p>
            <p className="mt-1 font-bold">Free</p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted">
              {FREE_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-brand bg-brand/10 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">
              Pro
            </p>
            <p className="mt-1 font-bold">Pro</p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted">
              {PRO_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface/50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Business
            </p>
            <p className="mt-1 font-bold">Business</p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted">
              {BUSINESS_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href={checkoutHref("pro")}
            className="flex h-12 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-light"
            onClick={onClose}
          >
            Upgrade to Pro
          </Link>
          <Link
            href={checkoutHref("business")}
            className="flex h-12 items-center justify-center rounded-full border border-surface-border text-sm font-semibold transition hover:border-brand/40"
            onClick={onClose}
          >
            Upgrade to Business
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Hook-friendly controller for opening the upgrade modal. */
export function useUpgradeModal() {
  const [state, setState] = useState<{
    open: boolean;
    feature: FeatureKey | null;
  }>({ open: false, feature: null });

  return {
    open: state.open,
    feature: state.feature,
    show: (feature?: FeatureKey | null) =>
      setState({ open: true, feature: feature ?? null }),
    hide: () => setState({ open: false, feature: null }),
  };
}
