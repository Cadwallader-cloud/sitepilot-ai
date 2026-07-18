const trades = ["Builders", "Renovation companies", "Electricians", "Plumbers"];

export function NicheAudience() {
  return (
    <section className="border-t border-surface-border px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Build your construction website in minutes
        </h2>
        <p className="mt-4 text-lg text-muted">Built for contractors and trade businesses</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {trades.map((trade) => (
            <span
              key={trade}
              className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-5 py-2.5 text-sm font-medium"
            >
              <span className="text-emerald-400">✓</span>
              {trade}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
