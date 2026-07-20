import { requireAdmin } from "@/lib/admin";
import { publicSiteRootDomain } from "@/lib/slug";
import { ensureWildcardCrestisDomain } from "@/lib/vercel-domains";
import { NextResponse } from "next/server";

/**
 * Attach *.crestis.app to the Vercel project (subdomain publishing).
 * DNS still required: CNAME * → cname.vercel-dns.com
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const root = publicSiteRootDomain().replace(/:\d+$/, "");
  if (root === "localhost" || root.endsWith(".localhost")) {
    return NextResponse.json({
      ok: true,
      message: "Localhost — skip Vercel wildcard; use http://[slug].localhost:3000",
      dns: null,
    });
  }

  const result = await ensureWildcardCrestisDomain(root);
  return NextResponse.json({
    ...result,
    domain: `*.${root}`,
    dns: {
      type: "CNAME",
      host: "*",
      value: "cname.vercel-dns.com",
    },
  }, { status: result.ok ? 200 : 502 });
}
