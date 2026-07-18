import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAINS = ["crestis.app", "localhost", "127.0.0.1"];

function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();

  // slug.localhost:3000
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub && !sub.includes(".") ? sub : null;
  }

  for (const root of ROOT_DOMAINS) {
    if (hostname === root || hostname === `www.${root}`) return null;
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      // only single-level subdomains: slug.crestis.app
      if (sub && !sub.includes(".")) return sub;
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const subdomain = getSubdomain(host);

  if (!subdomain) return NextResponse.next();

  // Avoid rewriting app routes if somehow hit via subdomain
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/site/")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/site/${subdomain}` : `/site/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
