import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  maxParagraphLines,
  paragraphLineCheckStatus,
  paragraphLineQaPenalty,
  reviewReadability,
} from "./reviewers/readability";
import type { ContentReviewInput } from "./types";

function baseInput(): ContentReviewInput {
  return {
    hero: {
      headline: "Roof repair in Austin",
      subheadline: "Fast help for leaks.",
      primaryCTA: "Get a quote",
      secondaryCTA: "",
    },
    about: {
      title: "About us",
      text: "Short block one.\n\nShort block two.",
      paragraphs: ["Short block one.", "Short block two."],
    },
    services: [{ title: "Repair", description: "We fix roofs quickly." }],
    faq: [{ question: "Cost?", answer: "Free estimates." }],
    cta: { headline: "Ready?", primaryCTA: "Book now", secondaryCTA: "" },
    location: "Austin, TX",
    category: "Roofing",
  };
}

describe("paragraph line tier penalties", () => {
  it("applies proportional QA penalties", () => {
    assert.equal(paragraphLineQaPenalty(4), 0);
    assert.equal(paragraphLineQaPenalty(5), 2);
    assert.equal(paragraphLineQaPenalty(6), 2);
    assert.equal(paragraphLineQaPenalty(7), 5);
    assert.equal(paragraphLineQaPenalty(8), 5);
    assert.equal(paragraphLineQaPenalty(9), 10);
  });

  it("passes at four lines or fewer", () => {
    const input = baseInput();
    input.about.paragraphs = [
      "Line one about Austin roofs.\nLine two with clear scope.\nLine three with photo reports.\nLine four with local trust.",
    ];
    assert.equal(maxParagraphLines(input), 4);
    assert.equal(paragraphLineCheckStatus(4), "pass");
    const review = reviewReadability(input);
    assert.equal(
      review.checks.find((c) => c.id === "paragraph_lines")?.status,
      "pass",
    );
  });

  it("warns at five to six lines", () => {
    const input = baseInput();
    input.about.paragraphs = [
      "Line one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive twentysix twentyseven twentyeight twentynine thirty thirtyone thirtytwo thirtythree thirtyfour thirtyfive thirtysix thirtyseven thirtyeight thirtynine forty fortyone fortytwo fortythree fortyfour fortyfive fortysix fortyseven fortyeight fortynine fifty fiftyone fiftytwo fiftythree fiftyfour fiftyfive fiftysix fiftyseven fiftyeight fiftynine sixty sixtyone.",
    ];
    const maxLines = maxParagraphLines(input);
    assert.ok(maxLines >= 5 && maxLines <= 6, `expected 5-6 lines, got ${maxLines}`);
    assert.equal(paragraphLineCheckStatus(maxLines), "warn");
    assert.equal(paragraphLineQaPenalty(maxLines), 2);
  });
});
