import { auth } from "@/auth";
import { runQualityAudit } from "@/lib/quality-audit-ai";
import type { GeneratedSite } from "@/lib/site-types";
import { isWebsite, websiteToGeneratedSite } from "@/lib/website";
import { NextResponse } from "next/server";

function isGeneratedSite(value: unknown): value is GeneratedSite {
  if (!value || typeof value !== "object") return false;
  if (isWebsite(value)) return true;
  const s = value as Record<string, unknown>;
  const hasFlat =
    typeof s.businessName === "string" &&
    s.hero !== undefined &&
    s.about !== undefined &&
    s.seo !== undefined &&
    s.contact !== undefined &&
    s.images !== undefined;
  const hasNested =
    typeof s.business === "object" &&
    s.business !== null &&
    s.hero !== undefined &&
    s.seo !== undefined;
  return hasFlat || hasNested;
}

/**
 * POST /api/quality-audit
 * AI + rules self-critique of a generated website.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isGeneratedSite(body.site)) {
    return NextResponse.json({ error: "site is required" }, { status: 400 });
  }

  const location =
    (typeof body.location === "string" && body.location.trim()) ||
    (typeof body.input === "object" &&
    body.input &&
    typeof (body.input as { location?: string }).location === "string"
      ? (body.input as { location: string }).location.trim()
      : "") ||
    body.site.contact.address?.trim() ||
    "";

  if (!location) {
    return NextResponse.json(
      { error: "location is required for local checks" },
      { status: 400 },
    );
  }

  const services =
    typeof body.services === "string"
      ? body.services
      : typeof body.input === "object" &&
          body.input &&
          typeof (body.input as { services?: string }).services === "string"
        ? (body.input as { services: string }).services
        : "";

  try {
    const result = await runQualityAudit({
      site: websiteToGeneratedSite(body.site),
      location,
      services,
      userEmail: session.user.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("quality-audit failed:", error);
    return NextResponse.json(
      { error: "Quality audit failed" },
      { status: 500 },
    );
  }
}
