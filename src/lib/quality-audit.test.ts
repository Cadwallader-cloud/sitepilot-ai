import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditWebsiteWithRules } from "./quality-audit";
import type { GeneratedSite } from "./site-types";

function strongSite(): GeneratedSite {
  return {
    businessName: "Apex Roofing",
    theme: { primary: "#1e3a5f", accent: "#2563eb", style: "professional" },
    images: {
      hero: "https://example.com/hero.jpg",
      gallery: ["https://example.com/g1.jpg", "https://example.com/g2.jpg"],
    },
    hero: {
      headline: "Storm-tough roof repair for Austin, TX homeowners",
      subheadline:
        "Licensed Austin crew for leaks, shingles, and emergency tarping across Travis County with photo reports after every visit.",
      primaryCTA: "Get a free roof inspection",
      secondaryCTA: "Call now",
      trustBar: ["Licensed & insured", "Same-week slots", "Photo report included"],
    },
    about: {
      title: "Local Austin roofers who show their work",
      text: [
        "Since 2012, our crew has completed 850+ roof repairs across Travis County with photo reports on every job.",
        "We help Austin homeowners fix storm damage without surprise pricing or vague timelines.",
        "Every visit starts with photos, a written scope, and a clear quote before work begins — licensed, insured, and trusted by neighbors.",
      ].join("\n\n"),
      paragraphs: [
        "Since 2012, our crew has completed 850+ roof repairs across Travis County with photo reports on every job.",
        "We help Austin homeowners fix storm damage without surprise pricing or vague timelines.",
        "Every visit starts with photos, a written scope, and a clear quote before work begins — licensed, insured, and trusted by neighbors.",
      ],
    },
    services: [
      {
        title: "Emergency leak patch",
        description: "Same-day tarping and leak isolation to stop interior damage fast.",
      },
      {
        title: "Shingle replacement",
        description: "Match existing shingles and replace damaged sections after hail or wind.",
      },
      {
        title: "Full roof replacement",
        description: "Complete tear-off and install with upgraded underlayment for Austin heat.",
      },
    ],
    faq: [
      {
        question: "How much does a roof inspection cost in Austin?",
        answer:
          "Inspections are free for most Austin homeowners and include photos plus a written scope before any work starts.",
      },
      {
        question: "Do you help with insurance claims after hail damage?",
        answer:
          "Yes. We document storm damage with photos and notes your adjuster can use during the claim review.",
      },
      {
        question: "How long does a shingle replacement usually take?",
        answer:
          "Most section replacements finish in one day, depending on roof size, access, and weather conditions.",
      },
    ],
    cta: {
      headline: "Ready for a clear roof plan in Austin?",
      primaryCTA: "Book inspection",
      secondaryCTA: "Call the crew",
    },
    contact: {
      phone: "+1 512 555 0100",
      email: "hello@apexroof.example",
      address: "Austin, TX",
    },
    seo: {
      title: "Apex Roofing Austin — Storm Repair & Replacement",
      description:
        "Licensed Austin roofers for leak repair, shingle replacement, and storm damage with photo reports and clear quotes.",
      keywords: ["roof repair Austin", "Austin roofing", "storm damage roof"],
    },
    testimonials: [],
  };
}

function weakSite(): GeneratedSite {
  return {
    businessName: "Generic Roofing",
    theme: { primary: "#1e3a5f", accent: "#2563eb", style: "professional" },
    images: {
      hero: "https://example.com/hero.jpg",
      gallery: ["https://example.com/g1.jpg", "https://example.com/g2.jpg"],
    },
    hero: {
      headline: "Professional roofing services",
      subheadline: "",
      primaryCTA: "Contact us",
      secondaryCTA: "",
    },
    about: {
      title: "",
      text: "We are passionate about quality you can trust and customer satisfaction. We are committed to excellence and dedicated to excellence for every professional services request.",
    },
    services: [
      { title: "Service", description: "We help with roofing." },
      { title: "Service", description: "We help with roofing." },
      { title: "Service", description: "We help with roofing." },
    ],
    faq: [
      { question: "Do you serve?", answer: "Yes." },
      { question: "Are you good?", answer: "Yes." },
      { question: "Can I call?", answer: "Yes." },
    ],
    contact: {
      phone: "+1 512 555 0100",
      email: "hello@example.com",
      address: "Main Street",
    },
    seo: {
      title: "Roofing company",
      description: "Professional roofing services with quality you can trust.",
      keywords: ["roof", "service", "company"],
    },
    testimonials: [],
  };
}

