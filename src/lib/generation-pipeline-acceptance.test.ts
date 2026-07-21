/**
 * Sprint 1 — Task 1: AI Generation Pipeline acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  GENERATION_STEPS,
  applyGenerationEvent,
  initialGenerationSteps,
  resolveProgressStep,
} from "./generation-progress";
import { pipeline } from "./ai/orchestrator/pipeline";
import { retry, softRetryResult } from "./ai/retry/retry";
import { heroInputFallback } from "./ai/retry/section-fallbacks";
import { validateHero } from "./validation/validate";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("Sprint 1 — AI Generation Pipeline Acceptance Gate", () => {
  it("✅ One click Generate Website", () => {
    const form = readFileSync(
      join(repoRoot, "src/components/business-form.tsx"),
      "utf8",
    );
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    assert.match(form, /Generate Website/);
    assert.match(builder, /onSubmit=\{runGeneration\}/);
    assert.match(builder, /\/api\/generate/);
    assert.match(builder, /stream:\s*true/);
  });

  it("✅ Visible progress for each product stage", () => {
    const expected = [
      "business-form",
      "business",
      "brand",
      "planner",
      "template",
      "theme",
      "hero",
      "about",
      "services",
      "faq",
      "seo",
      "qa",
      "renderer",
      "preview",
    ];
    assert.deepEqual(
      GENERATION_STEPS.map((s) => s.id),
      expected,
    );

    let steps = initialGenerationSteps();
    steps = applyGenerationEvent(steps, { type: "generation:start" });
    assert.equal(steps["business-form"], "done");
    assert.equal(steps.business, "active");

    steps = applyGenerationEvent(steps, {
      type: "stage:progress",
      stage: "template_selector",
      label: "Template Selector",
    });
    assert.equal(steps.template, "active");

    steps = applyGenerationEvent(steps, {
      type: "step:success",
      step: "qa",
    });
    assert.equal(steps.qa, "done");
    assert.equal(steps.renderer, "active");

    assert.equal(
      resolveProgressStep({ stage: "theme_selector_ai", label: "Theme Selector" }),
      "theme",
    );
  });

  it("✅ Orchestrator runs product pipeline order", () => {
    assert.deepEqual(pipeline.map((s) => s.id), [
      "business",
      "brand",
      "planner",
      "hero",
      "about",
      "services",
      "faq",
      "seo",
      "qa",
    ]);
  });

  it("✅ Errors do not break pipeline — soft retry keeps fallback copy", async () => {
    const failed = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 2 },
    );
    assert.equal(failed.success, false);

    const resolved = softRetryResult(
      failed,
      heroInputFallback({
        businessName: "Apex Roofing",
        category: "Roofing",
        location: "Dallas",
        services: "Roof repair",
      }),
    );
    assert.equal(resolved.failed, true);
    assert.ok(resolved.data.headline.length >= 10);
    assert.ok(resolved.data.subheadline.length >= 20);
  });

  it("✅ Preview opens after completion", () => {
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    assert.match(builder, /generation:preview/);
    assert.match(builder, /scrollIntoView/);
    assert.match(builder, /SitePreview/);
    assert.match(builder, /previewRef/);
  });

  it("✅ SSE streams orchestrator and sub-stage progress", () => {
    const route = readFileSync(
      join(repoRoot, "src/app/api/generate/route.ts"),
      "utf8",
    );
    const engine = readFileSync(
      join(repoRoot, "src/lib/generate-site-ai.ts"),
      "utf8",
    );
    assert.match(route, /stage:progress/);
    assert.match(route, /onProgress/);
    assert.match(engine, /onProgress/);
  });
});
