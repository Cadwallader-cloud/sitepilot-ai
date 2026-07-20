import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { canUseAnalytics, getUserBilling } from "@/lib/billing";
import { isAdminEmail } from "@/lib/admin";
import { getProject } from "@/lib/projects";
import { getAnalyticsSummary } from "@/lib/site-analytics";
import { publicSiteUrl } from "@/lib/slug";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) redirect("/login?callbackUrl=/dashboard");

  const { project: projectId } = await searchParams;
  const isUuid =
    typeof projectId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    );
  if (!projectId || !isUuid) redirect("/dashboard");

  if (!isAdminEmail(email)) {
    const billing = await getUserBilling(email);
    if (!canUseAnalytics(billing.entitlements)) {
      redirect(`/upgrade?feature=analytics&project=${projectId}`);
    }
  }

  let project;
  let summary;
  try {
    project = await getProject(projectId, email);
    if (!project) redirect("/dashboard");
    summary = await getAnalyticsSummary(projectId);
  } catch {
    redirect("/dashboard");
  }

  const url =
    project.slug && project.published_at
      ? publicSiteUrl(project.slug)
      : null;

  const stats = [
    { label: "Visitors", value: summary.visitors },
    { label: "Page Views", value: summary.pageViews },
    { label: "Contact clicks", value: summary.contactClicks },
    { label: "Phone clicks", value: summary.phoneClicks },
    { label: "Google Maps clicks", value: summary.mapsClicks },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/dashboard"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← My Websites
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-bold">{project.business_name}</h1>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-brand-light hover:underline"
          >
            {url.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Publish this site to start collecting analytics.
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-surface-border bg-surface/40 px-5 py-6"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {stat.value.toLocaleString("en-US")}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted">
          Counts update when visitors open your live site and tap phone, email,
          or address links.{" "}
          <Link href="/dashboard" className="text-brand-light hover:underline">
            Back to My Websites
          </Link>
        </p>
      </main>
    </div>
  );
}
