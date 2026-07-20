/**
 * JSON Validator gate tests — PASS / FAIL / Retry
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { websiteFromFlat } from "./website";
import type { WebsiteJson } from "./website-json";
import {
  checkWebsite,
  repairWebsite,
  runJsonValidatorGate,
} from "./website-validator";

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
    faq: [
      {
        question: "How much does it cost?",
        answer: "We confirm pricing after a short consultation.",
        category: "Pricing",
      },
      {
        question: "How long does the work take?",
        answer: "Timeline depends on scope; we share a clear plan first.",
        category: "Timeline",
      },
      {
        question: "Are you licensed and insured?",
        answer: "Ask us for current credentials before you book.",
        category: "Trust",
      },
      {
        question: "What happens after I contact you?",
        answer: "We review your needs and outline the next steps.",
        category: "Process",
      },
      {
        question: "Do you serve my area?",
        answer: "Tell us your location and we will confirm coverage.",
        category: "Location",
      },
      {
        question: "Which services do you offer?",
        answer: "We focus on the services listed on this site.",
        category: "Service",
      },
    ],
    testimonials: [],
    contact: {
      phone: "+1 512 555 0100",
      email: "a@b.com",
      address: "Austin, TX",
    },
  };
}

describe("JSON Validator gate", () => {
  it("PASS on valid Website", () => {
    const site = websiteFromFlat(sampleFlat(), { id: "v1" });
    const result = checkWebsite(site);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.website.business.name, "Apex Roofing");
    }
  });

  it("FAIL on broken shape", () => {
    const result = checkWebsite({ foo: 1 });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.issues.length >= 1);
    }
  });

  it("FAIL → Retry → PASS via repair", () => {
    const broken = websiteFromFlat(sampleFlat(), { id: "v2" });
    // Strip required sections to force FAIL
    broken.pages[0] = {
      ...broken.pages[0],
      sections: broken.pages[0].sections.filter((s) => s.type === "hero"),
    };
    const first = checkWebsite(broken);
    assert.equal(first.ok, false);

    const repaired = repairWebsite(broken);
    const second = checkWebsite(repaired);
    assert.equal(second.ok, true);
  });

  it("gate returns pass_after_retry when first attempt fails", () => {
    const broken = websiteFromFlat(sampleFlat(), { id: "v3" });
    broken.pages[0] = {
      ...broken.pages[0],
      sections: [],
    };
    const gated = runJsonValidatorGate(broken, { maxRetries: 1 });
    assert.equal(gated.status, "pass_after_retry");
    assert.equal(gated.attempts, 2);
    assert.ok(gated.website.pages[0].sections.length >= 4);
  });

  it("gate throws when retries exhausted on irreparable input", () => {
    assert.throws(
      () => runJsonValidatorGate(null, { maxRetries: 0 }),
      /WEBSITE_VALIDATION_FAILED/,
    );
  });
});
