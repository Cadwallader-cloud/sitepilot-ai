import Link from "next/link";

type PublishPageProps = {
  searchParams: Promise<{ business?: string }>;
};

export default async function PublishPage({ searchParams }: PublishPageProps) {
  const { business } = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
              SP
            </span>
            <span className="text-lg font-semibold">
              SitePilot <span className="text-brand-light">AI</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
          Step 4 — Publish
        </p>
        <h1 className="mt-4 text-4xl font-bold">Publish your website</h1>

        {business && (
          <p className="mt-3 text-lg text-muted">
            Ready to go live with <span className="text-foreground">{business}</span>
          </p>
        )}

        <div className="mt-10 rounded-2xl border border-surface-border bg-surface p-8">
          <p className="text-5xl font-bold">$199</p>
          <p className="mt-2 text-muted">One-time payment</p>

          <ul className="mt-8 space-y-3 text-left text-sm">
            {[
              "Professional website live in 24 hours",
              "Mobile-optimized design",
              "Contact form setup",
              "SEO-ready page copy",
              "Custom domain connection",
              "1 year hosting included",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-8 w-full rounded-full bg-brand py-4 text-lg font-bold text-white transition hover:bg-brand-light"
          >
            Pay $199 — Publish now
          </button>

          <p className="mt-4 text-xs text-muted">
            Secure checkout coming soon. Contact us to publish manually.
          </p>
        </div>

        <Link
          href="/create"
          className="mt-8 inline-block text-sm text-muted transition hover:text-foreground"
        >
          ← Back to preview
        </Link>
      </main>
    </div>
  );
}
