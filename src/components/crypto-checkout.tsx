"use client";

import { formatCryptoPayAmount } from "@/lib/crypto/assets";
import type { CryptoAsset } from "@/lib/crypto/assets";
import type { CryptoOrderPublic } from "@/lib/crypto/types";
import { PRO_UNLOCK_FEATURES } from "@/lib/plans";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type MethodOption = {
  id: string;
  asset: string;
  network: string;
  label: string;
  blurb: string;
  configured: boolean;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type CryptoCheckoutProps = {
  projectId?: string | null;
  initialOrderId?: string | null;
  planId?: "pro" | "business";
  /** Hide title when wrapped by CheckoutFlow */
  embedded?: boolean;
};

export function CryptoCheckout({
  projectId = null,
  initialOrderId = null,
  planId = "pro",
  embedded = false,
}: CryptoCheckoutProps) {
  const [methods, setMethods] = useState<MethodOption[]>([]);
  const [amountUsd, setAmountUsd] = useState(() =>
    planId === "business" ? 199 : 29,
  );
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [methodId, setMethodId] = useState<string>("");
  const [order, setOrder] = useState<CryptoOrderPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    void fetch(`/api/crypto/orders?plan=${planId}`)
      .then((r) => r.json())
      .then(
        (data: {
          methods?: MethodOption[];
          amountUsd?: number;
          ttlMinutes?: number;
        }) => {
          const list = data.methods ?? [];
          setMethods(list);
          setAmountUsd(data.amountUsd ?? (planId === "business" ? 199 : 29));
          setTtlMinutes(data.ttlMinutes ?? 60);
          const first = list.find((m) => m.configured) ?? list[0];
          if (first) setMethodId(first.id);
        },
      )
      .catch(() => setError("Could not load payment methods"));
  }, [planId]);

  const refreshOrder = useCallback(async (id: string) => {
    const res = await fetch(`/api/crypto/orders/${id}`);
    const data = (await res.json()) as {
      order?: CryptoOrderPublic;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load order");
    if (data.order) setOrder(data.order);
  }, []);

  useEffect(() => {
    if (!initialOrderId) return;
    void refreshOrder(initialOrderId).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load order");
    });
  }, [initialOrderId, refreshOrder]);

  useEffect(() => {
    if (!order || order.status === "paid" || order.status === "expired") return;
    if (order.status === "canceled") return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(() => {
      void refreshOrder(order.id).catch(() => undefined);
    }, 15_000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(poll);
    };
  }, [order, refreshOrder]);

  async function createOrder() {
    if (!methodId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crypto/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methodId, projectId, planId }),
      });
      const data = (await res.json()) as {
        order?: CryptoOrderPublic;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? "Could not create order");
      }
      setOrder(data.order);
      window.history.replaceState(
        null,
        "",
        `/checkout?order=${data.order.id}&plan=${planId}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the address manually");
    }
  }

  async function declarePaid() {
    if (!order || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/crypto/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "i_paid" }),
      });
      const data = (await res.json()) as {
        order?: CryptoOrderPublic;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? "Could not submit");
      }
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder() {
    if (!order || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/crypto/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = (await res.json()) as {
        order?: CryptoOrderPublic;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? "Could not cancel");
      }
      setOrder(null);
      window.history.replaceState(null, "", `/checkout?plan=${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  const remainingMs = order
    ? new Date(order.expiresAt).getTime() - now
    : 0;
  const qrUrl = order
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(order.qrPayload)}`
    : null;
  const planLabel = planId === "business" ? "Business" : "Pro";
  const awaiting =
    order?.status === "awaiting_payment" || order?.status === "pending";

  if (!order) {
    return (
      <div className={embedded ? "space-y-6" : "mx-auto max-w-lg space-y-6"}>
        <div className="rounded-2xl border border-surface-border bg-surface/40 p-6 sm:p-8">
          {!embedded && (
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">Upgrade to {planLabel}</h1>
              <p className="text-2xl font-bold tabular-nums">${amountUsd}</p>
            </div>
          )}
          {embedded ? (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                Crypto Checkout
              </p>
              <p className="text-2xl font-bold tabular-nums">${amountUsd}</p>
            </div>
          ) : null}
          <p className={`text-sm text-muted ${embedded ? "mt-2" : "mt-2"}`}>
            Choose a network, then send the exact amount to the wallet shown.
          </p>

          <fieldset className="mt-6 space-y-3">
            <legend className="text-sm font-medium">Network</legend>
            {methods.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                  methodId === m.id
                    ? "border-brand bg-brand/10"
                    : "border-surface-border bg-background/40"
                } ${!m.configured ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.id}
                  checked={methodId === m.id}
                  disabled={!m.configured}
                  onChange={() => setMethodId(m.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="text-xs text-muted">{m.blurb}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <p className="mt-4 text-xs text-muted">
            Exact amount · expires in {ttlMinutes} minutes after order create
          </p>

          <button
            type="button"
            onClick={() => void createOrder()}
            disabled={busy || !methodId || !methods.some((m) => m.configured)}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50"
          >
            {busy ? "Creating order…" : "Continue to payment"}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const methodLabel =
    methods.find((m) => m.id === order.methodId)?.label ??
    `${order.asset} (${order.network})`;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-surface-border bg-surface/40 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Upgrade to {planLabel}</h1>
            <p className="mt-1 font-mono text-xs text-muted">{order.orderRef}</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">${order.amount}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-3">
            <dt className="text-muted">Network</dt>
            <dd className="font-semibold">{methodLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-3">
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold tabular-nums">
              {formatCryptoPayAmount(order.amount, order.asset as CryptoAsset)}
            </dd>
          </div>
          {awaiting && (
            <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-3">
              <dt className="text-muted">Expires in</dt>
              <dd className="font-mono font-semibold tabular-nums">
                {formatCountdown(remainingMs)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Wallet address
          </p>
          <div className="mt-2 flex items-stretch gap-2">
            <p className="min-w-0 flex-1 break-all rounded-xl border border-surface-border bg-background/60 px-3 py-3 font-mono text-sm">
              {order.walletAddress}
            </p>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="shrink-0 rounded-xl border border-surface-border px-4 text-sm font-semibold transition hover:border-brand/40"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {qrUrl && awaiting && (
          <div className="mt-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Payment QR code"
              width={220}
              height={220}
              className="rounded-xl border border-surface-border bg-white p-2"
            />
            <p className="mt-3 text-center text-sm text-muted">
              After payment, click &quot;I Paid&quot; and we will activate your
              subscription.
            </p>
          </div>
        )}

        {order.status === "paid" && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-center">
            <p className="font-semibold text-emerald-300">Payment confirmed</p>
            <p className="mt-1 text-sm text-muted">Pro is active — you unlocked:</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {PRO_UNLOCK_FEATURES.map((feature) => (
                <li key={feature}>
                  <span className="text-emerald-400">✓</span> {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {order.declaredPaid && awaiting && (
          <p className="mt-4 text-center text-sm text-emerald-300">
            Thanks — we received your notice. An admin will confirm shortly.
          </p>
        )}

        {awaiting && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void declarePaid()}
              disabled={busy || order.declaredPaid}
              className="flex h-12 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50"
            >
              {order.declaredPaid ? "Submitted" : busy ? "…" : "I Paid"}
            </button>
            <button
              type="button"
              onClick={() => void cancelOrder()}
              disabled={busy}
              className="flex h-12 items-center justify-center rounded-full border border-surface-border text-sm font-semibold transition hover:border-brand/40 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}

        {order.status === "canceled" && (
          <button
            type="button"
            onClick={() => setOrder(null)}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
          >
            Create new order
          </button>
        )}

        {order.status === "expired" && (
          <button
            type="button"
            onClick={() => {
              setOrder(null);
              window.history.replaceState(null, "", `/checkout?plan=${planId}`);
            }}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
          >
            Create new order
          </button>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
