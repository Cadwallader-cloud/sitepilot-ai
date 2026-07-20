import { auth } from "@/auth";
import {
  DOMAIN_STATUS_LABELS,
  type DomainConnectionStatus,
} from "@/lib/domain-constants";
import { verifyCustomDomainCname } from "@/lib/dns-verify";
import { getProject } from "@/lib/projects";
import {
  attachDomainToVercel,
  getSslStatusForApex,
  isVercelDomainsConfigured,
} from "@/lib/vercel-domains";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type VerifyBody = {
  /** Stop after this stage for independent testing (2 | 3 | 4). Default 4. */
  stopAtStage?: 2 | 3 | 4;
};

/**
 * Stages 2–4 (response.stage shows how far this request went):
 * 2) DNS CNAME check → Connected / Waiting for DNS
 * 3) Attach to Vercel when DNS OK
 * 4) SSL provisioning status
 *
 * Independently testable: POST { "stopAtStage": 2 } or 3.
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProject(id, email);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const domain = project.custom_domain;
  if (!domain) {
    return NextResponse.json(
      { error: "Connect a domain first (Stage 1)" },
      { status: 400 },
    );
  }

  let stopAtStage: 2 | 3 | 4 = 4;
  try {
    const body = (await request.json()) as VerifyBody;
    if (body.stopAtStage === 2 || body.stopAtStage === 3 || body.stopAtStage === 4) {
      stopAtStage = body.stopAtStage;
    }
  } catch {
    // empty body → run through stage 4
  }

  // —— Stage 2: DNS ——
  const dns = await verifyCustomDomainCname(domain);

  if (!dns.ok) {
    return NextResponse.json({
      ok: false,
      stage: 2,
      dns,
      status: "waiting_dns" satisfies DomainConnectionStatus,
      statusLabel: DOMAIN_STATUS_LABELS.waiting_dns,
      vercel: null,
      ssl: null,
    });
  }

  if (stopAtStage === 2) {
    return NextResponse.json({
      ok: true,
      stage: 2,
      dns,
      status: "dns_connected" satisfies DomainConnectionStatus,
      statusLabel: DOMAIN_STATUS_LABELS.dns_connected,
      vercel: null,
      ssl: null,
    });
  }

  // —— Stage 3: Vercel attach ——
  let vercel: Awaited<ReturnType<typeof attachDomainToVercel>>;
  if (isVercelDomainsConfigured()) {
    vercel = await attachDomainToVercel(domain);
  } else {
    vercel = {
      ok: true,
      domain: `www.${domain}`,
      verified: false,
      message:
        "DNS Connected. Set VERCEL_TOKEN (+ VERCEL_PROJECT_ID) to auto-attach on Vercel.",
    };
  }

  if (stopAtStage === 3) {
    return NextResponse.json({
      ok: vercel.ok,
      stage: 3,
      dns,
      vercel,
      ssl: null,
      status: (vercel.ok
        ? vercel.verified
          ? "dns_connected"
          : "vercel_pending"
        : "error") satisfies DomainConnectionStatus,
      statusLabel: vercel.ok
        ? vercel.verified
          ? DOMAIN_STATUS_LABELS.dns_connected
          : DOMAIN_STATUS_LABELS.vercel_pending
        : DOMAIN_STATUS_LABELS.error,
    });
  }

  // —— Stage 4: SSL ——
  const ssl = await getSslStatusForApex(domain);

  let status: DomainConnectionStatus = "dns_connected";
  if (ssl.status === "ssl_active") status = "ssl_active";
  else if (ssl.status === "ssl_pending") status = "ssl_pending";
  else if (!vercel.ok) status = "error";
  else if (isVercelDomainsConfigured() && !vercel.verified) {
    status = "vercel_pending";
  }

  return NextResponse.json({
    ok: dns.ok && vercel.ok,
    stage: 4,
    dns,
    vercel,
    ssl,
    status,
    statusLabel: DOMAIN_STATUS_LABELS[status],
  });
}
