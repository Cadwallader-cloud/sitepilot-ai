import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reviewContent } from "./engine";
import {
  CONTENT_REVIEW_SELF_HEALING_SKIP_SCORE,
  planContentReviewHealingTasks,
  shouldRunContentReviewSelfHealing,
} from "./self-healing";
import type { ContentReviewInput } from "./types";

const weakInput: ContentReviewInput = {
  location: "Travis County, Austin, TX",
  hero: {
    headline: "Professional roofing services",
    subheadline: "",
    primaryCTA: "Contact us",
    secondaryCTA: "",
  },
  about: {
    title: "About",
    text: "We are committed to quality.",
    paragraphs: ["We are committed to quality."],
    highlights: [],
  },
  services: [
    {
      title: "Service",
      description: "Professional solutions for customers.",
      benefits: [],
    },
    {
      title: "Service 2",
      description: "Quality you can trust.",
      benefits: [],
    },
    {
      title: "Service 3",
      description: "Dedicated to excellence.",
      benefits: [],
    },
  ],
  faq: [
    { question: "FAQ 1?", answer: "Answer." },
    { question: "FAQ 2?", answer: "Answer." },
    { question: "FAQ 3?", answer: "Answer." },
  ],
  contact: {
    phone: "+1 512 555 0100",
    email: "hello@example.com",
    address: "Austin, TX",
  },
};

describe("Content Review self-healing gate", () => {
  it("skips healing when overall score >= 95", () => {
    const base = reviewContent(weakInput);
    const strong = {
      ...base,
      final: { ...base.final, score: 96 },
    };
    assert.equal(shouldRunContentReviewSelfHealing(strong), false);
  });

  it("skips healing when score < 95 but no critical fail checks", () => {
    const report = reviewContent(weakInput);
    const warnOnly = (section: (typeof report.sections)["hero"]) => ({
      ...section,
      checks: section.checks.map((check) => ({
        ...check,
        status: check.status === "fail" ? ("warn" as const) : check.status,
      })),
    });
    const gated = {
      ...report,
      final: { ...report.final, score: 90 },
      sections: {
        ...report.sections,
        hero: warnOnly(report.sections.hero),
        about: warnOnly(report.sections.about),
        services: warnOnly(report.sections.services),
        faq: warnOnly(report.sections.faq),
        cta: warnOnly(report.sections.cta),
      },
    };

    assert.equal(shouldRunContentReviewSelfHealing(gated), false);
    assert.equal(planContentReviewHealingTasks(gated).length, 0);
  });

  it("runs healing when score < 95 and a section has fail checks", () => {
    const weak = reviewContent(weakInput);
    assert.ok(weak.final.score < CONTENT_REVIEW_SELF_HEALING_SKIP_SCORE);
    assert.equal(shouldRunContentReviewSelfHealing(weak), true);
    assert.ok(planContentReviewHealingTasks(weak).length > 0);
  });
});
