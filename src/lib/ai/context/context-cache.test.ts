import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BusinessDna } from "../../business-dna";
import { getIndustryPack } from "../../industries";
import type { PipelineContext } from "../orchestrator/context";
import { seedBranding, seedWebsiteShell } from "../orchestrator/context";
import { createContextCache } from "./context-cache";
import { buildContext } from "./builder";

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

describe("ContextCache", () => {
  it("reuses the same business reference across Hero, About, Services", () => {
    const cache = createContextCache(stubCtx());

    const hero = cache.hero;
    const about = cache.about;
    const services = cache.services;

    assert.equal(hero.business, cache.shared.business);
    assert.equal(about.business, cache.shared.business);
    assert.equal(services.business, cache.shared.business);
    assert.equal(hero.branding, cache.shared.branding);
    assert.equal(services.branding, cache.shared.branding);
  });

  it("memoizes shared on repeat access", () => {
    const cache = createContextCache(stubCtx());
    assert.equal(cache.shared, cache.shared);
  });

  it("memoizes section slices on repeat access", () => {
    const cache = createContextCache(stubCtx());
    assert.equal(cache.hero, cache.hero);
    assert.equal(cache.about, cache.about);
    assert.equal(cache.services, cache.services);
  });

  it("buildContext exposes cache with shared references", () => {
    const built = buildContext(stubCtx());

    assert.equal(built.cache.shared, built.shared);
    assert.equal(built.hero.business, built.shared.business);
    assert.equal(built.about.business, built.shared.business);
    assert.equal(built.services.business, built.shared.business);
  });

  it("fork creates a fresh cache for a new pipeline bag", () => {
    const ctx = stubCtx();
    const cache = createContextCache(ctx);
    const heroBefore = cache.hero;

    const next = {
      ...ctx,
      business: { ...ctx.business, name: "Renamed Roofing" },
    };
    const forked = cache.fork(next);

    assert.notEqual(forked.hero.business.name, heroBefore.business.name);
    assert.equal(forked.hero.business.name, "Renamed Roofing");
  });

  it("clear drops memoized slices", () => {
    const cache = createContextCache(stubCtx());
    const hero = cache.hero;
    cache.clear();
    assert.notEqual(cache.hero, hero);
    assert.deepEqual(cache.hero, hero);
  });
});
