"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const examples = [
  "Mike's Electrical — electrician in Chicago, residential & commercial",
  "Johnson Renovations — kitchen and bathroom remodeling in Dallas",
  "ProBuild Construction — general contractor in Austin, Texas",
];

export function PromptForm({
  compact = false,
  initialPrompt = "",
}: {
  compact?: boolean;
  initialPrompt?: string;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const params = new URLSearchParams({ prompt: trimmed });
    router.push(`/create?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl text-left">
      <div
        className={`rounded-2xl border border-surface-border bg-surface p-2 shadow-2xl shadow-black/40 ${
          compact ? "" : "ring-1 ring-brand/20"
        }`}
      >
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={compact ? 3 : 4}
          placeholder="e.g. Smith Plumbing — emergency plumber in Manchester, 24/7 service"
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted focus:outline-none"
        />
        <div className="flex flex-col gap-3 border-t border-surface-border px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {!compact && (
            <div className="flex flex-wrap gap-2 px-2 pb-2 sm:pb-0">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-surface-border px-3 py-1 text-xs text-muted transition hover:border-brand/40 hover:text-foreground"
                >
                  {example.length > 42 ? `${example.slice(0, 42)}…` : example}
                </button>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40 sm:ml-auto"
          >
            Generate my website →
          </button>
        </div>
      </div>
    </form>
  );
}
