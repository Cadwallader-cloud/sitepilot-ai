"use client";

import type { ProjectSummary } from "@/lib/projects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

function StatusBadge({ status }: { status: ProjectSummary["status"] }) {
  if (status === "published") {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
        Published
      </span>
    );
  }
  return (
    <span className="rounded-full bg-zinc-500/20 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
      Draft
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  href,
  variant = "default",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
}) {
  const className = `rounded-full px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
    variant === "danger"
      ? "border border-red-500/30 text-red-300 hover:bg-red-500/10"
      : variant === "primary"
        ? "bg-brand text-white hover:bg-brand-light"
        : "border border-surface-border text-muted hover:border-brand/40 hover:text-foreground"
  }`;

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

export function WebsitesDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = (await res.json()) as {
        projects?: ProjectSummary[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setProjects(data.projects ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePublish(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      await load();
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(project: ProjectSummary) {
    const ok = window.confirm(
      `Delete “${project.businessName}”? This cannot be undone.`,
    );
    if (!ok) return;

    setBusyId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setProjects((prev) => (prev ?? []).filter((p) => p.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (projects === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface/40 px-6 py-12 text-center">
        <p className="font-medium text-foreground">No websites yet</p>
        <p className="mt-2 text-sm text-muted">
          Generate your first site — it will show up here as a draft.
        </p>
        <Link
          href="/create"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          Create website
        </Link>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <ul className="divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-surface/40">
        {projects.map((project) => {
          const busy = busyId === project.id;
          return (
            <li key={project.id} className="px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-foreground">
                      {project.businessName}
                    </h2>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm text-brand-light hover:underline"
                    >
                      {project.url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Not published yet</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ActionButton href={`/create?project=${project.id}`}>
                    Edit
                  </ActionButton>

                  {project.status === "published" ? (
                    <>
                      <ActionButton
                        href={`/dashboard/analytics?project=${project.id}`}
                      >
                        Analytics
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        disabled={busy}
                        onClick={() => void handleDelete(project)}
                      >
                        {busy ? "…" : "Delete"}
                      </ActionButton>
                    </>
                  ) : (
                    <ActionButton
                      variant="primary"
                      disabled={busy}
                      onClick={() => void handlePublish(project.id)}
                    >
                      {busy ? "Publishing..." : "Publish"}
                    </ActionButton>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push("/create")}
          className="text-sm text-muted transition hover:text-foreground"
        >
          + New website
        </button>
      </div>
    </div>
  );
}
