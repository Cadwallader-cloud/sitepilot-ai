/**
 * Section retry unit tests (no OpenAI)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateFAQ,
  validateHero,
  validateSEO,
  validateServices,
} from "../../validation/validate";
import {
  retry,
  retryHero,
  retryFAQ,
  retryServices,
  retrySEO,
} from "./index";

describe("src/lib/ai/retry", () => {
  it("await retry(generateHero, validateHero)", async () => {
    const generateHero = async () => ({
      headline: "Solid roofs done right",
      subheadline: "Local crew for repairs and replacements today.",
      primaryCTA: "Quote",
      trustBar: [] as string[],
    });
    const result = await retry(generateHero, validateHero, { module: "Hero" });
    assert.equal(result.success, true);
    assert.equal(result.attempts, 1);
    assert.equal(result.data?.headline, "Solid roofs done right");
  });

  it("await retry(generateServices, validateServices)", async () => {
    const generateServices = async () => ({
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
    const result = await retry(generateServices, validateServices, {
      module: "Services",
    });
    assert.equal(result.success, true);
    assert.equal(result.data?.items[0]?.title, "Repair");
  });

  it("await retry(generateFAQ, validateFAQ)", async () => {
    const generateFAQ = async () => ({
      items: Array.from({ length: 6 }, (_, i) => ({
        question: `Question ${i + 1}?`,
        answer: "Clear next steps for every job.",
        category: "Trust",
      })),
    });
    const result = await retry(generateFAQ, validateFAQ, { module: "FAQ" });
    assert.equal(result.success, true);
    assert.equal(result.data?.items.length, 6);
  });

  it("await retry(generateSEO, validateSEO)", async () => {
    const generateSEO = async () => ({
      title: "Apex Roofing",
      description: "Local roof repair",
      keywords: ["roof"],
      canonical: "/",
    });
    const result = await retry(generateSEO, validateSEO, { module: "SEO" });
    assert.equal(result.success, true);
    assert.equal(result.data?.title, "Apex Roofing");
  });

  it("retry() returns success when boolean validator passes", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return { value: calls };
      },
      (data) => data.value >= 1,
    );
    assert.equal(result.success, true);
    assert.equal(result.attempts, 1);
    assert.deepEqual(result.data, { value: 1 });
  });

  it("retry() Try #1→#2→#3 all FAIL → structured error", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        return calls;
      },
      () => false,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(result.success, false);
    assert.equal(result.attempts, 3);
    assert.equal(calls, 3);
    assert.deepEqual(result.error, {
      module: "Hero",
      attempts: 3,
      reason: "Validation failed",
    });
  });

  it("Hero FAIL → { module, attempts, reason: Headline too short }", async () => {
    const result = await retry(
      async () => ({ headline: "" }),
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(result.success, false);
    assert.equal(result.error?.module, "Hero");
    assert.equal(result.error?.attempts, 3);
    assert.equal(result.error?.reason, "Headline too short");
    assert.equal(result.logs.length, 3);
    assert.equal(result.logs[0]?.module, "Hero");
    assert.equal(result.logs[0]?.attempt, 1);
    assert.equal(result.logs[0]?.passed, false);
    assert.equal(result.logs[0]?.error, "Headline too short");
    assert.equal(typeof result.logs[0]?.duration, "number");
    assert.equal(typeof result.logs[0]?.tokens, "number");
    assert.equal(typeof result.logs[0]?.cost, "number");
  });

  it("logs Module/Attempt/Duration/Tokens/Cost/Passed/Error each try", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls += 1;
        if (calls < 2) return { headline: "" };
        return {
          headline: "Solid roofs done right",
          subheadline: "Local crew for repairs and replacements today.",
          primaryCTA: "Quote",
          trustBar: [],
        };
      },
      validateHero,
      { module: "Hero", maxAttempts: 3 },
    );
    assert.equal(result.success, true);
    assert.equal(result.logs.length, 2);
    assert.deepEqual(
      result.logs.map((l) => ({
        Module: l.module,
        Attempt: l.attempt,
        Passed: l.passed,
        Error: l.error,
      })),
      [
        {
          Module: "Hero",
          Attempt: 1,
          Passed: false,
          Error: "Headline too short",
        },
        { Module: "Hero", Attempt: 2, Passed: true, Error: null },
      ],
    );
  });

  it("retryHero returns success on first valid generate", async () => {
    const result = await retryHero(async () => ({
      headline: "Solid roofs done right",
      subheadline: "Local crew for repairs and replacements today.",
      primaryCTA: "Quote",
      trustBar: [],
    }));
    assert.equal(result.success, true);
    assert.equal(result.attempts, 1);
    assert.equal(result.data?.headline, "Solid roofs done right");
  });

  it("retryHero regenerates after Zod failure", async () => {
    let calls = 0;
    const result = await retryHero(async () => {
      calls += 1;
      if (calls === 1) return { headline: "" };
      return {
        headline: "Solid roofs done right",
        subheadline: "Local crew for repairs and replacements today.",
        primaryCTA: "Quote",
        trustBar: [],
      };
    });
    assert.equal(result.success, true);
    assert.equal(calls, 2);
    assert.equal(result.attempts, 2);
  });

  it("Try #1→#2→#3 all FAIL → Return structured Error", async () => {
    let calls = 0;
    const result = await retryHero(async () => {
      calls += 1;
      return { headline: "" };
    });
    assert.equal(result.success, false);
    assert.equal(result.attempts, 3);
    assert.equal(calls, 3);
    assert.deepEqual(result.error, {
      module: "Hero",
      attempts: 3,
      reason: "Headline too short",
    });
  });

  it("retryFAQ requires exactly 6 items", async () => {
    const result = await retryFAQ(
      async () => [{ question: "Q?", answer: "A", category: "Trust" }],
      1,
    );
    assert.equal(result.success, false);
    assert.equal(result.attempts, 1);
    assert.equal(result.error?.module, "FAQ");
  });

  it("retryServices rejects empty title", async () => {
    const result = await retryServices(
      async () => [
        {
          title: "",
          description: "x",
          benefits: ["a", "b", "c"],
          icon: "wrench",
          featured: true,
        },
      ],
      1,
    );
    assert.equal(result.success, false);
    assert.equal(result.error?.module, "Services");
    assert.match(String(result.error?.reason), /Title/i);
  });

  it("retrySEO rejects empty title", async () => {
    const result = await retrySEO(
      async () => ({
        title: "",
        description: "d",
        keywords: [],
        canonical: "/",
      }),
      1,
    );
    assert.equal(result.success, false);
    assert.equal(result.error?.module, "SEO");
    assert.equal(result.error?.reason, "Title too short");
  });
});
