import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimateOpenAiCostUsd,
  formatGenerationUsage,
  summarizePipelineUsage,
} from "./usage";

describe("usage", () => {
  it("estimates gpt-5-mini cost from input/output tokens", () => {
    const cost = estimateOpenAiCostUsd({
      model: "gpt-5-mini",
      promptTokens: 10_000,
      completionTokens: 2_000,
    });
    assert.equal(cost, 0.0065);
  });

  it("summarizes pipeline logs into generation usage", () => {
    const usage = summarizePipelineUsage([
      {
        step: "hero",
        duration: 21000,
        tokens: 1300,
        promptTokens: 900,
        completionTokens: 400,
        cost: 0.001,
        status: "success",
      },
      {
        step: "about",
        duration: 18000,
        tokens: 800,
        promptTokens: 550,
        completionTokens: 250,
        cost: 0.0006,
        status: "success",
      },
      {
        step: "seo",
        duration: 5000,
        tokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
        status: "error",
      },
    ]);

    assert.equal(usage.promptTokens, 1450);
    assert.equal(usage.completionTokens, 650);
    assert.equal(usage.totalTokens, 2100);
    assert.equal(usage.costUsd, 0.0016);
    assert.equal(usage.steps.length, 2);
  });

  it("formats usage for logs and batch output", () => {
    const label = formatGenerationUsage({
      promptTokens: 12345,
      completionTokens: 2345,
      totalTokens: 14690,
      costUsd: 0.0123,
      steps: [],
    });
    assert.match(label, /12,345 in/);
    assert.match(label, /2,345 out/);
    assert.match(label, /\$0\.0123/);
  });
});
