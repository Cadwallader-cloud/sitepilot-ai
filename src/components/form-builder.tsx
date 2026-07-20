"use client";

import { AuthButton, SignInGate } from "@/components/auth-button";
import { BusinessForm } from "@/components/business-form";
import { GenerationProgress } from "@/components/generation-progress";
import { RequestAccess } from "@/components/request-access";
import { PublishCTA } from "@/components/publish-cta";
import { QualityAuditPanel } from "@/components/quality-audit-panel";
import { SitePreview } from "@/components/site-preview";
import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import {
  applyGenerationEvent,
  initialGenerationSteps,
  type GenerationStepState,
} from "@/lib/generation-progress";
import type { GeneratedSite, GenerateSource } from "@/lib/site-types";
import { getHero } from "@/lib/site-types";
import { websiteToGeneratedSite } from "@/lib/website";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const funnelSteps = ["Sign in", "Generate", "Preview", "Edit"];

type FormBuilderProps = {
  loadExample?: boolean;
  projectId?: string;
};

function parseSseChunk(
  buffer: string,
  onEvent: (event: string, data: unknown) => void,
): string {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  for (const block of parts) {
    let eventName = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    try {
      onEvent(eventName, JSON.parse(dataLines.join("\n")));
    } catch {
      // ignore malformed chunk
    }
  }
  return rest;
}

