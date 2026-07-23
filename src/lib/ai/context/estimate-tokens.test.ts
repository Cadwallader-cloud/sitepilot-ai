import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateJsonTokens, estimateTokens, formatTokenEstimate } from "./estimate-tokens";
import { buildFAQContext, buildHeroContext, buildSEOContext } from "./index";
import type { PipelineContext } from "../orchestrator/context";
import { seedBranding, seedWebsiteShell } from "../orchestrator/context";
import { getIndustryPack } from "../../industries";
import type { BusinessDna } from "../../business-dna";

const dna: BusinessDna = {
  industry: "Roofing",
  subcategory: "Repair",
  targetAudience: ["Homeowners"],
  customerIntent: "Fix leaks",
  brandPosition: "Local trusted roofers",
  brandPersonality: ["Reliable", "Clear", "Local", "Honest", "Fast"],
  tone: "Professional",
  primaryGoal: "Lead",
  secondaryGoal: "Trust",
  trustSignals: ["Licensed"],
  conversionStrategy: "Call",
  cta: "Get a quote",
  ctaOptions: ["Get a quote", "Call now"],
  websiteStyle: "modern",
  colorDirection: "navy",
  imageDirection: "real work",
  sections: ["hero", "about", "services", "faq"],
  seoIntent: "local",
  keywords: ["roof"],
  localSeo: ["Austin"],
  advantages: ["Local"],
};

function stubCtx(): PipelineContext {
  const business = {
    name: "Apex Roofing",
    category: "Roofing",
    subcategory: "Repair",
    location: "Austin, TX",
    phone: "555-0100",
    email: "hi@apex.test",
    description: "Local roof repair",
    services: ["Repair"],
    dna,
  };
  const branding = seedBranding(dna);
  const website = seedWebsiteShell({ runId: "test-run", business, branding });
  const pack = getIndustryPack("roofing");

  return {
    business,
    branding,
    website,
    logs: [],
    telemetry: [],
    meta: {
      input: {
        businessName: "Apex Roofing",
        category: "Roofing",
        location: "Austin, TX",
        services: "Repair",
        phone: "555-0100",
        email: "hi@apex.test",
        description: "Local roof repair",
      },
      options: {},
      runId: "test-run",
      category: "Roofing",
      tradeKey: "roofing",
      industryId: "roofing",
      industryPack: pack,
      industryBrief: "",
      tradeHint: "",
      dna,
      liveDna: dna,
      brief: {
        dna,
        industryId: "roofing",
        niche: "Repair",
        tradeHint: "",
        city: "Austin, TX",
        localeNote: "Serving Austin, TX",
        tone: "professional",
        customerPains: [],
        uniqueAngle: "Local",
        serviceFocus: ["Repair"],
        offerPromise: "Get a quote",
      },
      personalityBrief: "",
      copySeedBrief: "",
      events: [],
    },
  };
}

describe("estimateTokens", () => {
  it("formatTokenEstimate uses space-separated thousands", () => {
    assert.equal(formatTokenEstimate(950), "950");
    assert.equal(formatTokenEstimate(1250), "1 250");
    assert.equal(formatTokenEstimate(2800), "2 800");
  });

  it("estimateJsonTokens scales with serialized payload size", () => {
    const small = estimateJsonTokens({ a: "x" });
    const large = estimateJsonTokens({ a: "x".repeat(4000) });
    assert.ok(small > 0);
    assert.ok(large > small);
    assert.equal(large, Math.ceil(JSON.stringify({ a: "x".repeat(4000) }).length / 4));
  });

  it("estimateTokens returns positive section estimates", () => {
    const ctx = stubCtx();
    const estimates = estimateTokens(ctx);

    assert.ok(estimates.hero > 0);
    assert.ok(estimates.faq > 0);
    assert.ok(estimates.seo > 0);
    assert.equal(estimates.qa, null);
    assert.equal(
      estimates.total,
      estimates.hero +
        estimates.about +
        estimates.services +
        estimates.faq +
        estimates.seo,
    );
  });

  it("section contexts drive independent estimates", () => {
    const ctx = stubCtx();
    assert.equal(estimateJsonTokens(buildHeroContext(ctx)), estimateTokens(ctx).hero);
    assert.equal(estimateJsonTokens(buildFAQContext(ctx)), estimateTokens(ctx).faq);
    assert.equal(estimateJsonTokens(buildSEOContext(ctx)), estimateTokens(ctx).seo);
  });
});
