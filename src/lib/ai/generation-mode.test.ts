import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GENERATION_MODE_DEFAULT,
  profileForMode,
  resolveGenerationMode,
  resolveGenerationProfile,
} from "./generation-mode";

describe("GenerationMode", () => {
  it("defaults to balanced", () => {
    assert.equal(resolveGenerationMode(undefined), GENERATION_MODE_DEFAULT);
    assert.equal(resolveGenerationMode(""), GENERATION_MODE_DEFAULT);
    assert.equal(resolveGenerationMode("unknown"), GENERATION_MODE_DEFAULT);
  });

  it("resolves fast, balanced, premium", () => {
    assert.equal(resolveGenerationMode("fast"), "fast");
    assert.equal(resolveGenerationMode("Balanced"), "balanced");
    assert.equal(resolveGenerationMode(" PREMIUM "), "premium");
  });

  it("fast profile minimizes AI work", () => {
    const fast = profileForMode("fast");
    assert.equal(fast.maxSectionAttempts, 1);
    assert.equal(fast.skipContentReviewSelfHealing, true);
    assert.equal(fast.skipTestimonialsAndCta, true);
    assert.equal(fast.runBenchmarkScoring, false);
    assert.equal(fast.targetMaxMs, 30_000);
  });

  it("balanced profile keeps retries and healing", () => {
    const balanced = profileForMode("balanced");
    assert.equal(balanced.maxSectionAttempts, 3);
    assert.equal(balanced.skipContentReviewSelfHealing, false);
    assert.equal(balanced.runBenchmarkScoring, false);
  });

  it("premium profile enables benchmark scoring and more healing", () => {
    const premium = profileForMode("premium");
    assert.equal(premium.runBenchmarkScoring, true);
    assert.equal(premium.maxContentReviewHealingTasks, 4);
    assert.equal(premium.jsonValidatorMaxRetries, 2);
  });

  it("resolveGenerationProfile reads options.generationMode", () => {
    assert.equal(
      resolveGenerationProfile({ generationMode: "fast" }).mode,
      "fast",
    );
  });
});
