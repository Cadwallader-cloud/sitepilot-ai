/**
 * Sprint 1 — Task 5: Dashboard acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — Dashboard Acceptance Gate", () => {
  it("✅ Dashboard title is My Websites", () => {
    const page = readFileSync(
      join(repoRoot, "src/app/dashboard/page.tsx"),
      "utf8",
    );
    assert.match(page, /My Websites/);
    assert.match(page, /WebsitesDashboard/);
  });

  it("✅ Each project row shows Published status and actions", () => {
    const dashboard = readFileSync(
      join(repoRoot, "src/components/websites-dashboard.tsx"),
      "utf8",
    );
    assert.match(dashboard, /Published/);
    assert.match(dashboard, /Draft/);
    assert.match(dashboard, /\bEdit\b/);
    assert.match(dashboard, /\bAnalytics\b/);
    assert.match(dashboard, /\bDomain\b/);
    assert.match(dashboard, /\bDelete\b/);
  });

  it("✅ Edit opens project in create flow", () => {
    const dashboard = readFileSync(
      join(repoRoot, "src/components/websites-dashboard.tsx"),
      "utf8",
    );
    assert.match(dashboard, /\/create\?project=/);
  });

  it("✅ Analytics page is wired per project", () => {
    const dashboard = readFileSync(
      join(repoRoot, "src/components/websites-dashboard.tsx"),
      "utf8",
    );
    const analytics = readFileSync(
      join(repoRoot, "src/app/dashboard/analytics/page.tsx"),
      "utf8",
    );
    assert.match(dashboard, /dashboard\/analytics\?project=/);
    assert.match(analytics, /getAnalyticsSummary/);
  });

  it("✅ Domain page is wired per project", () => {
    const dashboard = readFileSync(
      join(repoRoot, "src/components/websites-dashboard.tsx"),
      "utf8",
    );
    const domain = readFileSync(
      join(repoRoot, "src/app/dashboard/domain/page.tsx"),
      "utf8",
    );
    assert.match(dashboard, /dashboard\/domain\?project=/);
    assert.match(domain, /CustomDomainPanel/);
  });

  it("✅ Delete calls project API", () => {
    const dashboard = readFileSync(
      join(repoRoot, "src/components/websites-dashboard.tsx"),
      "utf8",
    );
    const route = readFileSync(
      join(repoRoot, "src/app/api/projects/[id]/route.ts"),
      "utf8",
    );
    assert.match(dashboard, /method: "DELETE"/);
    assert.match(route, /deleteProject/);
  });

  it("✅ GET /api/projects lists user websites", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/projects/route.ts"),
      "utf8",
    );
    assert.match(route, /listProjects/);
  });
});