describe("quality-audit content review integration", () => {
  it("strong copy scores high but not a perfect 100 when content checks apply", () => {
    const result = auditWebsiteWithRules(strongSite(), "Travis County, Austin, TX", {
      category: "Roofing",
    });
    assert.ok(result.score >= 85, `expected >= 85, got ${result.score}`);
    assert.ok(result.score <= 100, `expected <= 100, got ${result.score}`);
    assert.equal(result.checks.some((c) => c.id === "readability"), true);
    assert.equal(result.checks.some((c) => c.id === "generic_phrases"), false);
  });

  it("weak generic copy scores materially lower than strong copy", () => {
    const strong = auditWebsiteWithRules(strongSite(), "Travis County, Austin, TX", {
      category: "Roofing",
    });
    const weak = auditWebsiteWithRules(weakSite(), "Travis County, Austin, TX", {
      category: "Roofing",
    });

    assert.ok(weak.score < strong.score, `weak ${weak.score} should be below strong ${strong.score}`);
    assert.ok(weak.score <= 70, `expected weak site <= 70, got ${weak.score}`);

    const weakIds = new Set(weak.checks.filter((c) => c.status !== "pass").map((c) => c.id));
    assert.ok(weakIds.has("hero") || weakIds.has("generic_phrases"));
    assert.ok(weakIds.has("cta") || weakIds.has("readability") || weakIds.has("local_specificity"));
  });

  it("flags AI clichés and weak CTAs via new content checks", () => {
    const result = auditWebsiteWithRules(weakSite(), "Travis County, Austin, TX", {
      category: "Roofing",
    });
    const generic = result.checks.find((c) => c.id === "generic_phrases");
    const cta = result.checks.find((c) => c.id === "cta");

    assert.ok(generic, "generic_phrases check should exist");
    assert.equal(generic?.status, "fail");
    assert.ok(cta?.status === "warn" || cta?.status === "fail");
  });

  it("detects long sentences in readability checks", () => {
    const site = strongSite();
    site.about.text = [
      "This sentence keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer.",
      "Another sentence keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer.",
      "Yet another sentence keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer.",
    ].join("\n\n");
    site.about.paragraphs = site.about.text.split("\n\n");
    site.faq = site.faq.map((item) => ({
      ...item,
      answer:
        "This answer keeps going and going with clause after clause until it becomes far too long for a mobile visitor to scan quickly without losing focus on the actual roofing offer.",
    }));

    const result = auditWebsiteWithRules(site, "Travis County, Austin, TX", {
      category: "Roofing",
    });
    const readability = result.checks.find((c) => c.id === "readability");
    const longSentences = result.checks.find((c) => c.id === "long_sentences");
    assert.ok(readability || longSentences);
    assert.ok(
      readability?.status !== "pass" || longSentences?.status !== "pass",
      "expected readability or long_sentences to fail/warn",
    );
  });

  it("applies tiered paragraph penalties instead of flat -5 warn", () => {
    const site = strongSite();
    site.about.paragraphs = [
      [
        "Since 2012 our Austin crew has completed hundreds of roof repairs.",
        "We document every job with photos before and after the work.",
        "Homeowners receive a written scope and a clear quote upfront.",
        "Licensed insured local team serving Travis County every week.",
      ].join("\n"),
    ];
    site.about.text = site.about.paragraphs.join("\n\n");

    const result = auditWebsiteWithRules(site, "Travis County, Austin, TX", {
      category: "Roofing",
    });
    const readability = result.checks.find((c) => c.id === "readability");
    assert.equal(readability?.status, "pass");
    assert.ok(result.score >= 98, `four-line paragraphs should not penalize, got ${result.score}`);
  });
});
