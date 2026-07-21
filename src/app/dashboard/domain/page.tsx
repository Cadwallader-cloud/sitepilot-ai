import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { CustomDomainPanel } from "@/components/custom-domain-panel";
import { canUseCustomDomain, getUserBilling } from "@/lib/billing";
import { isAdminEmail } from "@/lib/admin";
import { getProject } from "@/lib/projects";
import { publicSiteUrl } from "@/lib/slug";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function DomainPage({ searchParams }: PageProps) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) redirect("/login?callbackUrl=/dashboard/domain");

  const { project: projectId } = await searchParams;
  const isUuid =
    typeof projectId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    );
  if (!projectId || !isUuid) redirect("/dashboard");

  if (!isAdminEmail(email)) {
    const billing = await getUserBilling(email);
    if (!canUseCustomDomain(billing.entitlements)) {
      redirect(`/upgrade?feature=custom_domain&project=${projectId}`);
    }
  }

  let project;
  try {
    project = await getProject(projectId, email);
    if (!project) redirect("/dashboard");
  } catch {
    redirect("/dashboard");
  }

  const published = Boolean(project.published_at);
  const url =
    published && project.slug ? publicSiteUrl(project.slug) : null;

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

      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Domain
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
            Publish this site before connecting a custom domain.
          </p>
        )}

        {published ? (
          <div className="mt-10">
            <CustomDomainPanel
              projectId={project.id}
              initialDomain={project.custom_domain}
            />
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-surface-border bg-surface/40 p-6 text-sm text-muted">
            Publish your website first, then return here to connect a custom
            domain.
          </div>
        )}

        <p className="mt-8 text-sm text-muted">
          <Link href="/dashboard" className="text-brand-light hover:underline">
            Back to My Websites
          </Link>
        </p>
      </main>
    </div>
  );
}
