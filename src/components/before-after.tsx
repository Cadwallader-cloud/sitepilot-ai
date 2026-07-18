const beforeItems = ["No website", "Losing jobs to competitors online", "Customers can't find you on Google"];

const afterItems = [
  "Professional website",
  "Mobile version",
  "Contact form",
  "SEO text",
];

export function BeforeAfter() {
  return (
    <section className="border-t border-surface-border px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          What you actually get
        </h2>
        <p className="mt-3 text-center text-muted">
          You&apos;re not buying AI. You&apos;re buying a website that wins you jobs.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
              Before
            </p>
            <ul className="mt-6 space-y-4">
              {beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <span className="text-red-400">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              After
            </p>
            <ul className="mt-6 space-y-4">
              {afterItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
