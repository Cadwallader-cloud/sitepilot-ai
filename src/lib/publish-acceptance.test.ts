/**
 * Sprint 1 — Task 4: Publish acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { publicSiteUrl } from "./slug";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — Publish Acceptance Gate", () => {
  it("✅ Public URL is https://crestis.app/site/[slug]", () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://crestis.app";
    try {
      assert.equal(publicSiteUrl("apex-roofing-dallas"), "https://crestis.app/site/apex-roofing-dallas");
      assert.equal(publicSiteUrl("My Site"), "https://crestis.app/site/my-site");
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = prev;
    }
  });

  it("✅ POST /api/publish saves site and returns live url", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/publish/route.ts"),
      "utf8",
    );
    assert.match(route, /publishProject/);
    assert.match(route, /url: published\.url/);
    assert.match(route, /slug: published\.slug/);
  });

  it("✅ /site/[slug] renders published websites", () => {
    const page = readFileSync(
      join(repoRoot, "src/app/site/[slug]/page.tsx"),
      "utf8",
    );
    assert.match(page, /getPublishedSiteBySlug/);
    assert.match(page, /PublishedWebsite/);
  });

  it("✅ Publish sets published flag and published_at", () => {
    const publish = readFileSync(
      join(repoRoot, "src/lib/publish.ts"),
      "utf8",
    );
    assert.match(publish, /published: true/);
    assert.match(publish, /published_at/);
    assert.match(publish, /status: "published"/);
  });

  it("✅ App domain serves /site/[slug] without redirect", () => {
    const middleware = readFileSync(
      join(repoRoot, "src/middleware.ts"),
      "utf8",
    );
    assert.match(middleware, /Serve \/site\/\[slug\] on the app domain/);
    assert.match(middleware, /return NextResponse\.next\(\)/);
  });

  it("✅ Preview editor Publish shows live URL after success", () => {
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    const hook = readFileSync(
      join(repoRoot, "src/lib/use-publish-site.ts"),
      "utf8",
    );
    assert.match(builder, /PublishSuccessBanner/);
    assert.match(builder, /usePublishSite/);
    assert.match(hook, /\/api\/publish/);
    assert.match(builder, /liveUrl/);
  });
});
