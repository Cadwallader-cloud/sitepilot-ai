import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PipelineContext } from "./context";
import {
  assembleContentDraftFromContext,
  mergeParallelContentResults,
} from "./merge-context";

function stubCtx(): PipelineContext {
  return {
    business: {
      name: "Austin Roof Co",
      category: "Roofing",
      subcategory: "",
      location: "Austin, TX",
      description: "Roof repairs in Austin.",
      services: ["Repair", "Replace"],
    },
    branding: { tone: "Pro", personality: [], colors: [], fonts: [], style: "modern" },
    website: {
      metadata: {
        id: "run-1",
        projectId: "",
        status: "draft",
        language: "en",
        createdAt: "",
        updatedAt: "",
      },
      business: {
        name: "Austin Roof Co",
        category: "Roofing",
        subcategory: "",
        location: "Austin, TX",
        description: "Roof repairs in Austin.",
        services: ["Repair", "Replace"],
      },
      branding: { tone: "Pro", personality: [], colors: [], fonts: [], style: "modern" },
      navigation: { logo: "Austin Roof Co", links: [], cta: "Quote" },
      pages: [
        {
          id: "home",
          slug: "/",
          title: "Home",
          sections: [
            {
              id: "hero",
              type: "hero",
              enabled: true,
              data: {
                headline: "Base hero",
                subheadline: "",
                primaryCTA: "Quote",
                secondaryCTA: "",
                trustBar: [],
              },
            },
            {
              id: "about",
              type: "about",
              enabled: true,
              data: { title: "About", paragraphs: ["Base about"], highlights: [] },
            },
            {
              id: "services",
              type: "services",
              enabled: true,
              data: { items: [] },
            },
            { id: "faq", type: "faq", enabled: true, data: { items: [] } },
          ],
        },
      ],
      seo: { title: "", description: "", keywords: [], canonical: "/" },
      theme: { id: "local-service-standard", blocks: [] },
      settings: {
        analytics: true,
        cookies: true,
        liveChat: false,
        animations: true,
        lazyLoad: true,
      },
    },
    logs: [],
    telemetry: [],
    meta: {
      input: {
        businessName: "Austin Roof Co",
        category: "Roofing",
        location: "Austin, TX",
        description: "Roof repairs in Austin.",
        services: "Repair, Replace",
        phone: "512-555-0100",
        email: "hello@example.com",
      },
      options: { runId: "run-1" },
      runId: "run-1",
      events: [],
      category: "Roofing",
      tradeKey: "roofing",
      industryId: "roofing",
      industryPack: {
        id: "roofing",
        label: "Roofing",
        preferredTemplate: "construction-premium",
        ctas: { primary: ["Get a quote"], secondary: ["Call now"] },
        heroRules: {
          headlinePattern: "",
          mustInclude: [],
          avoid: [],
          shellHint: "A",
        },
        siteStructure: { sections: [], stickyCTA: true, floatingPhone: false },
        sectionHints: { about: "" },
        textStyle: { voice: "Pro" },
        imageGuidance: { heroSubjects: [] },
      } as never,
      industryBrief: "",
      tradeHint: "",
      dna: {
        industry: "Roofing",
        subcategory: "",
        tone: "Pro",
        brandPosition: "",
        targetAudience: [],
        brandPersonality: [],
        advantages: [],
        trustSignals: [],
        ctaOptions: [],
        cta: "Quote",
        primaryGoal: "Lead",
        conversionStrategy: "",
        customerIntent: "",
        websiteStyle: "modern",
      },
      liveDna: {
        industry: "Roofing",
        subcategory: "",
        tone: "Pro",
        brandPosition: "",
        targetAudience: [],
        brandPersonality: [],
        advantages: [],
        trustSignals: [],
        ctaOptions: [],
        cta: "Quote",
        primaryGoal: "Lead",
        conversionStrategy: "",
        customerIntent: "",
        websiteStyle: "modern",
      },
      brief: {
        dna: {
          industry: "Roofing",
          subcategory: "",
          tone: "Pro",
          brandPosition: "",
          targetAudience: [],
          brandPersonality: [],
          advantages: [],
          trustSignals: [],
          ctaOptions: [],
          cta: "Quote",
          primaryGoal: "Lead",
          conversionStrategy: "",
          customerIntent: "",
          websiteStyle: "modern",
        },
        niche: "Roofing",
        tradeHint: "",
        city: "Austin, TX",
        localeNote: "",
        tone: "professional",
        customerPains: [],
        uniqueAngle: "",
        serviceFocus: ["Repair"],
        offerPromise: "",
      },
      personalityBrief: "",
      copySeedBrief: "",
      plan: {
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
        ctaStyle: "Get a quote",
        testimonialAngle: "",
      },
    },
  };
}

describe("merge-context", () => {
  it("merges parallel hero and about forks into one website", () => {
    const base = stubCtx();
    const heroFork = structuredClone(base);
    heroFork.website.pages[0]!.sections[0]!.data = {
      headline: "Parallel hero",
      subheadline: "Fast roofs",
      primaryCTA: "Book inspection",
      secondaryCTA: "",
      trustBar: ["Licensed"],
    };

    const aboutFork = structuredClone(base);
    aboutFork.website.pages[0]!.sections[1]!.data = {
      title: "Our story",
      paragraphs: ["We fix roofs in Austin."],
      highlights: ["Local", "Fast", "Clear quotes"],
    };

    const merged = mergeParallelContentResults(base, [
      {
        stepId: "hero",
        ctx: heroFork,
        log: {
          step: "hero",
          duration: 100,
          tokens: 10,
          promptTokens: 7,
          completionTokens: 3,
          cost: 0.001,
          status: "success",
        },
      },
      {
        stepId: "about",
        ctx: aboutFork,
        log: {
          step: "about",
          duration: 90,
          tokens: 8,
          promptTokens: 5,
          completionTokens: 3,
          cost: 0.001,
          status: "success",
        },
      },
    ]);

    const hero = merged.website.pages[0]!.sections.find((s) => s.type === "hero")
      ?.data as { headline: string };
    const about = merged.website.pages[0]!.sections.find((s) => s.type === "about")
      ?.data as { title: string };

    assert.equal(hero.headline, "Parallel hero");
    assert.equal(about.title, "Our story");
    assert.ok(merged.meta.content);
    assert.equal(merged.meta.content?.hero.headline, "Parallel hero");
    assert.equal(merged.logs.length, 2);
  });

  it("assembles content draft from merged website sections", () => {
    const ctx = stubCtx();
    const draft = assembleContentDraftFromContext(ctx);
    assert.equal(draft.hero.headline, "Base hero");
    assert.match(draft.about.text, /Base about/);
  });
});
