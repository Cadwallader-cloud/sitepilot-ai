import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  splitLongSentence,
  splitLongSentencesInParagraph,
} from "./sentence-length";

function countWords(value: string): number {
  return value.replace(/[.!?]+$/, "").trim().split(/\s+/).filter(Boolean).length;
}

describe("sentence length post-processing", () => {
  it("leaves short sentences unchanged", () => {
    const input = "We help Austin homeowners fix storm damage fast.";
    assert.deepEqual(splitLongSentence(input), [input]);
  });

  it("splits on commas before hard-breaking", () => {
    const input =
      "We document every roof with photos before work starts, during the repair, and after cleanup so homeowners always know what changed on their property and feel confident about the scope before approving any work.";
    const parts = splitLongSentence(input, 25);
    assert.ok(parts.length >= 2);
    for (const part of parts) {
      assert.ok(countWords(part.replace(/[.!?]+$/, "")) <= 25, part);
    }
  });

  it("splits an entire paragraph into <=25-word sentences", () => {
    const paragraph =
      "This sentence keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer and the next steps they should take.";
    const out = splitLongSentencesInParagraph(paragraph, 25);
    const sentences = out.match(/[^.!?]+[.!?]+/g) ?? [];
    assert.ok(sentences.length >= 2);
    for (const sentence of sentences) {
      assert.ok(countWords(sentence) <= 25, sentence);
    }
  });
});
