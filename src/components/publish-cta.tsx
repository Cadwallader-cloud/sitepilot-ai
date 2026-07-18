"use client";

import type { BusinessFormInput } from "@/lib/business-form";
import type { GeneratedSite } from "@/lib/site-types";
import { getBusinessName } from "@/lib/site-types";
import { toSlug } from "@/lib/slug";
import { useState } from "react";

type PublishCTAProps = {
  site: GeneratedSite;
  projectId: string | null;
  input?: BusinessFormInput | null;
  onPublished?: (info: {
    projectId: string;
    slug: string;
    url: string;
  }) => void;
};

type PublishState = "idle" | "publishing" | "published" | "error";

export function PublishCTA({
  site,
  projectId,
  input,
  onPublished,
}: PublishCTAProps) {
  const previewSlug = toSlug(getBusinessName(site));
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [liveSlug, setLiveSlug] = useState<string | null>(null);

  async function handlePublish() {
    if (state === "publishing") return;
    setState("publishing");
    setError(null);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site,
          projectId,
          input: input ?? undefined,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        slug?: string;
        projectId?: string;
        error?: string;
      };

      if (!res.ok || !data.url || !data.slug || !data.projectId) {
        throw new Error(data.error ?? "Publish failed");
      }

      setLiveUrl(data.url);
      setLiveSlug(data.slug);
      setState("published");
      onPublished?.({
        projectId: data.projectId,
        slug: data.slug,
        url: data.url,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
      setState("error");
    }
  }

  const displaySlug = liveSlug || previewSlug;
  const isPublishing = state === "publishing";
  const isPublished = state === "published" && liveUrl;

  return (
    <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
      <p className="text-lg font-semibold">
        {isPublished ? "Your site is live" : "Looks good?"}
      </p>
      <p className="mt-2 text-sm text-muted">
        {isPublished ? (
          <>
            Public URL:{" "}
            <a
              href={liveUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-light underline-offset-2 hover:underline"
            >
              {liveUrl}
            </a>
          </>
        ) : (
          <>
            Publish to{" "}
            <span className="font-medium text-foreground">
              {displaySlug}.crestis.app
            </span>
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => void handlePublish()}
        disabled={isPublishing}
        className="mt-6 inline-flex h-14 min-w-[200px] items-center justify-center rounded-full bg-brand px-10 text-lg font-bold text-white transition hover:bg-brand-light disabled:cursor-wait disabled:opacity-70"
      >
        {isPublishing
          ? "Publishing..."
          : isPublished
            ? "Republish"
            : "Publish"}
      </button>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {isPublished && (
        <p className="mt-3 text-xs text-muted">
          Edit anytime, then Republish to update the live site.
        </p>
      )}
    </div>
  );
}
