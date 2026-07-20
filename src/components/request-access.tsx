"use client";

import { useState, type FormEvent } from "react";

type RequestAccessProps = {
  /** Prefill business name after generate */
  defaultBusinessName?: string;
  /** Compact block under preview */
  compact?: boolean;
};

export function RequestAccess({
  defaultBusinessName = "",
  compact = false,
}: RequestAccessProps) {
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="early-access"
      className={
        compact
          ? "rounded-2xl border border-brand/30 bg-brand/10 p-6 text-center"
          : "scroll-mt-24 rounded-2xl border border-surface-border bg-surface/40 p-6 text-center sm:p-8"
      }
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
        Get Early Access
      </p>
      <h2 className="mt-2 text-2xl font-bold">
        We&apos;re onboarding our first businesses.
      </h2>
      <p className="mt-2 text-sm text-muted">
        Leave your details and we&apos;ll reach out when your spot opens.
      </p>

      {done ? (
        <p className="mt-6 text-sm font-medium text-emerald-300">
          Thanks — we received your request.
        </p>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3 text-left">
          <label className="block text-sm">
            <span className="text-muted">Business name</span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business"
              className="mt-1 w-full rounded-xl border border-surface-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="mt-1 w-full rounded-xl border border-surface-border bg-background px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50"
          >
            {busy ? "Sending…" : "Request Access"}
          </button>
          {error && (
            <p className="text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
