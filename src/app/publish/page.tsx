import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { brand } from "@/lib/brand";

type PublishPageProps = {
  searchParams: Promise<{ business?: string }>;
};

export default async function PublishPage({ searchParams }: PublishPageProps) {
  const { business } = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
          Publish
        </p>
        <h1 className="mt-4 text-4xl font-bold">Ready to go live?</h1>

        {business && (
          <p className="mt-3 text-lg text-muted">
            <span className="text-foreground">{business}</span> is ready to
            publish.
          </p>
        )}

        <div className="mt-10 rounded-2xl border border-surface-border bg-surface p-8 text-left">
          <p className="text-sm text-muted">
            Publish from your preview page after AI generates your website.
            Payment and hosting setup will be added in the next step.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Professional website live in 24 hours",
              "Mobile-optimized design",
              "Contact form setup",
              "SEO-ready page copy",
              "Custom domain on crestis.app",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/create"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 font-semibold text-white hover:bg-brand-light"
        >
          Back to preview
        </Link>

        <p className="mt-6 text-xs text-muted">
          {brand.name} · {brand.tagline}
        </p>
      </main>
    </div>
  );
}
