"use client";

import type { PlanId, PlanRow, SubscriptionRow } from "@/lib/billing/types";
import { useCallback, useEffect, useState } from "react";

type SubRow = SubscriptionRow & { plan_name?: string };

export function AdminPlanManager({
  userEmails,
}: {
  /** Emails from projects (may not have a subscription row yet). */
  userEmails: string[];
}) {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPlan, setDraftPlan] = useState<PlanId>("pro");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/subscriptions");
    const data = (await res.json()) as {
      subscriptions?: SubRow[];
      plans?: PlanRow[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setSubs(data.subscriptions ?? []);
    setPlans(data.plans ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load");
    });
  }, [load]);

  const byEmail = new Map(subs.map((s) => [s.user_email, s]));
  const emails = [
    ...new Set([
      ...userEmails.map((e) => e.toLowerCase()),
      ...subs.map((s) => s.user_email),
    ]),
  ].sort();

  async function patchUser(
    userEmail: string,
    body: { planId?: PlanId; status?: "active" | "canceled" | "inactive" },
  ) {
    setBusyEmail(userEmail);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, ...body }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyEmail(null);
    }
  }

  const fallbackPlans = [
    { id: "free" as const, name: "Free" },
    { id: "pro" as const, name: "Pro" },
    { id: "business" as const, name: "Business" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        View users, change plans, activate or cancel subscriptions. Provider
        stays manual until crypto / Polar / invoices are wired.
      </p>

      <div className="flex flex-col gap-2 rounded-2xl border border-surface-border bg-surface/40 p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="text-muted">User email</span>
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            placeholder="user@example.com"
            className="mt-1 w-full rounded-xl border border-surface-border bg-background px-3 py-2"
          />
        </label>
        <label className="text-sm sm:w-40">
          <span className="text-muted">Plan</span>
          <select
            value={draftPlan}
            onChange={(e) => setDraftPlan(e.target.value as PlanId)}
            className="mt-1 w-full rounded-xl border border-surface-border bg-background px-3 py-2"
          >
            {(plans.length ? plans : fallbackPlans).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!draftEmail.trim() || busyEmail === draftEmail.trim()}
          onClick={() =>
            void patchUser(draftEmail.trim(), {
              planId: draftPlan,
              status: "active",
            })
          }
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
        >
          Set plan
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-surface-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Change plan</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted">
                  No users yet. Assign a plan by email above.
                </td>
              </tr>
            ) : (
              emails.map((email) => {
                const sub = byEmail.get(email);
                const current = (sub?.plan_id ?? "free") as PlanId;
                const status = sub?.status ?? "active";
                return (
                  <tr key={email}>
                    <td className="px-4 py-3">{email}</td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {sub?.plan_name ?? current}
                      {sub?.provider ? (
                        <span className="ml-2 text-xs opacity-60">
                          ({sub.provider})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{status}</td>
                    <td className="px-4 py-3">
                      <select
                        value={current}
                        disabled={busyEmail === email}
                        onChange={(e) =>
                          void patchUser(email, {
                            planId: e.target.value as PlanId,
                            status: "active",
                          })
                        }
                        className="rounded-lg border border-surface-border bg-background px-2 py-1.5 text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyEmail === email || status === "active"}
                          onClick={() =>
                            void patchUser(email, { status: "active" })
                          }
                          className="rounded-full border border-surface-border px-3 py-1 text-xs font-semibold disabled:opacity-40"
                        >
                          Activate
                        </button>
                        <button
                          type="button"
                          disabled={
                            busyEmail === email || status === "canceled"
                          }
                          onClick={() =>
                            void patchUser(email, { status: "canceled" })
                          }
                          className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-300 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>
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
