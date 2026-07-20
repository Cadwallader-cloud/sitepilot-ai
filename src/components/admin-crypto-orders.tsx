"use client";

import { formatCryptoPayAmount } from "@/lib/crypto/assets";
import type { CryptoAsset } from "@/lib/crypto/assets";
import { useCallback, useEffect, useState } from "react";

type AdminOrder = {
  id: string;
  orderRef: string;
  userEmail: string;
  planId: string;
  asset: string;
  network: string;
  amount: number;
  walletAddress: string;
  status: string;
  expiresAt: string;
  paidAt: string | null;
  paidBy: string | null;
  providerTxHash: string | null;
  declaredPaid?: boolean;
  createdAt: string;
};

function planLabel(planId: string): string {
  if (planId === "business") return "Business";
  if (planId === "pro") return "Pro";
  return planId;
}

export function AdminCryptoOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/crypto-orders");
    const data = (await res.json()) as {
      orders?: AdminOrder[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setOrders(data.orders ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load");
    });
  }, [load]);

  async function markPaid(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crypto-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_paid",
          txHash: txHash[id]?.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Mark paid failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mark paid failed");
    } finally {
      setBusyId(null);
    }
  }

  const pending = orders.filter(
    (o) => o.status === "awaiting_payment" || o.status === "pending",
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Phase 1: manually confirm crypto payments. Marking Paid activates the
        order&apos;s plan (Pro or Business) via the same path future webhooks
        will use.
      </p>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-muted">
        Awaiting payment: {pending.length} · Total shown: {orders.length}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-surface-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Pay</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted">
                  No crypto orders yet. Users create them at /checkout.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const canPay =
                  o.status === "awaiting_payment" || o.status === "pending";
                const target = planLabel(o.planId || "pro");
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold">
                        {o.orderRef}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">{o.userEmail}</td>
                    <td className="px-4 py-3 font-medium">{target}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold tabular-nums">
                        {formatCryptoPayAmount(
                          o.amount,
                          o.asset as CryptoAsset,
                        )}
                      </p>
                      <p className="text-xs text-muted">{o.network}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="capitalize">{o.status}</p>
                      {o.declaredPaid && canPay ? (
                        <p className="mt-0.5 text-xs text-amber-300">
                          User clicked I Paid
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {canPay ? (
                        <div className="flex min-w-[200px] flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Tx hash (optional)"
                            value={txHash[o.id] ?? ""}
                            onChange={(e) =>
                              setTxHash((prev) => ({
                                ...prev,
                                [o.id]: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-surface-border bg-background px-2 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            disabled={busyId === o.id}
                            onClick={() => void markPaid(o.id)}
                            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {busyId === o.id
                              ? "…"
                              : `Mark Paid → ${target}`}
                          </button>
                        </div>
                      ) : o.status === "paid" ? (
                        <p className="text-xs text-emerald-300">
                          Paid
                          {o.paidBy ? ` by ${o.paidBy}` : ""}
                        </p>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
