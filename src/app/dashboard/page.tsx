import Link from "next/link";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { WebsitesDashboard } from "@/components/websites-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const showAdmin = isAdminEmail(session.user.email);

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-4 text-sm">
            {showAdmin && (
              <Link
                href="/admin"
                className="font-medium text-brand-light transition hover:text-foreground"
              >
                Admin
              </Link>
            )}
            <Link
              href="/dashboard/billing"
              className="text-muted transition hover:text-foreground"
            >
              Billing
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-light"
            >
              + New website
            </Link>
            <AuthButton compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Websites</h1>
        <p className="mt-2 text-muted">
          Manage drafts, publish live sites, and open analytics.
        </p>
        <div className="mt-8">
          <WebsitesDashboard />
        </div>
      </main>
    </div>
  );
}
