import Link from "next/link";
import { auth, getAuthProvidersStatus } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { SignInForm } from "@/components/sign-in-form";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const next =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user) {
    redirect(next);
  }

  const providers = getAuthProvidersStatus();

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Sign in to Crestis</h1>
        <p className="mt-3 text-sm text-muted">
          Your websites are tied to your account — sign in to open drafts,
          publish, and come back tomorrow.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <SignInForm
            callbackUrl={next}
            googleEnabled={providers.google}
          />
        </div>

        <p className="mt-8 text-xs text-muted">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="text-brand-light hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-brand-light hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
