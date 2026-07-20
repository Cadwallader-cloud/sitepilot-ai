import { isReservedSlug } from "@/lib/slug";

/** App hosts that serve Crestis itself (not tenant sites). */
const APP_HOSTS = new Set([
  "crestis.app",
  "www.crestis.app",
  "localhost",
  "127.0.0.1",
]);

const ROOT_DOMAINS = ["crestis.app", "localhost", "127.0.0.1"];

export function normalizeHostname(host: string): string {
  return host.split(":")[0].trim().toLowerCase().replace(/\.$/, "");
}

export function normalizeCustomDomain(domain: string): string {
  return normalizeHostname(domain).replace(/^www\./, "");
}

export function isAppHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (APP_HOSTS.has(host)) return true;
  // Vercel preview / project URLs
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * Returns slug for *.crestis.app / *.localhost, else null.
 * e.g. london-roofing.crestis.app → "london-roofing"
 */
export function getCrestisSubdomain(hostname: string): string | null {
  const host = normalizeHostname(hostname);

  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub && !sub.includes(".") ? sub : null;
  }

  for (const root of ROOT_DOMAINS) {
    if (host === root || host === `www.${root}`) return null;
    if (host.endsWith(`.${root}`)) {
      const sub = host.slice(0, -(root.length + 1));
      if (sub && !sub.includes(".")) return sub;
    }
  }

  return null;
}

export type TenantHostResolution =
  | { kind: "app" }
  | { kind: "slug"; slug: string }
  | { kind: "invalid_subdomain" }
  | { kind: "custom_domain"; domain: string };

/**
 * True when host is under a Crestis root (*.crestis.app / *.localhost)
 * but is not a valid single-label tenant slug.
 */
function isCrestisSubdomainHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (host.endsWith(".localhost") && host !== "localhost") return true;
  for (const root of ROOT_DOMAINS) {
    if (host !== root && host !== `www.${root}` && host.endsWith(`.${root}`)) {
      return true;
    }
  }
  return false;
}

/** Resolve how a Host header should be handled for multi-tenant routing. */
export function resolveTenantHost(hostHeader: string): TenantHostResolution {
  const hostname = normalizeHostname(hostHeader);

  if (isAppHostname(hostname)) {
    return { kind: "app" };
  }

  const slug = getCrestisSubdomain(hostname);
  if (slug) {
    if (isReservedSlug(slug)) {
      return { kind: "invalid_subdomain" };
    }
    return { kind: "slug", slug };
  }

  // foo.bar.crestis.app or other invalid *.crestis.app shapes → 404, not custom domain
  if (isCrestisSubdomainHost(hostname)) {
    return { kind: "invalid_subdomain" };
  }

  return {
    kind: "custom_domain",
    domain: normalizeCustomDomain(hostname),
  };
}
