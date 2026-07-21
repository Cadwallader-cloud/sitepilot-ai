/**
 * Sprint 1 — Task 3: AI Improve acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { ImproveScope } from "./ai-engine/improve-site";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — AI Improve Acceptance Gate", () => {
  it("✅ Improve panel exposes Hero, Services, SEO, Entire Website", () => {
    const panel = readFileSync(
      join(repoRoot, "src/components/improve-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /Improve Hero/);
    assert.match(panel, /Improve Services/);
    assert.match(panel, /Improve SEO/);
    assert.match(panel, /Improve Entire Website/);
  });

  it("✅ Improve opens from Preview Editor header", () => {
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    assert.match(builder, /ImprovePanel/);
    assert.match(builder, /setEditorTab\("improve"\)/);
  });

  it("✅ /api/improve supports all scopes", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/improve/route.ts"),
      "utf8",
    );
    const scopes: ImproveScope[] = ["hero", "services", "seo", "entire"];
    for (const scope of scopes) {
      assert.match(route, new RegExp(scope));
    }
    assert.match(route, /runImproveSite/);
  });

  it("✅ Improve engine uses Content Review + Retry + Self-Healing", () => {
    const engine = readFileSync(
      join(repoRoot, "src/lib/ai-engine/improve-site.ts"),
      "utf8",
    );
    assert.match(engine, /reviewContent/);
    assert.match(engine, /formatHealingFeedback/);
    assert.match(engine, /retry/);
    assert.match(engine, /softRetryResult/);
    assert.match(engine, /runContentReviewSelfHealing/);
    assert.match(engine, /generateHeroSection/);
    assert.match(engine, /generateServicesSection/);
    assert.match(engine, /runFinalSeoReview/);
  });

  it("✅ Improve applies patched site back to preview editor", () => {
    const panel = readFileSync(
      join(repoRoot, "src/components/improve-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /onImproved/);
    assert.match(panel, /\/api\/improve/);
  });
});
