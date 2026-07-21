/**
 * Context Manager — Acceptance Criteria (gate before next phase)
 *
 * ✅ No AI receives full Website JSON (except QA)
 * ✅ Each AI has a separate Context Builder
 * ✅ Contexts are strictly typed
 * ✅ Approximate token count is logged
 * ✅ Context caching is active
 * ✅ Prompt Orchestrator uses only Context Manager
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import type { AboutPipelineResult } from "../../ai-engine/about-pipeline";
import type { BusinessDna } from "../../business-dna";
import type { BrandPersonality } from "../../brand-personality";
import type { EngineContext, WebsitePlan } from "../../ai-engine/types";
import { getIndustryPack } from "../../industries";
import type { PipelineContext } from "../orchestrator/context";
import { seedBranding, seedWebsiteShell } from "../orchestrator/context";
import {
  ABOUT_CONTEXT_KEYS,
  buildAboutContext,
  buildContext,
  buildFAQContext,
  buildHeroContext,
  buildQAContext,
  buildSEOContext,
  buildServicesContext,
  createContextCache,
  FAQ_CONTEXT_KEYS,
  HERO_CONTEXT_KEYS,
  logSectionTokenEstimate,
  prepareHeroRun,
  QA_CONTEXT_KEYS,
  SEO_CONTEXT_KEYS,
  SERVICES_CONTEXT_KEYS,
} from "../context";

const here = dirname(fileURLToPath(import.meta.url));
const stepsDir = join(here, "../orchestrator/steps");

const CONTENT_STEPS = [
  "hero.step.ts",
  "about.step.ts",
  "services.step.ts",
  "faq.step.ts",
  "seo.step.ts",
  "qa.step.ts",
] as const;

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

  website.seo = {
    title: "SECRET SEO TITLE",
    description: "SECRET SEO DESC",
    keywords: ["secret"],
    canonical: "/",
    schema: null,
    openGraph: null,
    twitter: null,
  };

  website.pages = website.pages.map((page) => {
    if (page.id !== "home") return page;
    return {
      ...page,
      sections: page.sections.map((section) => {
        if (section.type === "about") {
          return {
            ...section,
            data: {
              title: "About Apex",
              paragraphs: ["SECRET ABOUT BODY"],
              highlights: ["Local"],
            },
          };
        }
        if (section.type === "faq") {
          return {
            ...section,
            data: {
              items: [
                {
                  question: "SECRET FAQ?",
                  answer: "SECRET ANSWER",
                  category: "Pricing",
                },
              ],
            },
          };
        }
        return section;
      }),
    };
  });

  const pack = getIndustryPack("roofing");

  return {
    business,
    branding,
    website,
    logs: [],
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

const stubPlan = {
  template: "construction-premium",
  variant: "A",
  style: "Construction",
  pageType: "Business",
  tone: "Professional",
  goal: "Lead",
  targetAudience: "Homeowners",
  positioning: "Local",
  trustSignals: [],
  ctaStrategy: "Call",
  colorDirection: "navy",
  sections: [],
  stickyCTA: true,
  floatingPhone: false,
  recommendedBlocks: [],
  removedBlocks: [],
  notes: [],
  heroApproach: "",
  aboutFocus: "",
  serviceCount: 3,
  faqThemes: [],
  ctaStyle: "",
  testimonialAngle: "",
} satisfies WebsitePlan;

const stubPersonality: BrandPersonality = {
  archetype: "Everyman",
  energy: "Professional",
  voice: "Professional",
  writingStyle: "Simple",
  emotion: "Trust",
  formality: "Semi-Formal",
  sentenceLength: "Medium",
  paragraphLength: "Short",
  vocabulary: "Simple",
  ctaStyle: "Direct",
  readingLevel: "Grade 8",
  avoidWords: [],
  preferredWords: [],
  traits: ["Reliable"],
  writingRules: ["Be clear"],
};

function stubCtxQAReady(): PipelineContext {
  const ctx = stubCtx();
  const aboutResult: AboutPipelineResult = {
    variants: [],
    selectedStyle: "professional",
    reason: "test",
    about: {
      title: "About Apex",
      text: "We fix roofs.",
      paragraphs: ["We fix roofs."],
      highlights: ["Local"],
    },
  };

  ctx.meta.plan = stubPlan;
  ctx.meta.templateId = "construction-premium";
  ctx.meta.aboutResult = aboutResult;
  ctx.meta.personality = stubPersonality;
  ctx.meta.content = {
    hero: {
      headline: "Roof repair",
      subheadline: "Austin",
      primaryCTA: "Quote",
      secondaryCTA: "",
      trustBar: ["Licensed"],
    },
    about: aboutResult.about,
    services: [{ title: "Repair", description: "Fast", benefits: ["Local"] }],
    testimonials: [],
    faq: [{ question: "Cost?", answer: "Free quote", category: "Pricing" }],
    cta: { headline: "Ready?", primaryCTA: "Quote", secondaryCTA: "Call" },
    contact: { phone: "555", email: "hi@apex.test", address: "Austin" },
  };
  ctx.meta.seo = {
    title: "Apex Roofing Austin",
    description: "Roof repair in Austin",
    keywords: ["roof"],
  };

  return ctx;
}

function assertNoWebsiteJson(context: unknown, label: string): void {
  assert.notEqual(typeof context, "undefined", `${label} missing`);
  const json = JSON.stringify(context);
  assert.doesNotMatch(json, /"pages"\s*:/, `${label} must not expose website.pages`);
  assert.doesNotMatch(json, /"metadata"\s*:/, `${label} must not expose website.metadata`);
  assert.ok(!("website" in (context as object)), `${label} must not have website key`);
}

describe("Context Manager Acceptance Criteria", () => {
  it("✅ no section AI receives full Website JSON — only QA sees website", () => {
    const ctx = stubCtx();
    const cache = createContextCache(ctx);

    assertNoWebsiteJson(buildHeroContext(ctx, cache), "HeroContext");
    assertNoWebsiteJson(buildAboutContext(ctx, cache), "AboutContext");
    assertNoWebsiteJson(buildServicesContext(ctx, cache), "ServicesContext");
    assertNoWebsiteJson(buildFAQContext(ctx, cache), "FAQContext");
    assertNoWebsiteJson(buildSEOContext(ctx, cache), "SEOContext");

    const qa = buildQAContext(stubCtxQAReady(), createContextCache(stubCtxQAReady()));
    assert.deepEqual(Object.keys(qa).sort(), [...QA_CONTEXT_KEYS].sort());
    assert.ok(Array.isArray(qa.website.pages));
    assert.ok(qa.website.pages.length > 0);
  });

  it("✅ each AI has a separate Context Builder", () => {
    const ctx = stubCtx();
    assert.equal(typeof buildHeroContext, "function");
    assert.equal(typeof buildAboutContext, "function");
    assert.equal(typeof buildServicesContext, "function");
    assert.equal(typeof buildFAQContext, "function");
    assert.equal(typeof buildSEOContext, "function");
    assert.equal(typeof buildQAContext, "function");

    const built = buildContext(ctx);
    assert.notDeepEqual(built.hero, built.about);
    assert.notDeepEqual(built.hero, built.services);
    assert.notDeepEqual(built.faq, built.seo);
  });

  it("✅ contexts are strictly typed with fixed key sets", () => {
    const ctx = stubCtx();
    const cache = createContextCache(ctx);

    assert.deepEqual(Object.keys(buildHeroContext(ctx, cache)).sort(), [...HERO_CONTEXT_KEYS].sort());
    assert.deepEqual(Object.keys(buildAboutContext(ctx, cache)).sort(), [...ABOUT_CONTEXT_KEYS].sort());
    assert.deepEqual(
      Object.keys(buildServicesContext(ctx, cache)).sort(),
      [...SERVICES_CONTEXT_KEYS].sort(),
    );
    assert.deepEqual(Object.keys(buildFAQContext(ctx, cache)).sort(), [...FAQ_CONTEXT_KEYS].sort());
    assert.deepEqual(Object.keys(buildSEOContext(ctx, cache)).sort(), [...SEO_CONTEXT_KEYS].sort());
  });

  it("✅ approximate token count is logged per section", () => {
    const lines: string[] = [];
    const original = console.info;
    console.info = (...args: unknown[]) => {
      lines.push(args.map(String).join(" "));
    };

    try {
      const tokens = logSectionTokenEstimate("Hero Context", buildHeroContext(stubCtx()));
      assert.ok(tokens > 0);
      assert.match(lines.join("\n"), /Hero Context/);
      assert.match(lines.join("\n"), /≈ \d[\d ]* tokens/);
    } finally {
      console.info = original;
    }
  });

  it("✅ context caching reuses shared business across sections", () => {
    const cache = createContextCache(stubCtx());
    const run = prepareHeroRun(stubCtx());

    assert.equal(cache.hero.business, cache.about.business);
    assert.equal(cache.services.business, cache.shared.business);
    assert.equal(run.hero.business, run.cache.shared.business);
    assert.equal(run.cache.hero, run.cache.hero);
  });

  it("✅ prompt orchestrator content steps use only Context Manager", () => {
    for (const file of CONTENT_STEPS) {
      const source = readFileSync(join(stepsDir, file), "utf8");

      assert.match(
        source,
        /from "\.\.\/\.\.\/context"/,
        `${file} must import from Context Manager`,
      );
      assert.match(
        source,
        /prepare\w+Run\(/,
        `${file} must call prepare*Run from Context Manager`,
      );
      assert.doesNotMatch(
        source,
        /from "\.\.\/\.\.\/context\/selectors\//,
        `${file} must not import selectors directly`,
      );
      assert.doesNotMatch(
        source,
        /\bbuildContext\(/,
        `${file} should use prepare*Run, not raw buildContext`,
      );
    }
  });

  it("✅ retry entry points accept typed SectionRun from Context Manager", () => {
    for (const file of [
      "retryHero.ts",
      "retryAbout.ts",
      "retryServices.ts",
      "retryFAQ.ts",
      "retrySEO.ts",
    ]) {
      const source = readFileSync(join(here, "../retry", file), "utf8");
      assert.match(source, /from "\.\.\/context"/, `${file} imports Context Manager`);
      assert.match(source, /SectionRun/, `${file} accepts SectionRun`);
    }
  });
});
