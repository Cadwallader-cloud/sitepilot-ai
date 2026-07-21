"use client";

import Link from "next/link";

type PreviewEditorHeaderProps = {
  activeTab?: "preview" | "improve";
  onPreview?: () => void;
  onImprove?: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  publishLabel?: string;
  backHref?: string;
};

export function PreviewEditorHeader({
  activeTab = "preview",
  onPreview,
  onImprove,
  onPublish,
  publishing = false,
  publishLabel = "Publish",
  backHref = "/dashboard",
}: PreviewEditorHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface/60 px-4 py-3 sm:px-5">
      <Link
        href={backHref}
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-background p-1 text-sm">
        <button
          type="button"
          onClick={onPreview}
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            activeTab === "preview"
              ? "bg-brand/20 text-brand-light"
              : "text-muted hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={onImprove}
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            activeTab === "improve"
              ? "bg-brand/20 text-brand-light"
              : "text-muted hover:text-foreground"
          }`}
        >
          Improve
        </button>
      </div>

      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-wait disabled:opacity-60"
      >
        {publishing ? "Publishing…" : publishLabel}
      </button>
    </div>
  );
}
