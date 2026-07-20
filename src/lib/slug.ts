const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "create",
  "demos",
  "projects",
  "dashboard",
  "publish",
  "upgrade",
  "site",
  "sites",
  "auth",
  "login",
  "signup",
  "analytics",
  "signin",
  "register",
  "cdn",
  "static",
  "assets",
  "mail",
  "ftp",
  "crestis",
]);

/** URL-safe slug from a business name */
export function toSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "site";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}

export function withSlugSuffix(base: string, suffix: string): string {
  const clean = suffix.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 6);
  const maxBase = Math.max(1, 48 - 1 - clean.length);
  return `${base.slice(0, maxBase)}-${clean}`;
}

/** Apex / root host used for tenant subdomains (no protocol, no www). */
export function publicSiteRootDomain(): string {
  const root =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").replace(
      /\/$/,
      "",
    ) || "crestis.app";
  return root.replace(/^www\./, "").split("/")[0] || "crestis.app";
}

/**
 * Public URL for a published site: https://[slug].crestis.app
 * (internal rendering still uses /site/[slug] via middleware rewrite)
 */
export function publicSiteUrl(slug: string): string {
  const clean = slug.toLowerCase().trim();
  const domain = publicSiteRootDomain();

  if (domain === "localhost" || domain.startsWith("localhost:")) {
    const port = domain.includes(":") ? domain.split(":")[1] : "3000";
    return `http://${clean}.localhost:${port}`;
  }

  if (domain.endsWith(".localhost")) {
    return `http://${clean}.${domain}`;
  }

  return `https://${clean}.${domain}`;
}
