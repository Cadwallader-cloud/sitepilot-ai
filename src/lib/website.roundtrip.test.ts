/**
 * Website Schema v2 — serialize / deserialize acceptance tests.
 * Run: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AgentOwnershipError,
  applyHeroDataPatch,
  applySeoPatch,
  assertAgentMayWrite,
} from "./website-ownership";
import {
  deserializeWebsite,
  isWebsite,
  serializeWebsite,
  type Website,
  websiteFromFlat,
} from "./website";
import type { WebsiteJson } from "./website-json";

function sampleFlat(): WebsiteJson {
  return {
    business: {
      name: "Apex Roofing",
      location: "Austin, TX",
      category: "Roofing",
      description: "Local roof repair and replacement.",
    },
    theme: {
      primary: "#1e3a5f",
      accent: "#2563eb",
      style: "professional",
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "Geist",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
      images: {
        hero: "https://example.com/hero.jpg",
        gallery: ["https://example.com/g1.jpg"],
      },
    },
    seo: {
      title: "Roof Repair in Austin | Apex Roofing",
      description: "Trusted local roofers in Austin.",
      keywords: ["roof repair", "austin"],
      slug: "/",
      canonical: "/",
      schema: {
        "@type": "RoofingContractor",
        name: "Apex Roofing",
        description: "Trusted local roofers in Austin.",
      },
      openGraph: {
        title: "Roof Repair in Austin | Apex Roofing",
        description: "Trusted local roofers in Austin.",
      },
      twitter: {
        title: "Roof Repair in Austin | Apex Roofing",
        description: "Trusted local roofers in Austin.",
      },
    },
    hero: {
      headline: "Storm-ready roofs done right",
      subheadline: "Licensed Austin crew for repairs and full replacements.",
      primaryCTA: "Get a free quote",
      secondaryCTA: "Call now",
      trustBar: ["Licensed", "Insured", "Free estimates"],
    },
    about: {
      title: "About Apex",
      text: "We fix roofs for Austin homeowners.\n\nHonest pricing, clean job sites.",
      paragraphs: [
        "We fix roofs for Austin homeowners.",
        "Honest pricing, clean job sites.",
      ],
      highlights: ["Local crew", "Clear quotes", "Storm response"],
    },
    services: [
      {
        title: "Roof Repair",
        description: "Leak fixes and storm damage.",
        benefits: ["Fast response", "Photo report", "Warranty"],
        icon: "wrench",
        featured: true,
      },
      {
        title: "Roof Replacement",
        description: "Full tear-off and install.",
        benefits: ["Material options", "Cleanup included", "Warranty"],
        icon: "home",
        featured: false,
      },
    ],
    projects: [{ title: "Project 1", image: "https://example.com/g1.jpg" }],
    faq: [
      {
        question: "Do you offer free inspections?",
        answer: "Yes — for most Austin homes.",
        category: "Process",
      },
      {
        question: "How long does a repair take?",
        answer: "Most repairs finish the same day after inspection.",
        category: "Timeline",
      },
      {
        question: "Are you licensed?",
        answer: "Ask for current credentials before booking.",
        category: "Trust",
      },
      {
        question: "What happens after I call?",
        answer: "We schedule a visit and outline clear next steps.",
        category: "Process",
      },
      {
        question: "Do you cover my neighborhood?",
        answer: "Tell us your address and we confirm coverage.",
        category: "Location",
      },
      {
        question: "What services do you offer?",
        answer: "We focus on repair and replacement work listed here.",
        category: "Service",
      },
    ],
    testimonials: [
      { name: "Sam", text: "Great work after the hail storm.", demo: true },
    ],
    cta: {
      headline: "Ready for a solid roof?",
      primaryCTA: "Book inspection",
      secondaryCTA: "Call now",
    },
    contact: {
      phone: "+1 512 555 0100",
      email: "hello@apex.example",
      address: "Austin, TX",
    },
    layout: {
      sections: [
        { id: "hero", label: "Home" },
        { id: "services", label: "Services" },
        { id: "about", label: "About" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
      ],
      strategy: {
        tone: "Direct",
        goal: "Leads",
        targetAudience: "Homeowners",
        positioning: "Local experts",
        trustSignals: ["Licensed"],
        ctaStrategy: "Quote first",
        colorDirection: "Dark Blue",
        template: "trade-bold",
        stickyCTA: true,
        floatingPhone: true,
      },
    },
  };
}

describe("Website schema serialize/deserialize", () => {
  it("websiteFromFlat produces a valid Website", () => {
    const site = websiteFromFlat(sampleFlat(), {
      engine: "simple",
      id: "test-run-1",
      status: "draft",
    });
    assert.equal(isWebsite(site), true);
    assert.equal(site.business.name, "Apex Roofing");
    assert.equal(site.metadata.status, "draft");
    assert.equal(typeof site.metadata.version, "number");
    assert.ok(site.pages.length >= 1);
    assert.equal(site.seo.canonical, "/");
    assert.equal(typeof site.theme.palette, "string");
    assert.equal(site.settings.analytics, true);
    assert.ok(site.crestis?.seoMemory);
  });

  it("JSON roundtrip preserves core fields", () => {
    const original = websiteFromFlat(sampleFlat(), {
      id: "roundtrip-1",
      projectId: "proj-1",
    });
    const json = serializeWebsite(original);
    assert.equal(typeof json, "string");
    assert.doesNotThrow(() => JSON.parse(json));

    const restored = deserializeWebsite(json);
    assert.equal(isWebsite(restored), true);
    assert.equal(restored.business.name, original.business.name);
    assert.equal(restored.business.category, original.business.category);
    assert.equal(restored.seo.title, original.seo.title);
    assert.equal(restored.seo.canonical, original.seo.canonical);
    assert.equal(restored.theme.font, original.theme.font);
    assert.equal(restored.navigation.logo, original.navigation.logo);
    assert.equal(restored.settings.lazyLoad, original.settings.lazyLoad);
    assert.equal(restored.pages[0]?.id, "home");

    const hero = restored.pages[0]?.sections.find((s) => s.type === "hero");
    assert.ok(hero);
    assert.equal(hero?.data?.headline, "Storm-ready roofs done right");
    assert.deepEqual(hero?.data?.trustBar, [
      "Licensed",
      "Insured",
      "Free estimates",
    ]);
  });

  it("deserializeWebsite accepts parsed objects", () => {
    const site = websiteFromFlat(sampleFlat());
    const parsed = JSON.parse(serializeWebsite(site)) as unknown;
    const restored = deserializeWebsite(parsed);
    assert.equal(restored.business.name, "Apex Roofing");
  });

  it("ownership: SEO agent may write seo, not business", () => {
    assert.doesNotThrow(() => assertAgentMayWrite("seo_generator", "seo"));
    assert.throws(
      () => assertAgentMayWrite("seo_generator", "business"),
      (err: unknown) => err instanceof AgentOwnershipError,
    );
  });

  it("ownership patches only touch allowed paths", () => {
    let site = websiteFromFlat(sampleFlat());
    const beforeBusiness = structuredClone(site.business);

    site = applySeoPatch(site, {
      ...site.seo,
      title: "New Title Only",
    });
    assert.equal(site.seo.title, "New Title Only");
    assert.deepEqual(site.business, beforeBusiness);

    site = applyHeroDataPatch(site, {
      headline: "Patched headline here",
      subheadline: "Patched subheadline with enough length.",
      primaryCTA: "Go",
      trustBar: ["A", "B"],
    });
    const hero = site.pages[0]?.sections.find((s) => s.type === "hero");
    assert.equal(hero?.data?.headline, "Patched headline here");
    assert.equal(site.seo.title, "New Title Only");
  });

  it("SEO fields are objects, not any-leaking untyped blobs", () => {
    const site = websiteFromFlat(sampleFlat());
    const check: Website["seo"] = site.seo;
    assert.ok(check.schema === null || typeof check.schema === "object");
    assert.ok(
      check.openGraph === null || typeof check.openGraph === "object",
    );
    assert.ok(check.twitter === null || typeof check.twitter === "object");
  });
});
