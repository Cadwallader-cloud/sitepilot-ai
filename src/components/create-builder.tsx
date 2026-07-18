"use client";

import { AISetupNotice } from "@/components/ai-setup-notice";
import { PromptForm } from "@/components/prompt-form";
import { PublishCTA } from "@/components/publish-cta";
import { SitePreview } from "@/components/site-preview";
import { getDemoBySlug } from "@/lib/demo-sites";
import type { GeneratedSite, GenerateSource } from "@/lib/site-types";
import { useEffect, useState } from "react";

type CreateBuilderProps = {
  initialPrompt?: string;
  initialDemo?: string;
};

const funnelSteps = ["Create site", "Preview", "Looks good?", "Publish $199"];

export function CreateBuilder({ initialPrompt = "", initialDemo = "" }: CreateBuilderProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [source, setSource] = useState<GenerateSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    async function checkAiStatus() {
      try {
        const response = await fetch("/api/ai-status");
        const data = (await response.json()) as { configured?: boolean };
        setNeedsSetup(!data.configured);
      } catch {
        setNeedsSetup(true);
      }
    }

    checkAiStatus();
  }, []);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  async function runGeneration(text: string) {
    setLoading(true);
    setError(null);
    setActiveStep(1);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = (await response.json()) as {
        site?: GeneratedSite;
        source?: GenerateSource;
        error?: string;
        code?: string;
      };

      if (!response.ok) {
        if (data.code === "MISSING_API_KEY" || data.code === "INVALID_API_KEY") {
          setNeedsSetup(true);
        }
        throw new Error(data.error ?? "Generation failed");
      }

      if (!data.site) {
        throw new Error("Invalid response from server");
      }

      setSite(data.site);
      setSource(data.source ?? "mock");
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSite(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const demo = initialDemo ? getDemoBySlug(initialDemo) : undefined;

    if (demo) {
      setSite(demo.site);
      setPrompt(demo.prompt);
      setSource("mock");
      setError(null);
      setLoading(false);
      setActiveStep(2);
      return;
    }

    const trimmed = initialPrompt.trim();
    if (!trimmed) {
      setSite(null);
      setSource(null);
      setError(null);
      setActiveStep(1);
      return;
    }

    runGeneration(trimmed);
  }, [initialPrompt, initialDemo]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2 text-sm">
        {funnelSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-4 py-1.5 font-medium ${
                index + 1 <= activeStep
                  ? "bg-brand/20 text-brand-light"
                  : "bg-surface text-muted"
              }`}
            >
              {step}
            </span>
            {index < funnelSteps.length - 1 && (
              <span className="text-muted">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
            Step 1 — Describe your business
          </h2>
          <PromptForm compact initialPrompt={prompt} />
          {prompt && (
            <p className="mt-4 rounded-xl border border-surface-border bg-surface p-4 text-sm text-muted">
              <span className="font-medium text-foreground">Your business: </span>
              {prompt}
            </p>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
              Step 2 — Preview
            </h2>
            {source === "ai" && (
              <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand-light">
                AI generated
              </span>
            )}
            {initialDemo && site && !loading && (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                Static demo (not AI)
              </span>
            )}
            {source === "mock" && prompt && !loading && !initialDemo && (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                Template fallback
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface/50 p-8 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-4 font-medium text-foreground">Building your website…</p>
              <p className="mt-2 text-sm text-muted">Usually ready in under 60 seconds</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              {needsSetup && <AISetupNotice />}
              {!needsSetup && (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                  <div>
                    <p className="font-medium text-red-300">Generation failed</p>
                    <p className="mt-2 text-sm text-muted">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : site ? (
            <>
              <SitePreview site={site} />
              {initialDemo ? (
                <div className="mt-6 rounded-xl border border-brand/30 bg-brand/10 p-4 text-center">
                  <p className="text-sm text-muted">
                    This is a fixed demo. For a unique AI website, enter your business on the left.
                  </p>
                  <button
                    type="button"
                    onClick={() => runGeneration(prompt)}
                    className="mt-3 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand-light"
                  >
                    Generate unique version with AI →
                  </button>
                </div>
              ) : (
                <>
                  {source === "ai" && (
                    <button
                      type="button"
                      onClick={() => runGeneration(prompt)}
                      disabled={loading || !prompt.trim()}
                      className="mt-4 w-full rounded-xl border border-surface-border py-2.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
                    >
                      ↻ Regenerate — get a different version
                    </button>
                  )}
                  <PublishCTA businessName={site.title} />
                </>
              )}
            </>
          ) : needsSetup && !initialDemo ? (
            <AISetupNotice />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/50 p-8 text-center text-muted">
              <div>
                <p className="text-4xl">🏗️</p>
                <p className="mt-4 font-medium text-foreground">
                  Your contractor website will appear here
                </p>
                <p className="mt-2 text-sm">
                  Enter your business details and click &quot;Generate my website&quot;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
