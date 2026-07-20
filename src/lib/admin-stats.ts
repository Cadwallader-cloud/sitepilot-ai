import { getPlan, LEGACY_PLAN_PRICES } from "@/lib/plans";
import { publicSiteUrl } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase";

export type AdminStats = {
  users: { email: string; projects: number; published: number }[];
  projects: {
    id: string;
    businessName: string;
    userEmail: string;
    status: "published" | "draft";
    plan: string | null;
    slug: string | null;
    url: string | null;
    updatedAt: string;
  }[];
  published: {
    id: string;
    businessName: string;
    userEmail: string;
    slug: string;
    url: string;
    publishedAt: string;
  }[];
  revenue: {
    totalCents: number;
    byPlan: { plan: string; count: number; cents: number }[];
    paidProjects: number;
  };
  apiUsage: {
    total: number;
    last24h: number;
    byRoute: { route: string; count: number }[];
  };
  openai: {
    totalCalls: number;
    totalTokens: number;
    estimatedCostUsd: number;
    last24hCostUsd: number;
  };
};

const empty: AdminStats = {
  users: [],
  projects: [],
  published: [],
  revenue: { totalCents: 0, byPlan: [], paidProjects: 0 },
  apiUsage: { total: 0, last24h: 0, byRoute: [] },
  openai: {
    totalCalls: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    last24hCostUsd: 0,
  },
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return empty;

  let projectRows: Record<string, unknown>[] = [];
  {
    const withPlan = await supabase
      .from("projects")
      .select(
        "id, user_email, business_name, slug, published_at, plan, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(500);

    if (!withPlan.error) {
      projectRows = (withPlan.data as Record<string, unknown>[]) ?? [];
    } else {
      const without = await supabase
        .from("projects")
        .select(
          "id, user_email, business_name, slug, published_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(500);
      if (without.error) {
        console.error("admin projects:", without.error.message);
      } else {
        projectRows = (without.data as Record<string, unknown>[]) ?? [];
      }
    }
  }

  const projects = projectRows.map((row) => {
    const slug = (row.slug as string | null) ?? null;
    const publishedAt = (row.published_at as string | null) ?? null;
    const status = publishedAt ? ("published" as const) : ("draft" as const);
    return {
      id: row.id as string,
      businessName: row.business_name as string,
      userEmail: row.user_email as string,
      status,
      plan: (row.plan as string | null) ?? null,
      slug,
      url: status === "published" && slug ? publicSiteUrl(slug) : null,
      updatedAt: row.updated_at as string,
    };
  });

  const published = projects
    .filter((p) => p.status === "published" && p.slug && p.url)
    .map((p) => ({
      id: p.id,
      businessName: p.businessName,
      userEmail: p.userEmail,
      slug: p.slug!,
      url: p.url!,
      publishedAt:
        (projectRows.find((r) => r.id === p.id)?.published_at as string) ||
        p.updatedAt,
    }));

  const byUser = new Map<string, { projects: number; published: number }>();
  for (const p of projects) {
    const cur = byUser.get(p.userEmail) ?? { projects: 0, published: 0 };
    cur.projects += 1;
    if (p.status === "published") cur.published += 1;
    byUser.set(p.userEmail, cur);
  }
  const users = [...byUser.entries()]
    .map(([email, counts]) => ({ email, ...counts }))
    .sort((a, b) => b.projects - a.projects);

  const planCounts = new Map<string, number>();
  for (const p of projects) {
    if (!p.plan) continue;
    planCounts.set(p.plan, (planCounts.get(p.plan) ?? 0) + 1);
  }
  const byPlan = [...planCounts.entries()].map(([plan, count]) => {
    const def = getPlan(plan);
    const cents =
      (def?.priceCents ?? LEGACY_PLAN_PRICES[plan] ?? 0) * count;
    return { plan, count, cents };
  });
  const revenue = {
    totalCents: byPlan.reduce((sum, row) => sum + row.cents, 0),
    byPlan,
    paidProjects: byPlan.reduce((sum, row) => sum + row.count, 0),
  };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let apiUsage = empty.apiUsage;
  {
    const all = await supabase
      .from("api_usage")
      .select("route, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (!all.error && all.data) {
      const rows = all.data as { route: string; created_at: string }[];
      const routeMap = new Map<string, number>();
      let last24h = 0;
      for (const row of rows) {
        routeMap.set(row.route, (routeMap.get(row.route) ?? 0) + 1);
        if (row.created_at >= since) last24h += 1;
      }
      apiUsage = {
        total: rows.length,
        last24h,
        byRoute: [...routeMap.entries()]
          .map(([route, count]) => ({ route, count }))
          .sort((a, b) => b.count - a.count),
      };
    }
  }

  let openai = empty.openai;
  {
    const all = await supabase
      .from("openai_usage")
      .select("total_tokens, estimated_cost_usd, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (!all.error && all.data) {
      const rows = all.data as {
        total_tokens: number;
        estimated_cost_usd: number | string;
        created_at: string;
      }[];
      let totalTokens = 0;
      let estimatedCostUsd = 0;
      let last24hCostUsd = 0;
      for (const row of rows) {
        totalTokens += Number(row.total_tokens) || 0;
        const cost = Number(row.estimated_cost_usd) || 0;
        estimatedCostUsd += cost;
        if (row.created_at >= since) last24hCostUsd += cost;
      }
      openai = {
        totalCalls: rows.length,
        totalTokens,
        estimatedCostUsd:
          Math.round(estimatedCostUsd * 1_000_000) / 1_000_000,
        last24hCostUsd:
          Math.round(last24hCostUsd * 1_000_000) / 1_000_000,
      };
    }
  }

  return {
    users,
    projects,
    published,
    revenue,
    apiUsage,
    openai,
  };
}
