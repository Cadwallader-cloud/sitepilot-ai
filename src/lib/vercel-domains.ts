import type { DomainConnectionStatus } from "@/lib/domain-constants";
import { normalizeCustomDomain } from "@/lib/tenancy";

type VercelDomainResponse = {
  name?: string;
  verified?: boolean;
  verification?: { type: string; domain: string; value: string }[];
  error?: { code?: string; message?: string };
};

function vercelConfig() {
  const token = process.env.VERCEL_TOKEN?.trim();
  const projectId =
    process.env.VERCEL_PROJECT_ID?.trim() ||
    process.env.VERCEL_PROJECT_NAME?.trim() ||
    "sitepilot-ai";
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  return { token, projectId, teamId };
}

export function isVercelDomainsConfigured(): boolean {
  return Boolean(process.env.VERCEL_TOKEN?.trim());
}

function teamQuery(teamId?: string) {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

/**
 * Ensure wildcard *.crestis.app is on the Vercel project (subdomain publishing).
 * DNS still needs: CNAME * → cname.vercel-dns.com (or Vercel nameservers).
 */
export async function ensureWildcardCrestisDomain(
  rootDomain = "crestis.app",
): Promise<{ ok: boolean; message: string }> {
  const { token, projectId, teamId } = vercelConfig();
  if (!token) {
    return {
      ok: false,
      message: "VERCEL_TOKEN is not configured",
    };
  }

  const name = `*.${rootDomain.replace(/^www\./, "")}`;
  const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/domains${teamQuery(teamId)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const raw = (await res.json()) as VercelDomainResponse;
  if (
    res.ok ||
    raw.error?.code === "domain_already_in_use" ||
    raw.error?.message?.toLowerCase().includes("already")
  ) {
    return {
      ok: true,
      message: `${name} is attached to the Vercel project.`,
    };
  }

  return {
    ok: false,
    message: raw.error?.message || `Failed to attach ${name} (${res.status})`,
  };
}

/**
 * Stage 3 — attach www.<apex> (and optionally apex) to the Vercel project.
 */
export async function attachDomainToVercel(
  apexOrWww: string,
): Promise<{
  ok: boolean;
  domain: string;
  verified: boolean;
  message: string;
  raw?: VercelDomainResponse;
}> {
  const { token, projectId, teamId } = vercelConfig();
  const apex = normalizeCustomDomain(apexOrWww);
  const domain = `www.${apex}`;

  if (!token) {
    return {
      ok: false,
      domain,
      verified: false,
      message:
        "VERCEL_TOKEN is not configured — DNS may be OK, but hosting attach was skipped.",
    };
  }

  const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/domains${teamQuery(teamId)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: domain }),
  });

  const raw = (await res.json()) as VercelDomainResponse;

  // Already added is fine
  if (
    !res.ok &&
    (raw.error?.code === "domain_already_in_use" ||
      raw.error?.message?.toLowerCase().includes("already"))
  ) {
    const existing = await getVercelDomain(domain);
    return {
      ok: true,
      domain,
      verified: Boolean(existing?.verified),
      message: "Domain already attached to the Vercel project.",
      raw: existing ?? raw,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      domain,
      verified: false,
      message:
        raw.error?.message ||
        `Vercel Domains API error (${res.status}).`,
      raw,
    };
  }

  // If Vercel needs ownership verify, call verify endpoint
  if (raw.verified === false) {
    const verified = await verifyVercelDomain(domain);
    return {
      ok: verified.ok,
      domain,
      verified: verified.verified,
      message: verified.message,
      raw: verified.raw ?? raw,
    };
  }

  return {
    ok: true,
    domain,
    verified: Boolean(raw.verified),
    message: `Attached ${domain} to Vercel project.`,
    raw,
  };
}

async function verifyVercelDomain(domain: string): Promise<{
  ok: boolean;
  verified: boolean;
  message: string;
  raw?: VercelDomainResponse;
}> {
  const { token, projectId, teamId } = vercelConfig();
  if (!token) {
    return { ok: false, verified: false, message: "Missing VERCEL_TOKEN" };
  }

  const url = `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}/verify${teamQuery(teamId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw = (await res.json()) as VercelDomainResponse;

  if (!res.ok) {
    return {
      ok: false,
      verified: false,
      message: raw.error?.message || "Vercel domain verify failed.",
      raw,
    };
  }

  return {
    ok: true,
    verified: Boolean(raw.verified),
    message: raw.verified
      ? "Domain verified on Vercel."
      : "Domain attached; still completing Vercel verification.",
    raw,
  };
}

/**
 * Stage 4 — read domain + infer SSL provisioning from Vercel.
 */
export async function getVercelDomain(domain: string): Promise<
  (VercelDomainResponse & { sslStatus: DomainConnectionStatus }) | null
> {
  const { token, projectId, teamId } = vercelConfig();
  if (!token) return null;

  const url = `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}${teamQuery(teamId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const raw = (await res.json()) as VercelDomainResponse;
  const sslStatus: DomainConnectionStatus = raw.verified
    ? "ssl_active"
    : "ssl_pending";

  return { ...raw, sslStatus };
}

export async function getSslStatusForApex(
  apexOrWww: string,
): Promise<{
  status: DomainConnectionStatus;
  domain: string;
  message: string;
}> {
  const apex = normalizeCustomDomain(apexOrWww);
  const domain = `www.${apex}`;

  if (!isVercelDomainsConfigured()) {
    return {
      status: "dns_connected",
      domain,
      message:
        "DNS looks good. Add VERCEL_TOKEN to show SSL provisioning status.",
    };
  }

  const info = await getVercelDomain(domain);
  if (!info) {
    return {
      status: "vercel_pending",
      domain,
      message: "Domain not yet on the Vercel project — click Verify again.",
    };
  }

  if (info.sslStatus === "ssl_active") {
    return {
      status: "ssl_active",
      domain,
      message: `HTTPS is active on https://${domain}`,
    };
  }

  return {
    status: "ssl_pending",
    domain,
    message:
      "Domain is on Vercel. SSL certificate is provisioning (usually a few minutes).",
  };
}
