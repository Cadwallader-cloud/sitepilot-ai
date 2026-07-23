#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_AUDIT_BASE_URL,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  isNotFound,
  isOkProtectedStatus,
  isOkPublicStatus,
  resolveAuditBaseUrl,
} from "./routes.mjs";

function parseArgs(argv) {
  let baseUrl = process.env.AUDIT_BASE_URL;
  let adminCookie = process.env.AUDIT_ADMIN_COOKIE ?? "";

  for (const arg of argv) {
    if (arg.startsWith("--base=")) {
      baseUrl = arg.slice("--base=".length);
    } else if (arg.startsWith("--admin-cookie=")) {
      adminCookie = arg.slice("--admin-cookie=".length);
    }
  }

  return {
    baseUrl: resolveAuditBaseUrl(baseUrl ?? DEFAULT_AUDIT_BASE_URL),
    adminCookie: adminCookie.trim(),
  };
}

async function fetchStatus(url, { cookie = "" } = {}) {
  const headers = {
    "User-Agent": "crestis-404-audit/1.0",
  };
  if (cookie) {
    headers.cookie = cookie;
  }

  const response = await fetch(url, {
    redirect: "manual",
    headers,
  });

  return {
    status: response.status,
    location: response.headers.get("location"),
  };
}

async function auditPublicRoute(baseUrl, path) {
  const url = `${baseUrl}${path === "/" ? "" : path}`;
  const { status, location } = await fetchStatus(url);
  const ok = isOkPublicStatus(status);

  return {
    path,
    url,
    status,
    location,
    ok,
    kind: "public",
    error: ok ? null : `Expected 200, got ${status}`,
  };
}

async function auditProtectedRoute(baseUrl, route, adminCookie) {
  const hasAuthCookie = adminCookie.length > 0;
  const url = `${baseUrl}${route.path}`;
  const { status, location } = await fetchStatus(url, {
    cookie: hasAuthCookie ? adminCookie : "",
  });
  const ok = !isNotFound(status) && isOkProtectedStatus(status, { withAuth: hasAuthCookie });

  let error = null;
  if (isNotFound(status)) {
    error = "Route returned 404";
  } else if (!ok) {
    error = hasAuthCookie
      ? `Expected 200 with auth cookie, got ${status}`
      : `Expected 200 or redirect to login, got ${status}`;
  }

  return {
    path: route.path,
    label: route.label,
    url,
    status,
    location,
    ok,
    kind: "protected",
    checkedWithAuth: hasAuthCookie,
    error,
  };
}

export async function run404Audit(options = {}) {
  const baseUrl = resolveAuditBaseUrl(options.baseUrl);
  const adminCookie = (options.adminCookie ?? "").trim();

  const publicResults = [];
  for (const path of PUBLIC_ROUTES) {
    publicResults.push(await auditPublicRoute(baseUrl, path));
  }

  const protectedResults = [];
  for (const route of PROTECTED_ROUTES) {
    protectedResults.push(
      await auditProtectedRoute(baseUrl, route, adminCookie),
    );
  }

  const results = [...publicResults, ...protectedResults];
  const failures = results.filter((result) => !result.ok);

  return {
    baseUrl,
    results,
    failures,
    ok: failures.length === 0,
  };
}

function printReport(report) {
  console.log(`404 audit — ${report.baseUrl}\n`);

  for (const result of report.results) {
    const prefix = result.ok ? "OK" : "FAIL";
    const suffix = result.location ? ` → ${result.location}` : "";
    const authNote = result.checkedWithAuth ? " (auth cookie)" : "";
    console.log(
      `[${prefix}] ${result.status} ${result.path}${authNote}${suffix}`,
    );
    if (result.error) {
      console.log(`       ${result.error}`);
    }
  }

  console.log("");
  if (report.ok) {
    console.log(`All ${report.results.length} routes passed.`);
  } else {
    console.log(`${report.failures.length} route(s) failed.`);
  }
}

async function main() {
  const { baseUrl, adminCookie } = parseArgs(process.argv.slice(2));
  const report = await run404Audit({ baseUrl, adminCookie });
  printReport(report);
  process.exit(report.ok ? 0 : 1);
}

if (
  path.resolve(process.argv[1] ?? "") ===
  path.resolve(fileURLToPath(import.meta.url))
) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
