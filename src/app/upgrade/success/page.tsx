import { BrandLogo } from "@/components/brand-logo";
import { activateCheckoutSession } from "@/lib/billing";
import { getPlan } from "@/lib/plans";
import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function UpgradeSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  let planLabel: string | null = null;
  let businessName: string | null = null;
  let activated = false;
  let error: string | null = null;

  if (sessionId) {
    try {
      const result = await activateCheckoutSession(sessionId);
      if (result) {
        activated = true;
        const plan = getPlan(result.planId);
        planLabel = plan ? `${plan.name} (${plan.priceLabel})` : result.planName;
        businessName = result.businessName;
      } else {
        error = "Payment could not be verified yet. Check your email receipt.";
      }
    } catch (err) {
      console.error("Upgrade success verify failed:", err);
      error = "Could not verify payment. Contact support if you were charged.";
    }
  } else {
    error = "Missing checkout session.";
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
            activated
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-200"
          }`}
        >
          {activated ? "✓" : "!"}
        </div>
        <h1 className="mt-6 text-4xl font-bold">
          {activated ? "You're upgraded" : "Almost there"}
        </h1>
        <p className="mt-4 text-muted">
          {activated ? (
            <>
              {planLabel ? (
                <>
                  Plan: <span className="text-foreground">{planLabel}</span>
                  {businessName ? (
                    <>
                      {" "}
                      for{" "}
                      <span className="text-foreground">{businessName}</span>
                    </>
                  ) : null}
                  .
                </>
              ) : (
                "Your payment went through."
              )}{" "}
              Your site stays live — manage it from the dashboard.
            </>
          ) : (
            (error ?? "Something went wrong.")
          )}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 font-semibold text-white hover:bg-brand-light"
          >
            Go to dashboard
          </Link>
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full border border-surface-border px-8 font-semibold text-muted hover:text-foreground"
          >
            Edit site
          </Link>
        </div>
      </main>
    </div>
  );
}
