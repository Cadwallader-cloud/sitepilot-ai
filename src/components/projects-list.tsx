"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectSummary = {
  id: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/projects");
        const data = (await res.json()) as {
          projects?: ProjectSummary[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) setProjects(data.projects ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setProjects([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (projects === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </p>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface/40 px-6 py-12 text-center">
        <p className="font-medium text-foreground">No projects yet</p>
        <p className="mt-2 text-sm text-muted">
          Generate a website and it will appear here automatically.
        </p>
        <Link
          href="/create"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          Generate a site
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface/40">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={`/create?project=${project.id}`}
            className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface"
          >
            <div>
              <p className="font-medium text-foreground">
                {project.businessName}
              </p>
              <p className="mt-1 text-xs text-muted">
                Updated {formatDate(project.updatedAt)}
              </p>
            </div>
            <span className="text-sm text-brand-light">Open →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
