import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  qaSelectorsUseAi,
  selectThemeWithRules,
  themeSelectorInputFromPipeline,
} from "./theme-selector-ai";
import {
  selectTemplateBlocksWithRules,
  templateSelectorInputFromPipeline,
} from "./template-selector-ai";
import { isThemePresetId } from "@/theme";
import { HERO_TEMPLATE_IDS } from "@/lib/template-engine";

const brief = {
  dna: {
    industry: "Roofing",
    subcategory: "Repair",
    tone: "Confident",
    brandPosition: "Local roof experts",
    targetAudience: ["Homeowners"],
    brandPersonality: ["Reliable"],
    advantages: [],
    trustSignals: [],
    ctaOptions: [],
    cta: "Quote",
    primaryGoal: "Lead",
    conversionStrategy: "",
    customerIntent: "",
    websiteStyle: "professional",
  },
  niche: "Roofing",
  tradeHint: "roofing",
  city: "Austin, TX",
  localeNote: "",
  tone: "professional",
  customerPains: [],
  uniqueAngle: "",
  serviceFocus: ["Repair"],
  offerPromise: "",
} as const;

const plan = {
  template: "construction-premium",
  variant: "A" as const,
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
};

describe("QA selectors — rules path (Sprint C)", () => {
  it("defaults to rules-only (no AI) unless CRESTIS_QA_AI_SELECTORS=true", () => {
    const prev = process.env.CRESTIS_QA_AI_SELECTORS;
    delete process.env.CRESTIS_QA_AI_SELECTORS;
    assert.equal(qaSelectorsUseAi(), false);
    process.env.CRESTIS_QA_AI_SELECTORS = "true";
    assert.equal(qaSelectorsUseAi(), true);
    if (prev === undefined) delete process.env.CRESTIS_QA_AI_SELECTORS;
    else process.env.CRESTIS_QA_AI_SELECTORS = prev;
  });

  it("selectThemeWithRules picks valid preset for roofing", () => {
    const input = themeSelectorInputFromPipeline({
      brief,
      brandingTone: "Bold, trade-forward",
    });
    const { theme } = selectThemeWithRules(input);
    assert.ok(isThemePresetId(theme));
    assert.match(theme, /construction|local-service|roof/i);
  });

  it("selectTemplateBlocksWithRules picks catalog hero blocks", () => {
    const input = templateSelectorInputFromPipeline({
      brief,
      plan,
      templateId: "construction-premium",
      brandingTone: "Bold",
    });
    const blocks = selectTemplateBlocksWithRules(input);
    assert.ok(HERO_TEMPLATE_IDS.includes(blocks.hero));
    assert.ok(blocks.services.startsWith("services-"));
    assert.ok(blocks.faq.startsWith("faq-"));
  });
});
