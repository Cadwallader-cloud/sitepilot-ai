/**
 * Sprint 1 — Task 2: Preview Editor acceptance gate
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  patchAbout,
  patchCta,
  patchHero,
  patchPalette,
  patchTemplate,
} from "./preview-editor/patches";
import type { GeneratedSite } from "./site-types";

const repoRoot = join(import.meta.dirname, "..", "..");

function sampleSite(): GeneratedSite {
  return {
    businessName: "Apex Roofing",
    hero: {
      headline: "Apex Roofing — Dallas roof repair",
      subheadline: "Storm damage, replacements, and inspections across Dallas.",
      primaryCTA: "Get a Free Quote",
      secondaryCTA: "Call now",
    },
    about: {
      title: "About Apex",
      text: "We serve Dallas homeowners.\n\nLicensed and insured.",
    },
    services: [],
    testimonials: [],
    faq: [],
    contact: {
      phone: "+1 214 555 0199",
      email: "hello@apex.example",
      address: "Dallas, TX",
    },
    seo: {
      title: "Apex Roofing Dallas",
      description: "Roof repair in Dallas.",
      keywords: ["roofing"],
    },
    theme: { primary: "#1e3a5f", accent: "#0ea5e9", style: "professional" },
    images: { hero: "/demo.jpg", gallery: [] },
    design: {
      theme: "Modern Premium",
      palette: "Dark Blue",
      font: "Geist",
      borderRadius: "Medium",
      spacing: "Large",
      animation: "Soft",
      imageStyle: "Professional",
      sectionStyle: "Alternating",
    },
    layout: {
      sections: [{ id: "hero", label: "Hero" }],
      strategy: {
        template: "home-services-trust",
        variant: "A",
        tone: "professional",
        goal: "leads",
        targetAudience: "homeowners",
        positioning: "local roofer",
        trustSignals: [],
        ctaStrategy: "call",
        colorDirection: "Dark Blue",
      },
    },
  };
}

describe("Sprint 1 — Preview Editor Acceptance Gate", () => {
  it("✅ Header shows Back, Preview, Publish, Improve", () => {
    const header = readFileSync(
      join(repoRoot, "src/components/preview-editor-header.tsx"),
      "utf8",
    );
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    assert.match(header, /← Back/);
    assert.match(header, /Preview/);
    assert.match(header, /Publish/);
    assert.match(header, /Improve/);
    assert.match(builder, /PreviewEditorHeader/);
  });

  it("✅ Edit Hero without full regeneration", () => {
    const next = patchHero(sampleSite(), { headline: "New headline for Dallas" });
    assert.equal(next.hero.headline, "New headline for Dallas");
    assert.notEqual(next.hero.headline, sampleSite().hero.headline);
  });

  it("✅ Edit About without full regeneration", () => {
    const next = patchAbout(sampleSite(), { title: "Our Story" });
    assert.equal(next.about.title, "Our Story");
  });

  it("✅ Edit CTA without full regeneration", () => {
    const next = patchCta(sampleSite(), { headline: "Ready to start?" });
    assert.equal(next.cta?.headline, "Ready to start?");
  });

  it("✅ Edit colors without full regeneration", () => {
    const next = patchPalette(sampleSite(), "Teal");
    assert.equal(next.design?.palette, "Teal");
    assert.notEqual(next.theme.primary, sampleSite().theme.primary);
  });

  it("✅ Edit template without full regeneration", () => {
    const next = patchTemplate(sampleSite(), "construction-premium", "B");
    assert.equal(next.layout?.strategy?.template, "construction-premium");
    assert.equal(next.layout?.strategy?.variant, "B");
    assert.ok(next.design);
  });

  it("✅ Preview editor panel exposes all edit sections", () => {
    const panel = readFileSync(
      join(repoRoot, "src/components/preview-editor-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /Hero/);
    assert.match(panel, /About/);
    assert.match(panel, /CTA/);
    assert.match(panel, /Colors/);
    assert.match(panel, /Template/);
    assert.match(panel, /Edit without regenerating/);
  });

  it("✅ Edits autosave via PATCH project", () => {
    const builder = readFileSync(
      join(repoRoot, "src/components/form-builder.tsx"),
      "utf8",
    );
    assert.match(builder, /handleSiteChange/);
    assert.match(builder, /PATCH|patch/i);
    assert.match(builder, /\/api\/projects/);
  });
});
