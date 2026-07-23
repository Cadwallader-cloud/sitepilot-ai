import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditWebsiteWithRules } from "../../quality-audit";
import {
  ensureAboutMentionsCity,
  finalizeAboutCopy,
  normalizeAboutFromAi,
} from "./about";
import type { GeneratedSite } from "../../site-types";

describe("about city guarantee", () => {
  it("injects city when missing from about body", () => {
    const about = ensureAboutMentionsCity(
      {
        title: "Why Choose Us",
        text: "Our crew handles storm damage with photo reports and clear quotes.",
        paragraphs: [
          "Our crew handles storm damage with photo reports and clear quotes.",
          "People come back for straightforward communication and reliable workmanship.",
        ],
        highlights: ["Clear quotes", "Photo reports", "Local crew"],
      },
      "Berlin, Germany",
    );

    assert.match(about.text.toLowerCase(), /berlin/);
    assert.match(about.paragraphs[0]!.toLowerCase(), /berlin/);
  });

  it("uses Based in {city}, we when first paragraph starts with We", () => {
    const about = ensureAboutMentionsCity(
      {
        title: "About",
        text: "We help homeowners fix leaks fast.",
        paragraphs: ["We help homeowners fix leaks fast."],
        highlights: ["A", "B", "C"],
      },
      "Toronto, ON, Canada",
    );

    assert.match(about.paragraphs[0]!, /^Based in Toronto, we help/i);
  });

  it("leaves copy unchanged when city is already present", () => {
    const input = {
      title: "About",
      text: "We proudly serve homeowners across Berlin with dependable roofing help.",
      paragraphs: [
        "We proudly serve homeowners across Berlin with dependable roofing help.",
      ],
      highlights: ["A", "B", "C"],
    };
    const about = ensureAboutMentionsCity(input, "Berlin, Germany");
    assert.equal(about.text, input.text);
  });

  it("normalizeAboutFromAi applies city guarantee from location", () => {
    const about = normalizeAboutFromAi(
      {
        title: "About",
        paragraphs: [
          "Our team documents every roof with photos before and after the work.",
          "Customers get a written scope and a clear quote before work begins.",
        ],
      },
      "About Us",
      { location: "Manchester, UK" },
    );

    assert.match(about.text.toLowerCase(), /manchester/);
  });

  it("finalizeAboutCopy splits sentences longer than 25 words", () => {
    const long =
      "This sentence keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer and the next steps they should take.";
    const about = finalizeAboutCopy(
      {
        title: "About",
        text: long,
        paragraphs: [long],
        highlights: ["A", "B", "C"],
      },
      "Austin, TX",
    );

    const sentences = about.paragraphs[0]!.match(/[^.!?]+[.!?]+/g) ?? [];
    assert.ok(sentences.length >= 2);
    for (const sentence of sentences) {
      assert.ok(
        sentence.trim().split(/\s+/).filter(Boolean).length <= 25,
        sentence,
      );
    }
  });

  it("passes QA about gate for city-less AI output after guarantee", () => {
    const site = {
      businessName: "North Star Roofing",
      theme: { primary: "#1e3a5f", accent: "#2563eb", style: "professional" },
      images: {
        hero: "https://example.com/hero.jpg",
        gallery: ["https://example.com/g1.jpg"],
      },
      hero: {
        headline: "Roof repair specialists",
        subheadline: "Fast help for leaks.",
        primaryCTA: "Get a quote",
        secondaryCTA: "",
      },
      about: ensureAboutMentionsCity(
        {
          title: "About",
          text: "Our crew handles storm damage with photo reports.",
          paragraphs: ["Our crew handles storm damage with photo reports."],
          highlights: ["A", "B", "C"],
        },
        "Toronto, ON, Canada",
      ),
      services: [{ title: "Repair", description: "Fix leaks." }],
      faq: [{ question: "Cost?", answer: "Free estimates." }],
      contact: { phone: "1", email: "a@b.c", address: "Toronto" },
      seo: { title: "Roofing", description: "Roof repair", keywords: [] },
      testimonials: [],
    } satisfies GeneratedSite;

    const audit = auditWebsiteWithRules(site, "Toronto, ON, Canada", {
      category: "Roofing",
    });
    const aboutCheck = audit.checks.find((c) => c.id === "about");
    assert.notEqual(aboutCheck?.status, "warn");
  });
});
