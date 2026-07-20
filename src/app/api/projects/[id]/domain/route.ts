import { auth } from "@/auth";
import { assertCanUseCustomDomain } from "@/lib/billing";
import {
  CUSTOM_DOMAIN_CNAME,
  DOMAIN_STATUS_LABELS,
  type DomainConnectionStatus,
} from "@/lib/domain-constants";
import { getProject } from "@/lib/projects";
import { setProjectCustomDomain } from "@/lib/publish";
import { normalizeCustomDomain } from "@/lib/tenancy";
import { getSslStatusForApex, isVercelDomainsConfigured } from "@/lib/vercel-domains";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireOwner(projectId: string) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  const project = await getProject(projectId, email);
  if (!project) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { email, project };
}

/** Stage 1 — GET domain state + DNS instructions (independently testable). */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const owner = await requireOwner(id);
  if ("error" in owner && owner.error) return owner.error;

  const domain = owner.project.custom_domain;
  let status: DomainConnectionStatus = domain ? "waiting_dns" : "none";
  let sslMessage: string | null = null;

  if (domain && isVercelDomainsConfigured()) {
    const ssl = await getSslStatusForApex(domain);
    status = ssl.status === "ssl_active" || ssl.status === "ssl_pending"
      ? ssl.status
      : "waiting_dns";
    sslMessage = ssl.message;
  }

  return NextResponse.json({
    ok: true,
    stage: 1,
    customDomain: domain,
    status,
    statusLabel: DOMAIN_STATUS_LABELS[status],
    dns: {
      step: 1,
      title: "Add this DNS record",
      record: CUSTOM_DOMAIN_CNAME,
      hint: domain
        ? `In your DNS provider for ${normalizeCustomDomain(domain)}, create:`
        : "After you connect a domain, add this record at your DNS provider:",
    },
    sslMessage,
    vercelConfigured: isVercelDomainsConfigured(),
  });
}

/** Stage 1 — Connect: save domain + return DNS instructions. */
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const owner = await requireOwner(id);
  if ("error" in owner && owner.error) return owner.error;

  let body: { customDomain?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body.customDomain;
  const customDomain =
    raw === null || raw === ""
      ? null
      : typeof raw === "string"
        ? normalizeCustomDomain(raw)
        : null;

  if (raw !== null && raw !== "" && typeof raw === "string") {
    if (
      !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
        customDomain ?? "",
      )
    ) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }
  }

  const isPublished =
    owner.project.published === true || Boolean(owner.project.published_at);
  if (!isPublished && customDomain) {
    return NextResponse.json(
      { error: "Publish the website before connecting a custom domain" },
      { status: 400 },
    );
  }

  if (customDomain) {
    const denied = await assertCanUseCustomDomain(owner.email);
    if (denied) return denied;
  }

  const ok = await setProjectCustomDomain({
    projectId: id,
    ownerEmail: owner.email,
    customDomain,
  });

  if (!ok) {
    return NextResponse.json(
      { error: "Could not update domain" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    stage: 1,
    customDomain,
    status: customDomain ? "waiting_dns" : "none",
    statusLabel: customDomain
      ? DOMAIN_STATUS_LABELS.waiting_dns
      : DOMAIN_STATUS_LABELS.none,
    dns: {
      step: 1,
      title: "Add this DNS record",
      record: CUSTOM_DOMAIN_CNAME,
      hint: customDomain
        ? `In your DNS provider for ${customDomain}, create:`
        : "Domain cleared.",
    },
  });
}
