/** Routes that must return HTTP 200 for anonymous visitors. */
export const PUBLIC_ROUTES = [
  "/",
  "/create",
  "/login",
  "/privacy",
  "/terms",
  "/refund",
  "/demos",
];

/**
 * Routes that require auth for 200, but must never 404 for anonymous checks.
 * Accept redirect-to-login (307/308) or 200 when an admin session cookie is supplied.
 */
export const PROTECTED_ROUTES = [
  { path: "/dashboard", label: "Dashboard (auth required)" },
  { path: "/admin", label: "Admin (admin required)" },
];

export const DEFAULT_AUDIT_BASE_URL = "https://crestis.app";

export function resolveAuditBaseUrl(baseUrl = process.env.AUDIT_BASE_URL) {
  const raw = (baseUrl ?? DEFAULT_AUDIT_BASE_URL).trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function isOkPublicStatus(status) {
  return status === 200;
}

export function isOkProtectedStatus(status, { withAuth = false } = {}) {
  if (withAuth) return status === 200;
  return status === 200 || status === 307 || status === 308;
}

export function isNotFound(status) {
  return status === 404;
}
