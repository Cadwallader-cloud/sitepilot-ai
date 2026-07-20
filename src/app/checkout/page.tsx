import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { CryptoCheckout } from "@/components/crypto-checkout";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    order?: string;
    project?: string;
    plan?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/checkout");
  }

  const { order, project, plan } = await searchParams;
  const planId = plan === "business" ? "business" : "pro";

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

      <main className="px-6 py-12">
        <CryptoCheckout
          projectId={project ?? null}
          initialOrderId={order ?? null}
          planId={planId}
        />
      </main>
    </div>
  );
}
