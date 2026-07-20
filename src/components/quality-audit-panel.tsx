"use client";

import type { BusinessFormInput } from "@/lib/business-form";
import type { QualityAuditResult, QualityCheck } from "@/lib/quality-audit";
import type { GeneratedSite } from "@/lib/site-types";
import { getHero } from "@/lib/site-types";
import { useEffect, useState } from "react";

type QualityAuditPanelProps = {
  site: GeneratedSite;
  input: BusinessFormInput | null;
};

function StatusIcon({ status }: { status: QualityCheck["status"] }) {
  if (status === "pass") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
        ✓
      </span>
    );
  }
  if (status === "warn") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400">
        ⚠
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
      ✕
    </span>
  );
}

function scoreTone(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-brand-light";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function QualityAuditPanel({ site, input }: QualityAuditPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QualityAuditResult | null>(null);

  const hero = getHero(site);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [hero.headline, site.about.text, site.seo.title, hero.primaryCTA]);

  async function runAudit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quality-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site,
          location: input?.location ?? site.contact.address,
          services: input?.services ?? "",
          input,
        }),
      });
      const data = (await res.json()) as QualityAuditResult & { error?: string };
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }

  const engineQuality = site.quality;

  return (
    <div className="mt-4 space-y-3">
      {engineQuality && (
        <div className="rounded-2xl border border-surface-border bg-surface/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                AI Quality Scorer
              </p>
              <p
                className={`mt-1 text-4xl font-bold tabular-nums ${scoreTone(engineQuality.overall)}`}
              >
                {engineQuality.overall}
                <span className="text-lg font-semibold text-muted">/100</span>
              </p>
            </div>
            {engineQuality.regeneratedSections &&
              engineQuality.regeneratedSections.length > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  Auto-fixed: {engineQuality.regeneratedSections.join(", ")}
                </span>
              )}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-3">
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">Headline</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.headlineQuality ?? engineQuality.heroScore}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">CTA</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.callToAction ?? engineQuality.ctaScore}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">SEO</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.seoScore}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">Trust</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.trustScore ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">Readability</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.readability ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-surface px-2 py-2">
              <dt className="text-muted">Professional</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">
                {engineQuality.professionalAppearance ?? "—"}
              </dd>
            </div>
          </dl>
          {(() => {
            const notes =
              engineQuality.reasons && engineQuality.reasons.length > 0
                ? engineQuality.reasons.map(
                    (r) => `${r.section} (${r.score}): ${r.reason}`,
                  )
                : engineQuality.issues;
            if (!notes.length) return null;
            return (
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {notes.slice(0, 6).map((issue) => (
                  <li key={issue}>• {issue}</li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}

      <button
        type="button"
        onClick={() => void runAudit()}
        disabled={loading}
        className="w-full rounded-xl border border-surface-border bg-surface/40 py-2.5 text-sm font-medium text-foreground transition hover:border-brand/40 hover:bg-surface disabled:opacity-40"
      >
        {loading ? "Running quality audit…" : "Run Quality Audit"}
      </button>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="rounded-2xl border border-surface-border bg-surface/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Website Quality
              </p>
              <p className={`mt-1 text-4xl font-bold tabular-nums ${scoreTone(result.score)}`}>
                {result.score}
                <span className="text-lg font-semibold text-muted">/100</span>
              </p>
              <p className="mt-2 text-sm text-muted">{result.summary}</p>
            </div>
            <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-light">
              {result.source === "hybrid"
                ? "AI + rules"
                : result.source === "ai"
                  ? "AI"
                  : "Rules"}
            </span>
          </div>

          <ul className="mt-5 space-y-2">
            {result.checks.map((check) => {
              const line =
                check.status === "pass"
                  ? check.label
                  : check.message || check.label;
              return (
                <li
                  key={check.id}
                  className="flex items-start gap-3 text-sm leading-snug"
                >
                  <StatusIcon status={check.status} />
                  <span
                    className={
                      check.status === "pass"
                        ? "font-medium text-foreground"
                        : check.status === "warn"
                          ? "font-medium text-amber-200"
                          : "font-medium text-red-200"
                    }
                  >
                    {line}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
