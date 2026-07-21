"use client";

import {
  CUSTOM_DOMAIN_CNAME,
  CUSTOM_DOMAIN_FLOW_STEPS,
  DOMAIN_STATUS_LABELS,
  customDomainFlowStep,
  type DomainConnectionStatus,
} from "@/lib/domain-constants";
import { useCallback, useEffect, useState } from "react";

type CustomDomainPanelProps = {
  projectId: string;
  initialDomain?: string | null;
  onUpdated?: (domain: string | null) => void;
};

type DomainApiState = {
  customDomain: string | null;
  status: DomainConnectionStatus;
  statusLabel: string;
  dns: {
    step: number;
    title: string;
    record: { type: string; host: string; value: string };
    hint: string;
  };
  sslMessage?: string | null;
};

function FlowStepper({ activeStep }: { activeStep: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <ol className="flex flex-wrap items-center gap-1 text-xs sm:gap-2">
      {CUSTOM_DOMAIN_FLOW_STEPS.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4 | 5;
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
              className={`rounded-full px-2.5 py-1 font-medium transition ${
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

export function CustomDomainPanel({
  projectId,
  initialDomain = null,
  onUpdated,
}: CustomDomainPanelProps) {
  const [input, setInput] = useState(initialDomain ?? "");
  const [state, setState] = useState<DomainApiState | null>(null);
  const [busy, setBusy] = useState<"connect" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyDetail, setVerifyDetail] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/domain`);
    const data = (await res.json()) as DomainApiState & { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load domain");
    setState(data);
    if (data.customDomain) setInput(data.customDomain);
  }, [projectId]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load");
    });
  }, [load]);

  async function handleConnect() {
    setBusy("connect");
    setError(null);
    setVerifyDetail(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customDomain: input.trim() }),
      });
      const data = (await res.json()) as DomainApiState & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Connect failed");
      setState(data);
      onUpdated?.(data.customDomain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleVerify() {
    setBusy("verify");
    setError(null);
    setVerifyDetail(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as {
        error?: string;
        status?: DomainConnectionStatus;
        statusLabel?: string;
        dns?: { status: string; message: string };
        ssl?: { message: string };
        vercel?: { message: string };
      };
      if (!res.ok && !data.dns) {
        throw new Error(data.error ?? "Verify failed");
      }

      setState((prev) =>
        prev
          ? {
              ...prev,
              status: data.status ?? prev.status,
              statusLabel:
                data.statusLabel ??
                DOMAIN_STATUS_LABELS[data.status ?? prev.status],
              sslMessage: data.ssl?.message ?? prev.sslMessage,
            }
          : prev,
      );

      const parts = [
        data.dns?.message,
        data.vercel?.message,
        data.ssl?.message,
      ].filter(Boolean);
      setVerifyDetail(parts.join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(null);
    }
  }

  const status = state?.status ?? (initialDomain ? "waiting_dns" : "none");
  const statusLabel = state?.statusLabel ?? DOMAIN_STATUS_LABELS[status];
  const flowStep = customDomainFlowStep(status);
  const record = state?.dns.record ?? CUSTOM_DOMAIN_CNAME;
  const domainSaved = Boolean(state?.customDomain);
  const connected = flowStep >= 5;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 p-5">
      <p className="text-sm font-semibold text-foreground">Custom domain</p>
      <p className="mt-1 text-xs text-muted">
        Connect your domain, add DNS, verify, then SSL goes live automatically.
      </p>

      <div className="mt-5 overflow-x-auto pb-1">
        <FlowStepper activeStep={flowStep} />
      </div>

      {/* Step 1 — Domain */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {CUSTOM_DOMAIN_FLOW_STEPS[0]}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm outline-none ring-brand/40 focus:ring-2"
            disabled={busy !== null || connected}
          />
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={busy !== null || !input.trim() || connected}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50"
          >
            {busy === "connect" ? "Connecting…" : "Connect Domain"}
          </button>
        </div>
      </div>

      {/* Step 2 — DNS Instructions */}
      {domainSaved && flowStep >= 2 && (
        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            {CUSTOM_DOMAIN_FLOW_STEPS[1]}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {state?.dns.title ?? "Add this DNS record"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {state?.dns.hint ??
              "In your DNS provider, create this record:"}
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-surface-border bg-background/80">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Name / Host</th>
                  <th className="px-3 py-2">Value / Target</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-surface-border font-mono text-xs sm:text-sm">
                  <td className="px-3 py-2.5">{record.type}</td>
                  <td className="px-3 py-2.5">{record.host}</td>
                  <td className="px-3 py-2.5">{record.value}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3 — Verify */}
      {domainSaved && flowStep >= 2 && flowStep < 5 && (
        <div className="mt-6 rounded-xl border border-surface-border bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {CUSTOM_DOMAIN_FLOW_STEPS[2]}
              </p>
              <p className="mt-1 text-sm text-muted">
                After adding the DNS record, check that it points correctly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={busy !== null || !domainSaved}
              className="rounded-full border border-surface-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand/40 disabled:opacity-50"
            >
              {busy === "verify" ? "Checking…" : "Verify"}
            </button>
          </div>
          {verifyDetail && (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {verifyDetail}
            </p>
          )}
        </div>
      )}

      {/* Step 4 — SSL */}
      {domainSaved && (flowStep >= 4 || status === "ssl_pending") && flowStep < 5 && (
        <div className="mt-6 rounded-xl border border-brand/25 bg-brand/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">
            {CUSTOM_DOMAIN_FLOW_STEPS[3]}
          </p>
          <p className="mt-1 text-sm text-muted">
            {state?.sslMessage ??
              "Your SSL certificate is being provisioned. This usually takes a few minutes."}
          </p>
          {flowStep >= 4 && flowStep < 5 && (
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={busy !== null}
              className="mt-3 rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-brand/40 disabled:opacity-50"
            >
              {busy === "verify" ? "Checking…" : "Refresh status"}
            </button>
          )}
        </div>
      )}

      {/* Step 5 — Connected */}
      {connected && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {CUSTOM_DOMAIN_FLOW_STEPS[4]}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {statusLabel}
          </p>
          {state?.customDomain && (
            <a
              href={`https://www.${state.customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-brand-light hover:underline"
            >
              www.{state.customDomain}
            </a>
          )}
        </div>
      )}

      {/* Status (in-progress) */}
      {domainSaved && !connected && (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 ${
            status === "error"
              ? "border-red-500/30 bg-red-500/10"
              : "border-surface-border bg-background/40"
          }`}
        >
          <p className="text-xs uppercase tracking-wider text-muted">Status</p>
          <p className="mt-0.5 text-sm font-semibold">{statusLabel}</p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
