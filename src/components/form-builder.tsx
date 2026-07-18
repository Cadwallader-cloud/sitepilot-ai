"use client";

import { AuthButton, SignInGate } from "@/components/auth-button";
import { BusinessForm } from "@/components/business-form";
import { PublishCTA } from "@/components/publish-cta";
import { SitePreview } from "@/components/site-preview";
import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import { formInputToPrompt } from "@/lib/form-to-prompt";
import type { GeneratedSite, GenerateSource } from "@/lib/site-types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const funnelSteps = ["Sign in", "Generate", "Preview"];

type FormBuilderProps = {
  loadExample?: boolean;
};

export function FormBuilder({ loadExample = false }: FormBuilderProps) {
  const { data: session, status } = useSession();
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [source, setSource] = useState<GenerateSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [lastInput, setLastInput] = useState<BusinessFormInput | null>(null);

  useEffect(() => {
    if (session) {
      setActiveStep((step) => Math.max(step, 2));
    }
  }, [session]);

  useEffect(() => {
    if (loadExample && session) {
      runGeneration(exampleFormInput);
    }
  }, [loadExample, session]);

  async function runGeneration(input: BusinessFormInput) {
    setLoading(true);
    setError(null);
    setLastInput(input);
    setActiveStep(2);

    const prompt = formInputToPrompt(input);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as {
        site?: GeneratedSite;
        source?: GenerateSource;
        error?: string;
        code?: string;
      };

      if (response.status === 401) {
        throw new Error("Please sign in with Google to generate your website.");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      if (!data.site) {
        throw new Error("Invalid response from server");
      }

      setSite(data.site);
      setSource(data.source ?? "mock");
      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSite(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

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

      {!session ? (
        <SignInGate />
      ) : (
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Your business details
              </h2>
              <AuthButton compact />
            </div>
            <BusinessForm
              onSubmit={runGeneration}
              initial={loadExample ? exampleFormInput : undefined}
              loading={loading}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Full website preview
              </h2>
              {source === "ai" && (
                <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand-light">
                  AI generated
                </span>
              )}
              {source === "mock" && lastInput && !loading && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                  Template fallback
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface/50 p-8 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <p className="mt-4 font-medium text-foreground">
                  AI is building your website…
                </p>
                <p className="mt-2 text-sm text-muted">
                  Usually ready in under 60 seconds
                </p>
              </div>
            ) : error ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <div>
                  <p className="font-medium text-red-300">Generation failed</p>
                  <p className="mt-2 text-sm text-muted">{error}</p>
                </div>
              </div>
            ) : site ? (
              <>
                <SitePreview site={site} />
                {source === "ai" && lastInput && (
                  <button
                    type="button"
                    onClick={() => runGeneration(lastInput)}
                    disabled={loading}
                    className="mt-4 w-full rounded-xl border border-surface-border py-2.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
                  >
                    ↻ Regenerate — get a different version
                  </button>
                )}
                <PublishCTA businessName={site.title} />
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/50 p-8 text-center text-muted">
                <div>
                  <p className="text-4xl">✨</p>
                  <p className="mt-4 font-medium text-foreground">
                    Your website preview will appear here
                  </p>
                  <p className="mt-2 text-sm">
                    Fill in your business details and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
