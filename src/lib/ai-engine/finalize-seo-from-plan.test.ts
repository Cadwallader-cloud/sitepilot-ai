import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { finalizeSeoFromPlan } from "./finalize-seo-from-plan";
import type { SeoPlan } from "./seo-planner";
import type { ContentDraft } from "./types";

const plan: SeoPlan = {
  primaryKeyword: "roof repair London",
  secondaryKeywords: ["gutter cleaning", "storm damage"],
  entities: ["RoofingContractor", "London"],
  searchIntent: "Local",
  titlePattern: "{Primary} in {City} | {Brand}",
  metaAngle: "Explain services in London",
  localSeoAngle: "Mention London naturally",
  schemaType: "RoofingContractor",
  slug: "/",
  internalLinkTargets: ["services", "about", "faq", "contact"],
  avoid: ["#1"],
  notes: ["Keep title human"],
};

const content: ContentDraft = {
  hero: {
    headline: "Protect Your London Home",
    subheadline:
      "Licensed crews handle roof repair, gutter cleaning and storm response across Greater London.",
    primaryCTA: "Get a quote",
    secondaryCTA: "Call",
    trustBar: [],
  },
  about: {
    title: "About",
    text: "Local roofing contractor.",
    paragraphs: ["Local roofing contractor."],
    highlights: [],
  },
  services: [
    { title: "Roof Repair", description: "Fix leaks", benefits: [], icon: "wrench" },
  ],
  testimonials: [],
  faq: [{ question: "Do you offer emergency repair?", answer: "Yes, same day." }],
  cta: { headline: "Ready?", primaryCTA: "Quote", secondaryCTA: "" },
  contact: {
    phone: "+44 20 7946 0101",
    email: "hello@example.com",
    address: "London",
  },
};

describe("finalizeSeoFromPlan", () => {
  it("builds title, description, and keywords without LLM", () => {
    const seo = finalizeSeoFromPlan(
      plan,
      {
        businessName: "Summit Roofing London",
        city: "London",
        niche: "roofing",
        heroSubheadline: content.hero.subheadline,
        aboutText: content.about.text,
        phone: content.contact.phone,
        email: content.contact.email,
        address: content.contact.address,
        serviceTitles: ["Roof Repair"],
      },
      content,
    );

    assert.match(seo.title, /London/i);
    assert.match(seo.title, /Summit Roofing London/);
    assert.ok(seo.description.length >= 40);
    assert.ok(seo.keywords.length >= 3);
    assert.equal(seo.canonical, "/");
  });
});
