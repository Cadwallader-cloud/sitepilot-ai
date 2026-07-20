import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { assertCanPublish } from "@/lib/billing";
import { getProject } from "@/lib/projects";
import { publishProject } from "@/lib/publish";
import type { GeneratedSite } from "@/lib/site-types";
import { logApiUsage } from "@/lib/usage";
import { isWebsite, websiteToGeneratedSite } from "@/lib/website";
import { isWebsiteJson, toGeneratedSite } from "@/lib/website-json";
import { NextResponse } from "next/server";

function parseSite(value: unknown): GeneratedSite | null {
  if (!value || typeof value !== "object") return null;
  if (isWebsite(value) || isWebsiteJson(value)) {
    return websiteToGeneratedSite(value);
  }
  const site = value as Partial<GeneratedSite>;
  if (
    site.hero &&
    site.about &&
    Array.isArray(site.services) &&
    site.contact &&
    site.seo &&
    site.theme &&
    site.images
  ) {
    return websiteToGeneratedSite(site as GeneratedSite);
  }
  return null;
}

/**
 * POST /api/publish
 * Saves site JSON to Supabase, assigns unique slug, sets published_at.
 * Supports republish (same project keeps slug, refreshes published_at).
 * Body may be { projectId } only — site is loaded from Supabase.
 */
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: {
    site?: unknown;
    projectId?: unknown;
    input?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId =
    typeof body.projectId === "string" && body.projectId.trim()
      ? body.projectId.trim()
      : null;

  let site: GeneratedSite | null = parseSite(body.site);
  let input =
    body.input && typeof body.input === "object"
      ? (body.input as BusinessFormInput)
      : null;
  if (projectId) {
    const existing = await getProject(projectId, email);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!site) site = existing.site;
    input = input ?? existing.input;
  }

  if (!site) {
    return NextResponse.json(
      { error: "site or projectId is required" },
      { status: 400 },
    );
  }

  const denied = await assertCanPublish(email);
  if (denied) {
    void logApiUsage({
      route: "/api/publish",
      userEmail: email,
      status: 402,
      meta: { upgradeRequired: true },
    });
    return denied;
  }

  try {
    const published = await publishProject({
      userEmail: email,
      site,
      input,
      projectId,
    });

    void logApiUsage({
      route: "/api/publish",
      userEmail: email,
      status: 200,
      meta: { projectId: published.id, slug: published.slug },
    });

    return NextResponse.json({
      ok: true,
      projectId: published.id,
      slug: published.slug,
      publishedAt: published.publishedAt,
      url: published.url,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PUBLISH_FAILED";
    if (code === "SUPABASE_NOT_CONFIGURED") {
      void logApiUsage({
        route: "/api/publish",
        userEmail: email,
        status: 503,
      });
      return NextResponse.json(
        { error: "Publishing is not configured", code },
        { status: 503 },
      );
    }
    if (code === "PROJECT_NOT_FOUND") {
      void logApiUsage({
        route: "/api/publish",
        userEmail: email,
        status: 404,
      });
      return NextResponse.json({ error: "Project not found", code }, { status: 404 });
    }
    console.error("Publish API error:", error);
    void logApiUsage({
      route: "/api/publish",
      userEmail: email,
      status: 500,
    });
    return NextResponse.json(
      { error: "Failed to publish website", code: "PUBLISH_FAILED" },
      { status: 500 },
    );
  }
}
