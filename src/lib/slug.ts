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
  "site",
  "sites",
  "auth",
  "login",
  "signup",
  "analytics",
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

export function publicSiteUrl(slug: string): string {
  const root =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").replace(
      /\/$/,
      "",
    ) || "crestis.app";
  // Prefer apex domain even if APP_URL includes www
  const domain = root.replace(/^www\./, "").split("/")[0] || "crestis.app";
  return `https://${slug}.${domain}`;
}
