import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BusinessDna } from "../../business-dna";
import { getIndustryPack } from "../../industries";
import type { PipelineContext } from "../orchestrator/context";
import { seedBranding, seedWebsiteShell } from "../orchestrator/context";
import { cloneForParallelStep } from "../orchestrator/merge-context";
import {
  buildPromptContextCache,
  ensurePromptCache,
  formatPromptContextBlock,
} from "./prompt-context-cache";

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
  advantages: ["Fast response"],
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
    services: ["Repair", "Replace"],
    dna,
  };
  const branding = {
    ...seedBranding(dna),
    tone: "Confident, steady energy",
  };
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
        services: "Repair, Replace",
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
      industryBrief: "Roofing pack brief",
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
        uniqueAngle: "Trusted local roofers",
        serviceFocus: ["Repair"],
        offerPromise: "Get a quote",
      },
      personalityBrief: "Voice: confident. Energy: steady.",
      copySeedBrief: "",
      events: [],
    },
  };
}

describe("prompt-context-cache", () => {
  it("builds all 7 fields from stub ctx", () => {
    const cache = buildPromptContextCache(stubCtx());

    assert.match(cache.business, /Apex Roofing \(Roofing\)/);
    assert.match(cache.brand, /confident/i);
    assert.equal(cache.location, "Austin, TX");
    assert.match(cache.tone, /Confident/i);
    assert.match(cache.audience, /Homeowners/);
    assert.match(cache.usp, /Trusted local roofers/);
    assert.match(cache.services, /Repair/);
    assert.equal(cache.dnaJson, JSON.stringify(dna, null, 2));
    assert.equal(cache.block, formatPromptContextBlock(cache));
    assert.match(cache.block, /Brand Profile:/);
  });

  it("ensurePromptCache memoizes — same reference on second call", () => {
    const ctx = stubCtx();
    const first = ensurePromptCache(ctx);
    const second = ensurePromptCache(first);

    assert.ok(first.meta.promptCache);
    assert.equal(first.meta.promptCache, second.meta.promptCache);
  });

  it("parallel clone shares same promptCache reference", () => {
    const ctx = ensurePromptCache(stubCtx());
    const fork = cloneForParallelStep(ctx);

    assert.ok(ctx.meta.promptCache);
    assert.equal(fork.meta.promptCache, ctx.meta.promptCache);
  });
});
