"use client";

import { useCallback, useEffect, useState } from "react";

type WalletRow = {
  id: string;
  currency: string;
  network: string;
  address: string;
  active: boolean;
  updated_at: string;
};

export function AdminPaymentWallets() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payment-wallets");
    const data = (await res.json()) as {
      wallets?: WalletRow[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    const list = data.wallets ?? [];
    setWallets(list);
    setDrafts(
      Object.fromEntries(list.map((w) => [w.id, w.address ?? ""])),
    );
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load");
    });
  }, [load]);

  async function save(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/payment-wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          address: drafts[id] ?? "",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusyId(null);
    }
  }

  async function setActive(id: string, active: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/payment-wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Deposit addresses for crypto checkout. Change an address here — no
        redeploy. Only active wallets with a non-empty address appear at
        /checkout.
      </p>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {wallets.length === 0 ? (
        <p className="text-sm text-muted">
          No wallets yet. Run{" "}
          <code className="text-xs">supabase/schema-payment-wallets.sql</code>{" "}
          in Supabase.
        </p>
      ) : (
        <div className="space-y-4">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-surface-border bg-surface/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {w.currency} · {w.network}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={w.active}
                    disabled={busyId === w.id}
                    onChange={(e) => void setActive(w.id, e.target.checked)}
                  />
                  Active
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="text-xs uppercase tracking-wider text-muted">
                  Address
                </span>
                <input
                  type="text"
                  value={drafts[w.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [w.id]: e.target.value }))
                  }
                  placeholder={
                    w.network === "TRC20"
                      ? "T…"
                      : w.network === "BITCOIN"
                        ? "bc1… or 1… / 3…"
                        : "0x…"
                  }
                  spellCheck={false}
                  className="mt-1 w-full rounded-xl border border-surface-border bg-background px-3 py-2 font-mono text-sm"
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void save(w.id)}
                  disabled={busyId === w.id}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busyId === w.id ? "Saving…" : "Save address"}
                </button>
                <p className="text-xs text-muted">
                  Updated {new Date(w.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
