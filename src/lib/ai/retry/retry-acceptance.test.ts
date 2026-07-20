/**
 * Acceptance criteria — section auto-retry
 *
 * ✅ Hero / About / Services / FAQ / SEO auto-regenerate on FAIL
 * ✅ Max 3 attempts
 * ✅ Errors are logged
 * ✅ Orchestrator: FAIL after retries → SectionRetryError / PipelineError (hard stop)
 * ✅ softRetryResult still available for non-pipeline callers
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SECTION_MAX_ATTEMPTS,
  retry,
  SectionRetryError,
  softRetryResult,
  unwrapRetryResult,
} from "./index";
import {
  validateAbout,
  validateFAQ,
  validateHero,
  validateSEO,
  validateServices,
} from "../../validation/validate";

const validHero = () => ({
  headline: "Solid roofs done right",
  subheadline: "Local crew for repairs and replacements today.",
  primaryCTA: "Quote",
  trustBar: [] as string[],
});

const validAbout = () => ({
  title: "About us",
  paragraphs: [
    "We serve local customers with clear work.",
    "Honest pricing on every visit.",
  ],
  highlights: ["Local", "Clear", "Reliable"],
});

const validServices = () => ({
  items: [
    {
      title: "Repair",
      description: "Leak fix",
      benefits: ["Fast", "Clear", "Local"],
      icon: "wrench",
      featured: true,
    },
  ],
});

const validFAQ = () => ({
  items: Array.from({ length: 6 }, (_, i) => ({
    question: `Question ${i + 1}?`,
    answer: "Clear next steps for every job.",
    category: "Trust",
  })),
});

const validSEO = () => ({
  title: "Apex Roofing",
  description: "Local roof repair",
  keywords: ["roof"],
  canonical: "/",
});

describe("Acceptance — section auto-retry", () => {
  it("Hero automatically regenerates after FAIL", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls === 1 ? { headline: "" } : validHero();
      },
      validateHero,
      { module: "Hero" },
    );
    assert.equal(result.success, true);
    assert.ok(calls >= 2, "Hero must regenerate after first FAIL");
  });

  it("About automatically regenerates after FAIL", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls === 1 ? { title: "" } : validAbout();
      },
      validateAbout,
      { module: "About" },
    );
    assert.equal(result.success, true);
    assert.ok(calls >= 2, "About must regenerate after first FAIL");
  });

  it("Services automatically regenerate after FAIL", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls === 1
          ? {
              items: [
                {
                  title: "",
                  description: "x",
                  benefits: ["a", "b", "c"],
                  icon: "wrench",
                  featured: true,
                },
              ],
            }
          : validServices();
      },
      validateServices,
      { module: "Services" },
    );
    assert.equal(result.success, true);
    assert.ok(calls >= 2, "Services must regenerate after first FAIL");
  });

  it("FAQ automatically regenerates after FAIL", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls === 1
          ? { items: [{ question: "Q?", answer: "A", category: "Trust" }] }
          : validFAQ();
      },
      validateFAQ,
      { module: "FAQ" },
    );
    assert.equal(result.success, true);
    assert.ok(calls >= 2, "FAQ must regenerate after first FAIL");
  });

  it("SEO automatically regenerates after FAIL", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls === 1 ? { title: "" } : validSEO();
      },
      validateSEO,
      { module: "SEO" },
    );
    assert.equal(result.success, true);
    assert.ok(calls >= 2, "SEO must regenerate after first FAIL");
  });

  it("Maximum 3 attempts", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return { headline: "" };
      },
      validateHero,
      { module: "Hero" },
    );
    assert.equal(result.success, false);
    assert.equal(calls, DEFAULT_SECTION_MAX_ATTEMPTS);
    assert.equal(result.attempts, 3);
    assert.equal(result.logs.length, 3);
  });

  it("Errors are logged on each failed attempt", async () => {
    const result = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(result.success, false);
    for (const row of result.logs) {
      assert.equal(row.module, "Hero");
      assert.equal(row.passed, false);
      assert.ok(row.error, "Error must be logged");
      assert.equal(typeof row.duration, "number");
      assert.equal(typeof row.tokens, "number");
      assert.equal(typeof row.cost, "number");
    }
    assert.deepEqual(result.error, {
      module: "Hero",
      attempts: 3,
      reason: "Headline too short",
    });
  });

  it("Hard fail after retries throws SectionRetryError (pipeline stop)", async () => {
    const failed = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(failed.success, false);
    assert.throws(() => unwrapRetryResult(failed), (err: unknown) => {
      assert.ok(err instanceof SectionRetryError);
      assert.equal(err.failure.module, "Hero");
      assert.equal(err.failure.attempts, 3);
      return true;
    });
  });

  it("softRetryResult still available for non-pipeline callers", async () => {
    const failed = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    const soft = softRetryResult(failed, validHero());
    assert.equal(soft.failed, true);
    assert.equal(soft.data.headline, validHero().headline);
  });
});
