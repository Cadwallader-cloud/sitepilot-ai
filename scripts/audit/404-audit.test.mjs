import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_AUDIT_BASE_URL,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  isNotFound,
  isOkProtectedStatus,
  isOkPublicStatus,
  resolveAuditBaseUrl,
} from "./routes.mjs";

describe("404 audit routes", () => {
  it("includes the core public marketing and legal routes", () => {
    for (const path of [
      "/",
      "/create",
      "/login",
      "/privacy",
      "/terms",
      "/refund",
      "/demos",
    ]) {
      assert.equal(PUBLIC_ROUTES.includes(path), true, path);
    }
  });

  it("includes protected dashboard and admin routes", () => {
    assert.deepEqual(
      PROTECTED_ROUTES.map((route) => route.path),
      ["/dashboard", "/admin"],
    );
  });

  it("normalizes audit base URLs", () => {
    assert.equal(resolveAuditBaseUrl("https://crestis.app/"), "https://crestis.app");
    assert.equal(resolveAuditBaseUrl(undefined), DEFAULT_AUDIT_BASE_URL);
  });

  it("defines public and protected success criteria", () => {
    assert.equal(isOkPublicStatus(200), true);
    assert.equal(isOkPublicStatus(404), false);

    assert.equal(isOkProtectedStatus(307), true);
    assert.equal(isOkProtectedStatus(200, { withAuth: true }), true);
    assert.equal(isOkProtectedStatus(403, { withAuth: true }), false);
    assert.equal(isNotFound(404), true);
  });
});
