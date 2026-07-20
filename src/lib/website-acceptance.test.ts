/**
 * Acceptance criteria — JSON Validator stage
 *
 * ✅ Hero without headline → error
 * ✅ Hero without CTA → error
 * ✅ FAQ fewer than required → error
 * ✅ Services without title → error
 * ✅ SEO without title → error
 * ✅ Invalid JSON is not saved (gate throws before persistence)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAQ_REQUIRED_COUNT } from "./validation/faq";
import { checkWebsite, runJsonValidatorGate } from "./website-validator";
import { websiteFromFlat, type Website } from "./website";
import type { WebsiteJson } from "./website-json";

function sixFaqs(): WebsiteJson["faq"] {
  return Array.from({ length: FAQ_REQUIRED_COUNT }, (_, i) => ({
    question: `Question ${i + 1} for local customers?`,
    answer: "We explain the next steps clearly on every job.",
    category: ["Pricing", "Timeline", "Trust", "Process", "Location", "Service"][
      i
    ]!,
  }));
}

function sampleFlat(): WebsiteJson {
  return {
    business: {
      name: "Apex Roofing",
      location: "Austin, TX",
      category: "Roofing",
      description: "Local roof repair.",
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
      images: { hero: "https://example.com/h.jpg", gallery: [] },
    },
    seo: {
      title: "Apex Roofing",
      description: "Roof repair in Austin",
      keywords: ["roof"],
      canonical: "/",
      slug: "/",
    },
    hero: {
      headline: "Solid roofs done right",
      subheadline: "Local crew for repairs and replacements in Austin.",
      primaryCTA: "Quote",
      secondaryCTA: "Call",
      trustBar: ["Licensed"],
    },
    about: {
      title: "About",
      text: "We fix roofs for Austin homeowners.\n\nHonest pricing on every visit.",
      paragraphs: [
        "We fix roofs for Austin homeowners.",
        "Honest pricing on every visit.",
      ],
      highlights: ["Local crew", "Clear quotes", "Fast response"],
    },
    services: [
      {
        title: "Repair",
        description: "Leak fix",
        benefits: ["Fast response", "Photo report", "Warranty"],
        icon: "wrench",
        featured: true,
      },
    ],
    projects: [],
    faq: sixFaqs(),
    testimonials: [],
    contact: {
      phone: "+1 512 555 0100",
      email: "a@b.com",
      address: "Austin, TX",
    },
  };
}

function validSite(): Website {
  return websiteFromFlat(sampleFlat(), { id: "ac-1" });
}

function heroData(site: Website): Record<string, unknown> {
  const hero = site.pages[0].sections.find((s) => s.type === "hero");
  assert.ok(hero);
  return hero.data as Record<string, unknown>;
}

function servicesData(site: Website): { items: Array<Record<string, unknown>> } {
  const section = site.pages[0].sections.find((s) => s.type === "services");
  assert.ok(section);
  return section.data as { items: Array<Record<string, unknown>> };
}

function faqData(site: Website): { items: unknown[] } {
  const section = site.pages[0].sections.find((s) => s.type === "faq");
  assert.ok(section);
  return section.data as { items: unknown[] };
}

describe("Acceptance criteria — JSON Validator", () => {
  it("Hero without headline → error", () => {
    const site = validSite();
    const data = heroData(site);
    delete data.headline;
    const result = checkWebsite(site);
    assert.equal(result.ok, false);
  });

  it("Hero without CTA → error", () => {
    const site = validSite();
    const data = heroData(site);
    delete data.primaryCTA;
    const result = checkWebsite(site);
    assert.equal(result.ok, false);
  });

  it("FAQ fewer than required → error", () => {
    const site = validSite();
    const data = faqData(site);
    data.items = data.items.slice(0, 2);
    assert.ok(data.items.length < FAQ_REQUIRED_COUNT);
    const result = checkWebsite(site);
    assert.equal(result.ok, false);
  });

  it("Services without title → error", () => {
    const site = validSite();
    const data = servicesData(site);
    assert.ok(data.items[0]);
    data.items[0].title = "";
    const result = checkWebsite(site);
    assert.equal(result.ok, false);
  });

  it("SEO without title → error", () => {
    const site = validSite();
    site.seo.title = "";
    const result = checkWebsite(site);
    assert.equal(result.ok, false);
  });

  it("Invalid JSON is not saved — gate throws (no Supabase write)", () => {
    const site = validSite();
    site.seo.title = "";
    assert.throws(
      () => runJsonValidatorGate(site, { maxRetries: 1 }),
      /WEBSITE_VALIDATION_FAILED/,
    );
  });
});
