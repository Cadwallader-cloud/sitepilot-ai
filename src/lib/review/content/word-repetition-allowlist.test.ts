import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reviewUniqueness } from "./reviewers/uniqueness";
import {
  buildWordRepetitionAllowlist,
  detectOverusedWords,
  isAllowedRepetitionWord,
} from "./types";

describe("word repetition allowlist", () => {
  it("allows niche keywords, city, company, and service titles", () => {
    const input = {
      location: "Austin, TX",
      category: "Roofing",
      businessName: "Apex Roofing",
      hero: {
        headline: "Roof repair in Austin",
        subheadline: "Fast help.",
        primaryCTA: "Quote",
        secondaryCTA: "",
      },
      about: { title: "About", text: "Local roofers." },
      services: [
        { title: "Emergency leak patch", description: "Fast tarping." },
        { title: "Shingle replacement", description: "Match shingles." },
      ],
      faq: [{ question: "Cost?", answer: "Free estimate." }],
      contact: { phone: "1", email: "a@b.c", address: "Austin" },
    };

    const allowed = buildWordRepetitionAllowlist(input);
    for (const word of ["roof", "roofing", "repair", "austin", "apex", "shingle", "leak", "replacement"]) {
      assert.ok(isAllowedRepetitionWord(word, allowed), `expected ${word} to be allowed`);
    }
  });

  it("does not flag natural roofing vocabulary as overused", () => {
    const blob = [
      "Roof repair in Austin by Apex Roofing.",
      "Our roofing crew handles roof leaks, roof inspections, and roof replacement.",
      "Emergency roof repair with shingle replacement after storm damage.",
      "Austin homeowners trust our roof repair process from inspection to completion.",
    ].join(" ");

    const allowed = buildWordRepetitionAllowlist({
      location: "Austin, TX",
      category: "Roofing",
      businessName: "Apex Roofing",
      hero: {
        headline: "Roof repair",
        subheadline: "",
        primaryCTA: "Quote",
        secondaryCTA: "",
      },
      about: { title: "About", text: blob },
      services: [
        { title: "Roof repair", description: "Repair roofs." },
        { title: "Roof inspection", description: "Inspect roofs." },
      ],
      faq: [],
      contact: { phone: "1", email: "a@b.c", address: "Austin" },
    });

    const overused = detectOverusedWords(blob).filter(
      (word) => !isAllowedRepetitionWord(word, allowed),
    );
    assert.deepEqual(overused, []);
  });

  it("still flags non-SEO filler words that repeat excessively", () => {
    const input = {
      location: "Austin, TX",
      category: "Roofing",
      businessName: "Apex Roofing",
      hero: {
        headline: "Roof repair",
        subheadline: "",
        primaryCTA: "Quote",
        secondaryCTA: "",
      },
      about: {
        title: "About",
        text: "Absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely absolutely.",
      },
      services: [{ title: "Roof repair", description: "Repair." }],
      faq: [],
      contact: { phone: "1", email: "a@b.c", address: "Austin" },
    };

    const review = reviewUniqueness(input);
    const repetition = review.checks.find((c) => c.id === "word_repetition");
    assert.ok(repetition && repetition.status !== "pass");
  });
});
