import {
  canUseAnalytics,
  canUseCustomDomain,
} from "@/lib/billing/permissions";
import type { PlanEntitlements, PlanId } from "@/lib/billing/types";
import { resolveTenantHost } from "@/lib/tenancy";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/** Legacy public path: /site/[slug](/...) — not /site/by-host/... */
const LEGACY_SITE_PATH = /^\/site\/(?!by-host(?:\/|$))([^/]+)(\/.*)?$/;

/**
 * Tenancy routing + premium feature gates (plan from JWT).
 * Uses getToken (not full auth()) to stay Edge-safe.
 * APIs still enforce permissions server-side against Supabase.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const resolution = resolveTenantHost(host);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (resolution.kind !== "app") {
    if (resolution.kind === "invalid_subdomain") {
      const url = request.nextUrl.clone();
      url.pathname = "/site/__not-found__";
      return NextResponse.rewrite(url);
    }

    const url = request.nextUrl.clone();

    if (resolution.kind === "slug") {
      const nested = pathname.match(LEGACY_SITE_PATH);
      if (nested) {
        const dest = request.nextUrl.clone();
        dest.pathname = nested[2] || "/";
        return NextResponse.redirect(dest, 308);
      }

      url.pathname =
        pathname === "/"
          ? `/site/${resolution.slug}`
          : `/site/${resolution.slug}${pathname}`;
      return NextResponse.rewrite(url);
    }

    const domain = encodeURIComponent(resolution.domain);
    url.pathname =
      pathname === "/"
        ? `/site/by-host/${domain}`
        : `/site/by-host/${domain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  const legacy = pathname.match(LEGACY_SITE_PATH);
  if (legacy) {
    // Serve /site/[slug] on the app domain — canonical public URL path.
    return NextResponse.next();
  }

  const needsPlanGate =
    pathname.startsWith("/dashboard/analytics") ||
    pathname.startsWith("/dashboard/domain");

  if (needsPlanGate) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    const isAdmin = Boolean(token?.isAdmin);
    const entitlements = token?.entitlements as PlanEntitlements | undefined;
    const planId = (token?.planId as PlanId | undefined) ?? "free";

    if (!isAdmin) {
      if (
        pathname.startsWith("/dashboard/analytics") &&
        !canUseAnalytics(entitlements ?? planId)
      ) {
        const dest = request.nextUrl.clone();
        dest.pathname = "/upgrade";
        const project = request.nextUrl.searchParams.get("project");
        dest.search = `?feature=analytics${project ? `&project=${project}` : ""}`;
        return NextResponse.redirect(dest);
      }

      if (
        pathname.startsWith("/dashboard/domain") &&
        !canUseCustomDomain(entitlements ?? planId)
      ) {
        const dest = request.nextUrl.clone();
        dest.pathname = "/upgrade";
        dest.search = "?feature=custom_domain";
        return NextResponse.redirect(dest);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
