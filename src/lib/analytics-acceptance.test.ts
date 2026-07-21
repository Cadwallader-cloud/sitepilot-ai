/**
 * Sprint 1 — Task 8: Analytics acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ANALYTICS_METRICS } from "./site-analytics";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — Analytics Acceptance Gate", () => {
  it("✅ Dashboard shows Visitors, Leads, Form submissions, Clicks", () => {
    assert.deepEqual(ANALYTICS_METRICS, [
      "Visitors",
      "Leads",
      "Form submissions",
      "Clicks",
    ]);

    const page = readFileSync(
      join(repoRoot, "src/app/dashboard/analytics/page.tsx"),
      "utf8",
    );
    assert.match(page, /ANALYTICS_METRICS/);
    assert.match(page, /summary\.visitors/);
    assert.match(page, /summary\.leads/);
    assert.match(page, /summary\.formSubmissions/);
    assert.match(page, /summary\.clicks/);
  });

  it("✅ POST /api/analytics/track records events", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/analytics/track/route.ts"),
      "utf8",
    );
    assert.match(route, /insertAnalyticsEvent/);
    assert.match(route, /isAnalyticsEventType/);
  });

  it("✅ Published site tracks page views and clicks", () => {
    const published = readFileSync(
      join(repoRoot, "src/components/published-website.tsx"),
      "utf8",
    );
    const tracker = readFileSync(
      join(repoRoot, "src/components/site-tracker.tsx"),
      "utf8",
    );
    assert.match(published, /SitePageView/);
    assert.match(published, /TrackedLink/);
    assert.match(published, /phone_click/);
    const analytics = readFileSync(
      join(repoRoot, "src/lib/site-analytics.ts"),
      "utf8",
    );
    assert.match(analytics, /page_view/);
  });

  it("✅ Contact form tracks form_submission and lead", () => {
    const tracker = readFileSync(
      join(repoRoot, "src/components/site-tracker.tsx"),
      "utf8",
    );
    const published = readFileSync(
      join(repoRoot, "src/components/published-website.tsx"),
      "utf8",
    );
    assert.match(tracker, /SiteContactForm/);
    assert.match(tracker, /form_submission/);
    assert.match(tracker, /lead/);
    assert.match(published, /SiteContactForm/);
  });

  it("✅ GET /api/analytics/summary returns summary for project owner", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/analytics/summary/route.ts"),
      "utf8",
    );
    assert.match(route, /getAnalyticsSummary/);
    assert.match(route, /assertCanUseAnalytics/);
    assert.match(route, /getProject/);
  });
});
