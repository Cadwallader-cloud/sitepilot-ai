/**
 * Context Manager + Builder — selector ownership round-trip
 *
 * buildHeroContext / buildAboutContext / … return strictly typed section views.
 * HeroContext is isolated: business, branding, planner, audience, location, goal only.
 * AboutContext is isolated: business, branding, hero, planner only.
 * ServicesContext is isolated: business, planner, branding only.
 * FAQContext is isolated: business, services, location, branding only.
 * SEOContext is isolated: business, hero, about, services, faq, planner only.
 * QAContext is isolated: website only — the single agent that sees everything.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EngineContext, WebsitePlan } from "../../ai-engine/types";
import type { AboutPipelineResult } from "../../ai-engine/about-pipeline";
import type { BusinessDna } from "../../business-dna";
import type { BrandPersonality } from "../../brand-personality";
import { getIndustryPack } from "../../industries";
import type { Hero } from "../../website";
import {
  ABOUT_CONTEXT_KEYS,
  applyHeroResult,
  assertQAReady,
  buildAboutContext,
  buildContext,
  buildFAQContext,
  buildHeroContext,
  buildQAContext,
  buildSEOContext,
  buildServicesContext,
  FAQ_CONTEXT_KEYS,
  HERO_CONTEXT_KEYS,
  QA_CONTEXT_KEYS,
  SERVICES_CONTEXT_KEYS,
  selectAbout,
  selectFAQ,
  selectHero,
  selectQA,
  selectSEO,
  selectServices,
  SEO_CONTEXT_KEYS,
} from "../context";
import type { PipelineContext } from "../orchestrator/context";
import { seedBranding, seedWebsiteShell } from "../orchestrator/context";

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
  const website = seedWebsiteShell({
    runId: "test-run",
    business,
    branding,
  });

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
        if (section.type === "services") {
          return {
            ...section,
            data: {
              items: [
                {
                  title: "Repair",
                  description: "SECRET SERVICE DESC",
                  benefits: ["Fast", "Clear", "Local"],
                  icon: "wrench",
                  featured: true,
                },
              ],
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
        if (section.type === "contact") {
          return {
            ...section,
            data: {
              phone: "555",
              email: "footer@test.com",
              address: "Footer address",
              form: true,
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

describe("Context Builder — build*Context", () => {
  it("buildHeroContext returns strictly typed HeroContext", () => {
    const ctx = stubCtx();
    const hero = buildHeroContext(ctx);
    assert.deepEqual(Object.keys(hero).sort(), [...HERO_CONTEXT_KEYS].sort());
    assert.deepEqual(hero, selectHero(ctx));
  });

  it("buildAboutContext returns strictly typed AboutContext", () => {
    const ctx = stubCtx();
    const about = buildAboutContext(ctx);
    assert.deepEqual(Object.keys(about).sort(), [...ABOUT_CONTEXT_KEYS].sort());
    assert.deepEqual(about, selectAbout(ctx));
  });

  it("buildServicesContext returns strictly typed ServicesContext", () => {
    const ctx = stubCtx();
    const services = buildServicesContext(ctx);
    assert.deepEqual(
      Object.keys(services).sort(),
      [...SERVICES_CONTEXT_KEYS].sort(),
    );
    assert.deepEqual(services, selectServices(ctx));
  });

  it("buildFAQContext returns strictly typed FAQContext", () => {
    const ctx = stubCtx();
    const faq = buildFAQContext(ctx);
    assert.deepEqual(Object.keys(faq).sort(), [...FAQ_CONTEXT_KEYS].sort());
    assert.deepEqual(faq, selectFAQ(ctx));
  });

  it("buildSEOContext returns strictly typed SEOContext", () => {
    const ctx = stubCtx();
    const seo = buildSEOContext(ctx);
    assert.deepEqual(Object.keys(seo).sort(), [...SEO_CONTEXT_KEYS].sort());
    assert.deepEqual(seo, selectSEO(ctx));
  });

  it("buildQAContext returns strictly typed QAContext", () => {
    const ctx = stubCtxQAReady();
    const qa = buildQAContext(ctx);
    assert.deepEqual(Object.keys(qa).sort(), [...QA_CONTEXT_KEYS].sort());
    assert.deepEqual(qa, selectQA(ctx));
  });

  it("buildContext slices match build*Context helpers", () => {
    const ctx = stubCtxQAReady();
    const built = buildContext(ctx);

    assert.deepEqual(built.hero, buildHeroContext(ctx));
    assert.deepEqual(built.about, buildAboutContext(ctx));
    assert.deepEqual(built.services, buildServicesContext(ctx));
    assert.deepEqual(built.faq, buildFAQContext(ctx));
    assert.deepEqual(built.seo, buildSEOContext(ctx));
    assert.deepEqual(built.qa(), buildQAContext(ctx));
  });
});

describe("Context Manager — selectors", () => {
  it("HeroContext exposes only business, branding, planner, audience, location, goal", () => {
    const ctx = stubCtx();
    const hero = selectHero(ctx);

    assert.deepEqual(Object.keys(hero).sort(), [...HERO_CONTEXT_KEYS].sort());

    assert.equal(hero.business.name, "Apex Roofing");
    assert.equal(hero.branding.tone, "Professional");
    assert.equal(hero.planner, undefined);
    assert.deepEqual(hero.audience, ["Homeowners"]);
    assert.equal(hero.location, "Austin, TX");
    assert.equal(hero.goal, "Lead");

    const leaked = JSON.stringify(hero);
    assert.doesNotMatch(leaked, /SECRET FAQ|SECRET SEO|Footer address|footer@test/i);
  });

  it("buildContext hero slice matches isolated HeroContext", () => {
    const ctx = stubCtx();
    const built = buildContext(ctx);
    assert.deepEqual(built.hero, selectHero(ctx));
  });

  it("AboutContext exposes only business, branding, hero, planner", () => {
    const ctx = stubCtx();
    const about = selectAbout(ctx);

    assert.deepEqual(Object.keys(about).sort(), [...ABOUT_CONTEXT_KEYS].sort());

    assert.equal(about.business.name, "Apex Roofing");
    assert.equal(about.branding.tone, "Professional");
    assert.equal(about.planner, undefined);
    assert.ok(about.hero);
    assert.equal(about.hero?.headline, "");

    const leaked = JSON.stringify(about);
    assert.doesNotMatch(
      leaked,
      /SECRET FAQ|SECRET SEO|SECRET ABOUT|Footer address|footer@test/i,
    );
  });

  it("buildContext about slice matches isolated AboutContext", () => {
    const ctx = stubCtx();
    const built = buildContext(ctx);
    assert.deepEqual(built.about, selectAbout(ctx));
  });

  it("ServicesContext exposes only business, planner, branding", () => {
    const ctx = stubCtx();
    const services = selectServices(ctx);

    assert.deepEqual(
      Object.keys(services).sort(),
      [...SERVICES_CONTEXT_KEYS].sort(),
    );

    assert.equal(services.business.name, "Apex Roofing");
    assert.equal(services.planner, undefined);
    assert.equal(services.branding.tone, "Professional");

    const leaked = JSON.stringify(services);
    assert.doesNotMatch(
      leaked,
      /SECRET FAQ|SECRET SEO|SECRET ABOUT|SECRET SERVICE|Footer address|footer@test/i,
    );
  });

  it("buildContext services slice matches isolated ServicesContext", () => {
    const ctx = stubCtx();
    const built = buildContext(ctx);
    assert.deepEqual(built.services, selectServices(ctx));
  });

  it("FAQContext exposes only business, services, location, branding", () => {
    const ctx = stubCtx();
    const faq = selectFAQ(ctx);

    assert.deepEqual(Object.keys(faq).sort(), [...FAQ_CONTEXT_KEYS].sort());

    assert.equal(faq.business.name, "Apex Roofing");
    assert.deepEqual(faq.services, ["Repair"]);
    assert.equal(faq.location, "Austin, TX");
    assert.equal(faq.branding.tone, "Professional");

    const leaked = JSON.stringify(faq);
    assert.doesNotMatch(
      leaked,
      /SECRET FAQ|SECRET SEO|SECRET ABOUT|SECRET SERVICE|Footer address|footer@test/i,
    );
  });

  it("buildContext faq slice matches isolated FAQContext", () => {
    const ctx = stubCtx();
    const built = buildContext(ctx);
    assert.deepEqual(built.faq, selectFAQ(ctx));
  });

  it("SEOContext exposes only business, hero, about, services, faq, planner", () => {
    const ctx = stubCtx();
    const seo = selectSEO(ctx);

    assert.deepEqual(Object.keys(seo).sort(), [...SEO_CONTEXT_KEYS].sort());

    assert.equal(seo.business.name, "Apex Roofing");
    assert.equal(seo.planner, undefined);
    assert.ok(seo.hero);
    assert.ok(seo.about);
    assert.equal(seo.about?.paragraphs[0], "SECRET ABOUT BODY");
    assert.equal(seo.services.length, 1);
    assert.equal(seo.services[0]?.title, "Repair");
    assert.equal(seo.faq.length, 1);
    assert.equal(seo.faq[0]?.question, "SECRET FAQ?");

    const leaked = JSON.stringify(seo);
    assert.doesNotMatch(leaked, /SECRET SEO TITLE|SECRET SEO DESC|footer@test/i);
  });

  it("buildContext seo slice matches isolated SEOContext", () => {
    const ctx = stubCtx();
    const built = buildContext(ctx);
    assert.deepEqual(built.seo, selectSEO(ctx));
  });

  it("QAContext exposes only website — full site view", () => {
    const ctx = stubCtxQAReady();
    const qa = selectQA(ctx);

    assert.deepEqual(Object.keys(qa).sort(), [...QA_CONTEXT_KEYS].sort());
    assert.equal(qa.website.seo?.title, "SECRET SEO TITLE");
    assert.equal(qa.website.business.name, "Apex Roofing");
    assert.equal(qa.website.branding.tone, "Professional");

    const home = qa.website.pages.find((p) => p.id === "home");
    assert.ok(home);
    assert.equal(
      (home!.sections.find((s) => s.type === "about")!.data as { paragraphs: string[] })
        .paragraphs[0],
      "SECRET ABOUT BODY",
    );
    assert.equal(
      (home!.sections.find((s) => s.type === "faq")!.data as { items: { question: string }[] })
        .items[0]?.question,
      "SECRET FAQ?",
    );
  });

  it("buildContext qa() matches isolated QAContext when prerequisites exist", () => {
    const ctx = stubCtxQAReady();
    const built = buildContext(ctx);
    assert.deepEqual(built.qa(), selectQA(ctx));
  });

  it("selectQA throws when QA prerequisites are missing", () => {
    const ctx = stubCtx();
    assert.throws(() => selectQA(ctx), /ORCHESTRATOR:qa requires content \+ seo \+ plan/);
    assert.throws(
      () => assertQAReady(ctx),
      /ORCHESTRATOR:qa requires content \+ seo \+ plan/,
    );
  });

  it("AboutContext hero field reflects hero step output only", () => {
    const ctx = stubCtx();
    const hero: Hero = {
      headline: "Hero for about context",
      subheadline: "Sub",
      primaryCTA: "Quote",
      trustBar: ["Licensed"],
    };

    const engineCtx = {
      input: ctx.meta.input,
      options: ctx.meta.options,
      runId: ctx.meta.runId,
    } satisfies EngineContext;

    const afterHero = applyHeroResult(ctx, {
      hero,
      heroInput: hero,
      engineCtx,
      agentCtx: {
        ctx: engineCtx,
        brief: ctx.meta.brief,
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
          ctaStyle: "",
          testimonialAngle: "",
        } satisfies WebsitePlan,
      },
      heroResult: {
        headlines: [hero.headline],
        selectedIndex: 0,
        selectedHeadline: hero.headline,
        reason: "test",
        original: hero.headline,
        improved: hero.headline,
        final: hero.headline,
        hero: {
          headline: hero.headline,
          subheadline: hero.subheadline,
          primaryCTA: hero.primaryCTA,
          secondaryCTA: "",
          trustBar: hero.trustBar,
        },
      },
    });

    const about = selectAbout(afterHero);
    assert.equal(about.hero?.headline, "Hero for about context");
    assert.deepEqual(Object.keys(about).sort(), [...ABOUT_CONTEXT_KEYS].sort());
  });

  it("applyHeroResult writes hero only — about/services stay intact", () => {
    const ctx = stubCtx();
    const beforeAbout = structuredClone(
      ctx.website.pages[0]!.sections.find((s) => s.type === "about")!.data,
    );
    const beforeServices = structuredClone(
      ctx.website.pages[0]!.sections.find((s) => s.type === "services")!.data,
    );

    const hero: Hero = {
      headline: "Solid roofs done right",
      subheadline: "Austin repairs with clear quotes.",
      primaryCTA: "Get a quote",
      trustBar: ["Licensed"],
    };

    const engineCtx = {
      input: ctx.meta.input,
      options: ctx.meta.options,
      runId: ctx.meta.runId,
    } satisfies EngineContext;
    const next = applyHeroResult(ctx, {
      hero,
      heroInput: hero,
      engineCtx,
      agentCtx: {
        ctx: engineCtx,
        brief: ctx.meta.brief,
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
          ctaStyle: "",
          testimonialAngle: "",
        } satisfies WebsitePlan,
      },
      heroResult: {
        headlines: [hero.headline],
        selectedIndex: 0,
        selectedHeadline: hero.headline,
        reason: "test",
        original: hero.headline,
        improved: hero.headline,
        final: hero.headline,
        hero: {
          headline: hero.headline,
          subheadline: hero.subheadline,
          primaryCTA: hero.primaryCTA,
          secondaryCTA: "",
          trustBar: hero.trustBar,
        },
      },
    });

    const heroData = next.website.pages[0]!.sections.find(
      (s) => s.type === "hero",
    )!.data as Hero;
    assert.equal(heroData.headline, hero.headline);

    assert.deepEqual(
      next.website.pages[0]!.sections.find((s) => s.type === "about")!.data,
      beforeAbout,
    );
    assert.deepEqual(
      next.website.pages[0]!.sections.find((s) => s.type === "services")!.data,
      beforeServices,
    );

    const view = selectHero(next);
    assert.deepEqual(Object.keys(view).sort(), [...HERO_CONTEXT_KEYS].sort());
  });

  it("keeps PipelineContext ownership keys", () => {
    const shape: Array<keyof PipelineContext> = [
      "business",
      "branding",
      "website",
      "logs",
      "meta",
    ];
    assert.deepEqual(shape, [
      "business",
      "branding",
      "website",
      "logs",
      "meta",
    ]);
  });
});
