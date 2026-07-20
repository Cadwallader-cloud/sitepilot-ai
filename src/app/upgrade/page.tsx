import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { UpgradePlans } from "@/components/upgrade-plans";
import { getProject } from "@/lib/projects";
import { brand } from "@/lib/brand";
import type { FeatureKey } from "@/lib/billing/types";
import Link from "next/link";
import { redirect } from "next/navigation";

type UpgradePageProps = {
  searchParams: Promise<{
    project?: string;
    business?: string;
    feature?: string;
  }>;
};

const FEATURE_LABELS: Partial<Record<FeatureKey, string>> = {
  publish: "Publish",
  analytics: "Analytics",
  custom_domain: "Custom domain",
  create_website: "More websites",
  unlimited_projects: "More websites",
  ai_editing: "AI editing",
  business_features: "Business features",
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/upgrade");
  }

  const { project: projectId, business, feature } = await searchParams;
  let businessName = business?.trim() || null;

  if (projectId) {
    const project = await getProject(projectId, session.user.email);
    if (project) {
      businessName = project.business_name;
    }
  }

  const featureKey = feature as FeatureKey | undefined;
  const featureLabel =
    featureKey && FEATURE_LABELS[featureKey]
      ? FEATURE_LABELS[featureKey]
      : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/dashboard"
            className="text-sm text-muted transition hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-light">
          Upgrade Required
        </p>
        <h1 className="mt-3 text-center text-4xl font-bold">
          {featureLabel
            ? `${featureLabel} needs an upgrade`
            : "Upgrade to unlock"}
        </h1>
        {businessName && (
          <p className="mt-3 text-center text-muted">
            For <span className="text-foreground">{businessName}</span>
          </p>
        )}
        <p className="mt-3 text-center text-sm text-muted">
          Plans are managed in Crestis — payment providers can plug in later
          without changing entitlements.
        </p>

        <div className="mt-10">
          <UpgradePlans
            projectId={projectId ?? null}
            businessName={businessName}
          />
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          {brand.name} · Your plan:{" "}
          <span className="capitalize text-foreground">
            {session.user.planId ?? "free"}
          </span>
        </p>
      </main>
    </div>
  );
}
