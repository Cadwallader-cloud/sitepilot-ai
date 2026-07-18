import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { getProject } from "@/lib/projects";
import { publicSiteUrl } from "@/lib/slug";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) redirect("/create");

  const { project: projectId } = await searchParams;
  if (!projectId) redirect("/dashboard");

  const project = await getProject(projectId, email);
  if (!project) redirect("/dashboard");

  const url =
    project.slug && project.published_at
      ? publicSiteUrl(project.slug)
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
            ← My Websites
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-bold">{project.business_name}</h1>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-brand-light hover:underline"
          >
            {url.replace(/^https?:\/\//, "")}
          </a>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Views", value: "—" },
            { label: "Visitors", value: "—" },
            { label: "Calls taps", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-surface-border bg-surface/40 px-5 py-6"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-xl border border-surface-border bg-surface/30 px-4 py-3 text-sm text-muted">
          Detailed analytics land in the next sprint. For now you can manage
          this site from{" "}
          <Link href="/dashboard" className="text-brand-light hover:underline">
            My Websites
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
