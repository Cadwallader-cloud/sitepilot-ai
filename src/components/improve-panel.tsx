"use client";

import type { BusinessFormInput } from "@/lib/business-form";
import type { ImproveScope } from "@/lib/ai-engine/improve-site";
import type { GeneratedSite } from "@/lib/site-types";
import { useState } from "react";

type ImprovePanelProps = {
  site: GeneratedSite;
  input: BusinessFormInput;
  onImproved: (site: GeneratedSite) => void;
};

type ImproveOption = {
  scope: ImproveScope;
  title: string;
  description: string;
};

const IMPROVE_OPTIONS: ImproveOption[] = [
  {
    scope: "hero",
    title: "Improve Hero",
    description: "Review headline, value prop, and CTA — regenerate with Retry.",
  },
  {
    scope: "services",
    title: "Improve Services",
    description: "Sharpen service titles, descriptions, and benefits.",
  },
  {
    scope: "seo",
    title: "Improve SEO",
    description: "Refresh title, description, and local keywords.",
  },
  {
    scope: "entire",
    title: "Improve Entire Website",
    description: "Run all content reviewers + self-healing, then SEO.",
  },
];

type ImproveResult = {
  reviewBefore?: { final?: { score?: number }; report?: { overall?: number } };
  reviewAfter?: { final?: { score?: number }; report?: { overall?: number } };
  improvedSections?: string[];
  tasks?: { action: string; status: string; reasons?: string[] }[];
  error?: string;
};

export function ImprovePanel({ site, input, onImproved }: ImprovePanelProps) {
  const [activeScope, setActiveScope] = useState<ImproveScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImproveResult | null>(null);

  async function runImprove(scope: ImproveScope) {
    if (activeScope) return;
    setActiveScope(scope);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, input, scope }),
      });
      const data = (await res.json()) as ImproveResult & { site?: GeneratedSite };
      if (!res.ok || !data.site) {
        throw new Error(data.error ?? "Improve failed");
      }
      setResult(data);
      onImproved(data.site);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Improve failed");
    } finally {
      setActiveScope(null);
    }
  }

  const scoreBefore =
    result?.reviewBefore?.report?.overall ??
    result?.reviewBefore?.final?.score;
  const scoreAfter =
    result?.reviewAfter?.report?.overall ?? result?.reviewAfter?.final?.score;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        AI Improve
      </p>
      <p className="mt-2 text-sm text-muted">
        Uses Content Review Engine + Retry — only the selected section is
        regenerated.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {IMPROVE_OPTIONS.map((option) => {
          const loading = activeScope === option.scope;
          const disabled = Boolean(activeScope && activeScope !== option.scope);
          return (
            <button
              key={option.scope}
              type="button"
              onClick={() => void runImprove(option.scope)}
              disabled={disabled || loading}
              className="rounded-2xl border border-surface-border bg-background/60 p-4 text-left transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="font-semibold text-foreground">{option.title}</p>
              <p className="mt-1.5 text-sm text-muted">{option.description}</p>
              {loading && (
                <p className="mt-3 text-xs font-medium text-brand-light">
                  Reviewing and regenerating…
                </p>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-200">Improvement applied</p>
          {typeof scoreBefore === "number" && typeof scoreAfter === "number" && (
            <p className="mt-1 text-sm text-muted">
              Content score: {scoreBefore} → {scoreAfter}
            </p>
          )}
          {result.improvedSections?.length ? (
            <p className="mt-2 text-sm text-muted">
              Updated: {result.improvedSections.join(", ")}
            </p>
          ) : null}
          {result.tasks?.length ? (
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {result.tasks.map((task) => (
                <li key={`${task.action}-${task.status}`}>
                  {task.action}
                  {task.reasons?.length
                    ? ` — ${task.reasons.slice(0, 2).join("; ")}`
                    : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
