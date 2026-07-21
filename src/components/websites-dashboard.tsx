"use client";

import { UpgradeModal } from "@/components/upgrade-modal";
import type { ProjectSummary } from "@/lib/projects";
import type { FeatureKey } from "@/lib/billing/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  const className = `rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
    variant === "danger"
      ? "border border-red-500/30 text-red-300 hover:bg-red-500/10"
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
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [upgradeFeature, setUpgradeFeature] = useState<FeatureKey | null>(null);

  const entitlements = session?.user?.entitlements;
  const isAdmin = Boolean(session?.user?.isAdmin);
  const allowPublish = isAdmin || Boolean(entitlements?.canPublish);
  const allowAnalytics = isAdmin || Boolean(entitlements?.canUseAnalytics);
  const allowDomain = isAdmin || Boolean(entitlements?.canUseCustomDomain);

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

  function handlePublish(id: string) {
    if (!allowPublish) {
      setUpgradeFeature("publish");
      return;
    }
    setBusyId(id);
    void (async () => {
      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: id }),
        });
        const data = (await res.json()) as {
          error?: string;
          url?: string;
          upgradeRequired?: boolean;
        };
        if (res.status === 402 || data.upgradeRequired) {
          setUpgradeFeature("publish");
          return;
        }
        if (!res.ok) throw new Error(data.error ?? "Publish failed");
        if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Publish failed");
      } finally {
        setBusyId(null);
      }
    })();
  }

  function handleAnalytics(project: ProjectSummary) {
    if (!allowAnalytics) {
      setUpgradeFeature("analytics");
      return;
    }
    if (project.status !== "published") {
      setError("Publish this site to open Analytics.");
      return;
    }
    router.push(`/dashboard/analytics?project=${project.id}`);
  }

  function handleDomain(project: ProjectSummary) {
    if (!allowDomain) {
      setUpgradeFeature("custom_domain");
      return;
    }
    if (project.status !== "published") {
      setError("Publish this site to connect a custom domain.");
      return;
    }
    router.push(`/dashboard/domain?project=${project.id}`);
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
      <UpgradeModal
        open={upgradeFeature !== null}
        onClose={() => setUpgradeFeature(null)}
        feature={upgradeFeature}
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="border-t border-surface-border pt-6">
        <ul className="space-y-0 divide-y divide-surface-border">
          {projects.map((project) => {
            const busy = busyId === project.id;
            return (
              <li
                key={project.id}
                className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
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
                  <ActionButton onClick={() => handleAnalytics(project)}>
                    Analytics
                  </ActionButton>
                  <ActionButton onClick={() => handleDomain(project)}>
                    Domain
                  </ActionButton>
                  {project.status === "draft" && (
                    <ActionButton
                      onClick={() => handlePublish(project.id)}
                      disabled={busy}
                    >
                      {busy ? "Publishing…" : "Publish"}
                    </ActionButton>
                  )}
                  <ActionButton
                    variant="danger"
                    disabled={busy}
                    onClick={() => void handleDelete(project)}
                  >
                    {busy ? "…" : "Delete"}
                  </ActionButton>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
