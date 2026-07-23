"use client";

import { AuthButton, SignInGate } from "@/components/auth-button";
import { BusinessForm } from "@/components/business-form";
import { GenerationProgress } from "@/components/generation-progress";
import { RequestAccess } from "@/components/request-access";
import { PreviewEditorHeader } from "@/components/preview-editor-header";
import { PreviewEditorPanel } from "@/components/preview-editor-panel";
import { UpgradeModal } from "@/components/upgrade-modal";
import { ImprovePanel } from "@/components/improve-panel";
import { PublishSuccessBanner } from "@/components/publish-success-banner";
import { SitePreview } from "@/components/site-preview";
import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import {
  applyGenerationEvent,
  initialGenerationSteps,
  type GenerationStepState,
} from "@/lib/generation-progress";
import type { GeneratedSite, GenerateSource } from "@/lib/site-types";
import type { GenerationMode } from "@/lib/ai/generation-mode";
import { GENERATION_MODE_DEFAULT } from "@/lib/ai/generation-mode";
import { getHero } from "@/lib/site-types";
import { websiteToGeneratedSite } from "@/lib/website";
import { usePublishSite } from "@/lib/use-publish-site";
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
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>(GENERATION_MODE_DEFAULT);
  const [editorTab, setEditorTab] = useState<"preview" | "improve">("preview");
  const [editorSection, setEditorSection] = useState<
    "hero" | "about" | "cta" | "colors" | "template"
  >("hero");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [liveSlug, setLiveSlug] = useState<string | null>(null);
  const generatingRef = useRef(false);
  const exampleStartedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const activeStep = !session ? 1 : site ? (hasEdited ? 4 : 3) : 2;

  const { publish, publishing, liveUrl, error: publishError } = usePublishSite({
    site,
    projectId,
    input: lastInput,
    onUpgradeRequired: () => setUpgradeOpen(true),
    onPublished: ({ projectId: id, slug }) => {
      setProjectId(id);
      setLiveSlug(slug);
    },
  });

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

  function handleSiteChange(next: GeneratedSite) {
    setSite(next);
    setHasEdited(true);
    if (projectId) scheduleSave(next, projectId);
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
    setGenSteps(
      applyGenerationEvent(initialGenerationSteps(), {
        type: "generation:start",
      }),
    );

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
          generationMode,
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
              const row = data as {
                type?: string;
                step?: string;
                stage?: string;
                label?: string;
              };
              if (typeof row.type === "string") {
                const eventType = row.type;
                setGenSteps((prev) =>
                  applyGenerationEvent(prev, {
                    type: eventType,
                    step: row.step,
                    stage: row.stage,
                    label: row.label,
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
        setGenSteps((prev) =>
          applyGenerationEvent(prev, { type: "generation:preview" }),
        );
        if (streamBox.result.projectId) {
          setProjectId(streamBox.result.projectId);
          setSaveState("saved");
        }
        window.requestAnimationFrame(() => {
          previewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
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
      setGenSteps((prev) =>
        applyGenerationEvent(prev, { type: "generation:preview" }),
      );
      if (data.projectId) {
        setProjectId(data.projectId);
        setSaveState("saved");
      }
      window.requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
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
      ) : site && !loading ? (
        <div ref={previewRef}>
          <UpgradeModal
            open={upgradeOpen}
            onClose={() => setUpgradeOpen(false)}
            feature="publish"
            businessName={site.businessName}
          />

          <PreviewEditorHeader
            activeTab={editorTab}
            onPreview={() => setEditorTab("preview")}
            onImprove={() => setEditorTab("improve")}
            onPublish={() => void publish()}
            publishing={publishing}
            publishLabel={liveUrl ? "Republish" : "Publish"}
          />

          {liveUrl && (
            <PublishSuccessBanner url={liveUrl} slug={liveSlug ?? "site"} />
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
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
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300"
              >
                Live
              </a>
            )}
          </div>

          {publishError && (
            <p className="mb-4 text-sm text-red-300">{publishError}</p>
          )}

          {editorTab === "preview" ? (
            <div className="grid gap-8 xl:grid-cols-[minmax(280px,340px)_1fr] xl:items-start">
              <PreviewEditorPanel
                site={site}
                onChange={handleSiteChange}
                activeSection={editorSection}
                onSectionChange={setEditorSection}
              />
              <SitePreview
                site={site}
                onChange={handleSiteChange}
                inlineEditor={false}
              />
            </div>
          ) : lastInput ? (
            <ImprovePanel
              site={site}
              input={lastInput}
              onImproved={handleSiteChange}
            />
          ) : (
            <div className="rounded-2xl border border-surface-border bg-surface/50 p-8 text-center text-muted">
              Business details are required to run AI Improve.
            </div>
          )}

          {lastInput && (
            <button
              type="button"
              onClick={() => runGeneration(lastInput, { regenerate: true })}
              disabled={loading}
              className="mt-6 w-full rounded-xl border border-surface-border py-2.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
            >
              ↻ Regenerate entire site with AI
            </button>
          )}

          <div className="mt-8">
            <RequestAccess
              key={lastInput?.businessName ?? site.businessName ?? "lead"}
              compact
              defaultBusinessName={
                lastInput?.businessName ?? site.businessName ?? ""
              }
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-10 xl:grid-cols-[380px_1fr] xl:items-start">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Business details
              </h2>
              <AuthButton compact />
            </div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                Generation mode
              </span>
              <select
                value={generationMode}
                onChange={(e) =>
                  setGenerationMode(e.target.value as GenerationMode)
                }
                disabled={loading}
                className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-sm text-foreground"
              >
                <option value="fast">Fast — minimum AI, target &lt;30s</option>
                <option value="balanced">Balanced — default quality</option>
                <option value="premium">Premium — full QA + scoring</option>
              </select>
            </label>
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

          <div ref={previewRef}>
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
                <SitePreview site={site} onChange={handleSiteChange} />
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/50 p-8 text-center text-muted">
                <div>
                  <p className="text-4xl">🏗️</p>
                  <p className="mt-4 font-medium text-foreground">
                    Your finished website will appear here
                  </p>
                  <p className="mt-2 text-sm">
                    Enter details and press Generate Website — not JSON, a real
                    preview
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
