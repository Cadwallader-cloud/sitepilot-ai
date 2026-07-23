import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getAdminCostStats } from "@/lib/admin-cost-stats";
import { BrandLogo } from "@/components/brand-logo";
import { notFound, redirect } from "next/navigation";

function usd(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })}`;
}

function msLabel(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface/40 px-5 py-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default async function AdminCostsPage() {
  const adminsConfigured =
    (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean).length > 0;

  if (!adminsConfigured) {
    notFound();
  }

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    redirect("/login?callbackUrl=/admin/costs");
  }

  const stats = await getAdminCostStats();

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="text-muted transition hover:text-foreground"
            >
              Admin
            </Link>
            <span className="hidden text-muted sm:inline">{adminEmail}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Admin · Costs
          </p>
          <h1 className="mt-2 text-3xl font-bold">Generation cost dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Aggregated from successful{" "}
            <code className="font-mono">/api/generate</code> runs (last{" "}
            {stats.sampleCount} samples with usage data).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Samples" value={stats.sampleCount} />
          <StatCard label="Avg cost / site" value={usd(stats.avgCostUsd)} />
          <StatCard label="Avg time / site" value={msLabel(stats.avgDurationMs)} />
          <StatCard
            label="Input tokens"
            value={stats.totalInputTokens.toLocaleString("en-US")}
          />
          <StatCard
            label="Output tokens"
            value={stats.totalOutputTokens.toLocaleString("en-US")}
          />
          <StatCard label="Total cost" value={usd(stats.totalCostUsd)} />
        </div>

        <section>
          <h2 className="text-xl font-bold">Most expensive modules</h2>
          <p className="mt-1 text-sm text-muted">
            Ranked by total estimated OpenAI cost across sampled generations.
          </p>
          {stats.mostExpensive.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No generation usage logged yet. Run a few sites after deploying
              telemetry + cost meta on{" "}
              <code className="font-mono">/api/generate</code>.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Module</th>
                    <th className="px-4 py-3 font-medium text-right">Runs</th>
                    <th className="px-4 py-3 font-medium text-right">Avg time</th>
                    <th className="px-4 py-3 font-medium text-right">Input</th>
                    <th className="px-4 py-3 font-medium text-right">Output</th>
                    <th className="px-4 py-3 font-medium text-right">Total $</th>
                    <th className="px-4 py-3 font-medium text-right">Avg $</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stats.mostExpensive.map((row) => (
                    <tr key={row.stage}>
                      <td className="px-4 py-3 font-mono">{row.stage}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.runs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {msLabel(row.avgDurationMs)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.inputTokens.toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.outputTokens.toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {usd(row.costUsd)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {usd(row.avgCostUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold">Cost by module</h2>
          {stats.byModule.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No module breakdown available.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Module</th>
                    <th className="px-4 py-3 font-medium text-right">Runs</th>
                    <th className="px-4 py-3 font-medium text-right">Avg time</th>
                    <th className="px-4 py-3 font-medium text-right">Tokens</th>
                    <th className="px-4 py-3 font-medium text-right">Total $</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stats.byModule.map((row) => (
                    <tr key={row.stage}>
                      <td className="px-4 py-3 font-mono">{row.stage}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.runs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {msLabel(row.avgDurationMs)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.totalTokens.toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {usd(row.costUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
