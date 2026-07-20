import { auth } from "@/auth";
import { BillingOverview } from "@/components/billing-overview";
import { BrandLogo } from "@/components/brand-logo";
import { BillingService } from "@/lib/billing";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardBillingPage() {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    redirect("/login?callbackUrl=/dashboard/billing");
  }

  const current = await BillingService.getCurrentPlan(email);

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/dashboard"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Billing
        </p>
        <h1 className="mt-2 text-3xl font-bold">Your subscription</h1>
        <p className="mt-2 text-sm text-muted">
          Plans are managed in Crestis. Crypto, Polar, or invoices can plug in
          later without changing entitlements.
        </p>

        <div className="mt-10">
          <BillingOverview current={current} />
        </div>
      </main>
    </div>
  );
}
