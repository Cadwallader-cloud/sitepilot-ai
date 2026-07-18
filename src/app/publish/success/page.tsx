import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type SuccessPageProps = {
  searchParams: Promise<{ business?: string }>;
};

export default async function PublishSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { business } = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
          ✓
        </div>
        <h1 className="mt-6 text-4xl font-bold">Publish request received!</h1>
        <p className="mt-4 text-muted">
          {business
            ? `We're preparing ${business} for launch.`
            : "We're preparing your website for launch."}{" "}
          You'll hear from us within 24 hours with your live site link.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 font-semibold text-white hover:bg-brand-light"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
