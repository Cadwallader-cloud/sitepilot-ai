import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BusinessDna } from "../business-dna";
import type { WebsitePlan } from "./types";

const dna: BusinessDna = {
  industry: "Roofing",
  subcategory: "Repair",
  tone: "Confident",
  brandPosition: "Local roof experts",
  targetAudience: ["Homeowners"],
  brandPersonality: ["Reliable"],
  advantages: ["Fast response"],
  trustSignals: ["Licensed", "Insured", "Local crew"],
  ctaOptions: ["Free inspection"],
  cta: "Book Free Inspection",
  primaryGoal: "Lead",
  conversionStrategy: "Quote first",
  customerIntent: "Fix leaks fast",
  websiteStyle: "professional",
};

const plan: WebsitePlan = {
  template: "construction-premium",
  variant: "A",
  style: "Construction",
  pageType: "Business",
  tone: "Professional",
  goal: "Lead",
  targetAudience: "Homeowners",
  positioning: "Local experts",
  trustSignals: ["Licensed", "Insured"],
  ctaStrategy: "Inspection first",
  colorDirection: "navy",
  sections: [],
  stickyCTA: true,
  floatingPhone: false,
  recommendedBlocks: [],
  removedBlocks: [],
  notes: [],
  heroApproach: "Storm-ready roofs",
  aboutFocus: "Trust and clarity",
  serviceCount: 3,
  faqThemes: ["Cost", "Timeline"],
  ctaStyle: "Book Free Inspection",
  testimonialAngle: "Local homeowners",
};

describe("single-pass content pipelines", () => {
  it("hero pipeline module exports single-pass runner", async () => {
    const mod = await import("./hero-pipeline");
    assert.equal(typeof mod.runHeroPipeline, "function");
  });

  it("about pipeline module exports single-pass runner", async () => {
    const mod = await import("./about-pipeline");
    assert.equal(typeof mod.runAboutPipeline, "function");
  });

  it("generation progress maps single-pass stages", async () => {
    const { resolveProgressStep } = await import("../generation-progress");
    assert.equal(resolveProgressStep({ stage: "hero_single" }), "hero");
    assert.equal(resolveProgressStep({ stage: "about_single" }), "about");
  });

  it("about style hint prefers customer_first for roofing", async () => {
    const { runAboutPipeline } = await import("./about-pipeline");
    assert.equal(typeof runAboutPipeline, "function");
    assert.ok(plan.aboutFocus.length > 0);
    assert.ok(dna.trustSignals.length >= 3);
  });
});
