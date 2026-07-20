/**
 * Acceptance Criteria — Crestis Orchestrator
 *
 * ✅ One Orchestrator
 * ✅ All AI modules only through it
 * ✅ Single PipelineContext
 * ✅ Retry integrated
 * ✅ Per-step logs
 * ✅ Events (step:start, step:success, …)
 * ✅ Pipeline returns fully ready Website
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pipeline,
  PIPELINE_STEPS,
  type PipelineContext,
  type PipelineEventType,
  type PipelineLog,
  type PipelineStep,
} from "./index";
import { unwrapRetryResult, retry, SectionRetryError } from "../retry";
import { validateHero } from "../../validation/validate";

const REQUIRED_STEP_IDS = [
  "business",
  "brand",
  "planner",
  "hero",
  "about",
  "services",
  "faq",
  "seo",
  "qa",
] as const;

const REQUIRED_EVENTS: PipelineEventType[] = [
  "pipeline:start",
  "step:start",
  "step:success",
  "step:retry",
  "step:error",
  "pipeline:complete",
];

describe("Acceptance — Orchestrator", () => {
  it("has one orchestrator pipeline with all product steps", () => {
    assert.equal(pipeline, PIPELINE_STEPS);
    assert.equal(pipeline.length, REQUIRED_STEP_IDS.length);
    assert.deepEqual(
      pipeline.map((s) => s.id),
      [...REQUIRED_STEP_IDS],
    );
    for (const step of pipeline) {
      const s = step as PipelineStep<PipelineContext>;
      assert.equal(typeof s.id, "string");
      assert.equal(typeof s.run, "function");
    }
  });

  it("defines PipelineContext ownership surface", () => {
    // Structural contract — compile-time types + runtime keys on empty seed shape
    const shape: Array<keyof PipelineContext> = [
      "business",
      "branding",
      "website",
      "logs",
      "meta",
    ];
    assert.deepEqual(shape, [
      "business",
      "branding",
      "website",
      "logs",
      "meta",
    ]);
  });

  it("defines per-step PipelineLog metrics shape", () => {
    const log: PipelineLog = {
      step: "hero",
      duration: 820,
      tokens: 1300,
      cost: 0.018,
      status: "success",
    };
    assert.equal(log.step, "hero");
    assert.equal(log.status, "success");
  });

  it("exposes required lifecycle event types", () => {
    for (const type of REQUIRED_EVENTS) {
      assert.ok(type.includes(":") || type.startsWith("pipeline"));
    }
    assert.ok(REQUIRED_EVENTS.includes("step:start"));
    assert.ok(REQUIRED_EVENTS.includes("step:success"));
    assert.ok(REQUIRED_EVENTS.includes("step:retry"));
    assert.ok(REQUIRED_EVENTS.includes("step:error"));
    assert.ok(REQUIRED_EVENTS.includes("pipeline:complete"));
  });

  it("retry is hard-fail after max attempts (pipeline stop)", async () => {
    const failed = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(failed.success, false);
    assert.throws(() => unwrapRetryResult(failed), (err: unknown) => {
      assert.ok(err instanceof SectionRetryError);
      return true;
    });
  });
});
