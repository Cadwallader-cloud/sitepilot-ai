import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getAdminStats } from "@/lib/admin-stats";
import { AdminCryptoOrders } from "@/components/admin-crypto-orders";
import { AdminPaymentWallets } from "@/components/admin-payment-wallets";
import { AdminPlanManager } from "@/components/admin-plan-manager";
import { BrandLogo } from "@/components/brand-logo";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function usd(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface/40 px-5 py-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default async function AdminPage() {
  const adminsConfigured =
    (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean).length > 0;

  if (!adminsConfigured) {
    notFound();
  }

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    redirect("/login?callbackUrl=/admin");
  }

  const stats = await getAdminStats();

  const nav = [
    { href: "#wallets", label: "Payment wallets" },
    { href: "#crypto", label: "Crypto orders" },
    { href: "#billing", label: "Billing / Plans" },
    { href: "#users", label: "Users" },
    { href: "#projects", label: "Projects" },
    { href: "#revenue", label: "Revenue" },
    { href: "#api-usage", label: "API Usage" },
    { href: "#openai-cost", label: "OpenAI Cost" },
    { href: "#published", label: "Published Websites" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{adminEmail}</span>
            <Link
              href="/dashboard"
              className="text-muted transition hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-12">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold">System overview</h1>
          <p className="mt-2 text-sm text-muted">
            Users, projects, revenue, API usage, and OpenAI cost.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand/40 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={stats.users.length} />
          <StatCard label="Projects" value={stats.projects.length} />
          <StatCard label="Published" value={stats.published.length} />
          <StatCard label="Revenue" value={money(stats.revenue.totalCents)} />
        </div>

        <Section id="wallets" title="Payment wallets">
          <AdminPaymentWallets />
        </Section>

        <Section id="crypto" title="Crypto orders">
          <AdminCryptoOrders />
        </Section>

        <Section id="billing" title="Billing / Plans">
          <AdminPlanManager
            userEmails={stats.users.map((u) => u.email)}
          />
        </Section>

        <Section id="users" title="Users">
          {stats.users.length === 0 ? (
            <p className="text-sm text-muted">No users yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-surface-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Projects</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stats.users.map((user) => (
                    <tr key={user.email}>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 tabular-nums">{user.projects}</td>
                      <td className="px-4 py-3 tabular-nums">{user.published}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section id="projects" title="Projects">
          {stats.projects.length === 0 ? (
            <p className="text-sm text-muted">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-surface-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Business</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stats.projects.slice(0, 100).map((project) => (
                    <tr key={project.id}>
                      <td className="px-4 py-3 font-medium">
                        {project.businessName}
                      </td>
                      <td className="px-4 py-3 text-muted">{project.userEmail}</td>
                      <td className="px-4 py-3 capitalize">{project.status}</td>
                      <td className="px-4 py-3 capitalize text-muted">
                        {project.plan ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section id="revenue" title="Revenue">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Estimated total"
              value={money(stats.revenue.totalCents)}
            />
            <StatCard
              label="Paid projects"
              value={stats.revenue.paidProjects}
            />
            <StatCard
              label="Unpaid / free"
              value={Math.max(
                0,
                stats.projects.length - stats.revenue.paidProjects,
              )}
            />
          </div>
          {stats.revenue.byPlan.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {stats.revenue.byPlan.map((row) => (
                <li key={row.plan}>
                  <span className="capitalize text-foreground">{row.plan}</span>
                  : {row.count} × {money(row.cents / row.count)} ={" "}
                  {money(row.cents)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            Revenue is estimated from assigned plans (payments wired later).
          </p>
        </Section>

        <Section id="api-usage" title="API Usage">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Logged calls" value={stats.apiUsage.total} />
            <StatCard label="Last 24h" value={stats.apiUsage.last24h} />
          </div>
          {stats.apiUsage.byRoute.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {stats.apiUsage.byRoute.map((row) => (
                <li
                  key={row.route}
                  className="flex justify-between rounded-xl border border-surface-border px-4 py-2"
                >
                  <span className="font-mono text-muted">{row.route}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No API usage logged yet. Run generate/publish after schema-admin.sql.
            </p>
          )}
        </Section>

        <Section id="openai-cost" title="OpenAI Cost">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Calls" value={stats.openai.totalCalls} />
            <StatCard
              label="Tokens"
              value={stats.openai.totalTokens.toLocaleString("en-US")}
            />
            <StatCard
              label="Est. cost"
              value={usd(stats.openai.estimatedCostUsd)}
            />
            <StatCard
              label="Last 24h"
              value={usd(stats.openai.last24hCostUsd)}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Cost estimated from token usage (gpt-4o-mini rates by default).
          </p>
        </Section>

        <Section id="published" title="Published Websites">
          {stats.published.length === 0 ? (
            <p className="text-sm text-muted">No published websites yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-surface-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Site</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stats.published.map((site) => (
                    <tr key={site.id}>
                      <td className="px-4 py-3 font-medium">
                        {site.businessName}
                      </td>
                      <td className="px-4 py-3 text-muted">{site.userEmail}</td>
                      <td className="px-4 py-3">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-light hover:underline"
                        >
                          {site.url.replace(/^https?:\/\//, "")}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}