export function FormBuilder({
  loadExample = false,
  projectId: initialProjectId,
}: FormBuilderProps) {
  const { data: session, status } = useSession();
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [source, setSource] = useState<GenerateSource | null>(null);
  const [projectId, setProjectId] = useState<string | null>(
    initialProjectId ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(Boolean(initialProjectId));
  const [error, setError] = useState<string | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [lastInput, setLastInput] = useState<BusinessFormInput | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [genSteps, setGenSteps] = useState<GenerationStepState>(() =>
    initialGenerationSteps(),
  );
  const generatingRef = useRef(false);
  const exampleStartedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const activeStep = !session ? 1 : site ? (hasEdited ? 4 : 3) : 2;

  async function persistSite(next: GeneratedSite, id: string) {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: next }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function scheduleSave(next: GeneratedSite, id: string) {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void persistSite(next, id);
    }, 800);
  }

  useEffect(() => {
    if (!loading) {
      setElapsedSec(0);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [loading]);

  async function runGeneration(
    input: BusinessFormInput,
    opts?: { regenerate?: boolean },
  ) {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setLoading(true);
    setError(null);
    setLastInput(input);
    setHasEdited(false);
    setSaveState("idle");
    setGenSteps(initialGenerationSteps());

    const regenerate = Boolean(opts?.regenerate && site);
    const previous =
      regenerate && site
        ? (() => {
            const h = getHero(site);
            return {
              headline: h.headline,
              subheadline: h.subheadline,
              primaryCTA: h.primaryCTA,
              heroTitle: h.headline,
              heroSubtitle: h.subheadline,
              heroCta: h.primaryCTA,
              aboutText: site.about.text,
            };
          })()
        : undefined;

    const controller = new AbortController();
    const timeoutMs = 100_000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...input,
          stream: true,
          regenerate,
          projectId: regenerate ? projectId : undefined,
          previous,
        }),
      });

      if (response.status === 401) {
        throw new Error("Please sign in with Google to generate your website.");
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        type StreamResult = {
          site?: GeneratedSite;
          source?: GenerateSource;
          projectId?: string;
          error?: string;
        };
        const streamBox: {
          result: StreamResult | null;
          error: string | null;
        } = { result: null, error: null };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = parseSseChunk(buffer, (event, data) => {
            if (event === "progress" && data && typeof data === "object") {
              const row = data as { type?: string; step?: string };
              if (typeof row.type === "string") {
                setGenSteps((prev) =>
                  applyGenerationEvent(prev, {
                    type: row.type!,
                    step: row.step,
                  }),
                );
              }
            } else if (event === "result" && data && typeof data === "object") {
              streamBox.result = data as StreamResult;
            } else if (event === "error" && data && typeof data === "object") {
              const row = data as { error?: string };
              streamBox.error = row.error ?? "Generation failed";
            }
          });
        }

        if (streamBox.error) throw new Error(streamBox.error);
        if (!streamBox.result?.site) {
          throw new Error("Invalid response from server");
        }

        setSite(streamBox.result.site);
        setSource("ai");
        if (streamBox.result.projectId) {
          setProjectId(streamBox.result.projectId);
          setSaveState("saved");
        }
        return;
      }

      const data = (await response.json()) as {
        site?: GeneratedSite;
        source?: GenerateSource;
        projectId?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }
      if (!data.site) {
        throw new Error("Invalid response from server");
      }

      setSite(data.site);
      setSource("ai");
      if (data.projectId) {
        setProjectId(data.projectId);
        setSaveState("saved");
      }
    } catch (err) {
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      setError(
        aborted
          ? "Generation timed out. Try again — if it keeps failing, check OpenAI / Vercel logs."
          : err instanceof Error
            ? err.message
            : "Something went wrong",
      );
      if (!regenerate) {
        setSite(null);
        setSource(null);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      generatingRef.current = false;
    }
  }

  useEffect(() => {
    if (!initialProjectId || !session) return;
    let cancelled = false;
    setLoadingProject(true);
    (async () => {
      try {
        const res = await fetch(`/api/projects/${initialProjectId}`);
        const data = (await res.json()) as {
          project?: {
            id: string;
            input: BusinessFormInput;
            site: GeneratedSite;
          };
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Project not found");
        if (cancelled || !data.project) return;
        setProjectId(data.project.id);
        setSite(websiteToGeneratedSite(data.project.site));
        setLastInput(data.project.input);
        setSource("ai");
        setSaveState("saved");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project");
        }
      } finally {
        if (!cancelled) setLoadingProject(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialProjectId, session]);

  useEffect(() => {
    if (
      !loadExample ||
      !session ||
      initialProjectId ||
      exampleStartedRef.current
    ) {
      return;
    }
    exampleStartedRef.current = true;
    const timer = window.setTimeout(() => {
      void runGeneration(exampleFormInput);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadExample, session, initialProjectId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  if (status === "loading" || loadingProject) {
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
        <div className="grid gap-10 xl:grid-cols-[380px_1fr] xl:items-start">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Business details
              </h2>
              <AuthButton compact />
            </div>
            <BusinessForm
              key={projectId ?? (loadExample ? "example" : "new")}
              onSubmit={runGeneration}
              initial={
                lastInput ?? (loadExample ? exampleFormInput : undefined)
              }
              loading={loading}
            />
            <Link
              href="/dashboard"
              className="mt-4 block text-center text-sm text-muted transition hover:text-foreground"
            >
              My Websites →
            </Link>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Website preview
              </h2>
              <div className="flex items-center gap-2">
                {projectId && saveState === "saved" && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Saved
                  </span>
                )}
                {projectId && saveState === "saving" && (
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
                    Saving…
                  </span>
                )}
                {source === "ai" && (
                  <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand-light">
                    AI generated
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <GenerationProgress steps={genSteps} elapsedSec={elapsedSec} />
            ) : error ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <div>
                  <p className="font-medium text-red-300">Something went wrong</p>
                  <p className="mt-2 text-sm text-muted">{error}</p>
                </div>
              </div>
            ) : site ? (
              <>
                <SitePreview
                  site={site}
                  onChange={(next) => {
                    setSite(next);
                    setHasEdited(true);
                    if (projectId) scheduleSave(next, projectId);
                  }}
                />
                {lastInput && (
                  <button
                    type="button"
                    onClick={() =>
                      runGeneration(lastInput, { regenerate: true })
                    }
                    disabled={loading}
                    className="mt-4 w-full rounded-xl border border-surface-border py-2.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
                  >
                    ↻ Regenerate with AI
                  </button>
                )}
                <QualityAuditPanel site={site} input={lastInput} />
                <PublishCTA
                  site={site}
                  projectId={projectId}
                  input={lastInput}
                  onPublished={({ projectId: id }) => {
                    setProjectId(id);
                  }}
                />
                <div className="mt-8">
                  <RequestAccess
                    key={lastInput?.businessName ?? site.businessName ?? "lead"}
                    compact
                    defaultBusinessName={
                      lastInput?.businessName ?? site.businessName ?? ""
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/50 p-8 text-center text-muted">
                <div>
                  <p className="text-4xl">🏗️</p>
                  <p className="mt-4 font-medium text-foreground">
                    Your finished website will appear here
                  </p>
                  <p className="mt-2 text-sm">
                    Enter details and press Generate — not JSON, a real preview
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
