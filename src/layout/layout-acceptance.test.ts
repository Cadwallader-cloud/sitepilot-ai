/**
 * Layout Engine — acceptance (Phase 2.4 gate)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { selectTemplate } from "@/lib/ai-engine/template-selector";
import type { BusinessDna } from "@/lib/business-dna";
import { getTemplate } from "@/lib/template-library";
import {
  LAYOUT_ENGINE_RULE,
  LAYOUT_IDS,
  LayoutRegistry,
  RoofingLayout,
  RestaurantLayout,
  DentistLayout,
  GenericLayout,
  buildLayoutPlan,
  clampLayoutToTemplate,
  getLayout,
  layoutEnginePromptBlock,
  layoutUxBrief,
  parseAiLayoutSelection,
  parseAiLayoutSelectionOrThrow,
  planLayout,
  resolveLayoutPreset,
  suggestLayoutId,
  type LayoutDefinition,
} from "@/layout";

const here = dirname(fileURLToPath(import.meta.url));
const plannerStepPath = join(here, "../lib/ai/orchestrator/steps/planner.step.ts");
const templateSelectorPath = join(here, "../lib/ai-engine/template-selector.ts");

const roofingDna: BusinessDna = {
  industry: "Roofing",
  subcategory: "Storm repair",
  targetAudience: ["Homeowners"],
  customerIntent: "Fix storm damage",
  brandPosition: "premium",
  brandPersonality: ["Reliable", "Direct", "Local", "Capable", "Honest"],
  tone: "bold",
  primaryGoal: "Lead",
  secondaryGoal: "Trust",
  trustSignals: ["Licensed", "Insured"],
  conversionStrategy: "Call",
  cta: "Get a free estimate",
  ctaOptions: ["Get a free estimate", "Call now"],
  websiteStyle: "construction-premium",
  colorDirection: "slate",
  imageDirection: "real work",
  sections: ["hero", "trust", "services", "projects", "faq", "contact"],
  seoIntent: "local",
  keywords: ["roof repair"],
  localSeo: ["Manchester"],
  advantages: ["Storm response"],
};

function assertLayoutShape(layout: LayoutDefinition): void {
  assert.equal(typeof layout.id, "string");
  assert.equal(typeof layout.name, "string");
  assert.ok(layout.industries.length >= 1);
  assert.ok(layout.sections.length >= 4);
  assert.equal(layout.sections[0]?.id, "hero");
  assert.equal(layout.sections.at(-1)?.id, "contact");
  assert.equal(typeof layout.stickyCTA, "boolean");
  assert.equal(typeof layout.floatingPhone, "boolean");
  assert.match(layout.heroVariant, /^[ABC]$/);
  assert.ok(layout.rationale.length >= 1);
}

describe("Layout Engine Acceptance", () => {
  it("✅ rule — AI picks preset id, engine resolves sections", () => {
    assert.match(LAYOUT_ENGINE_RULE, /preset id/i);
    assert.match(layoutEnginePromptBlock(), /roofing/);
    assert.match(layoutEnginePromptBlock(), /Never invent section markup/i);
  });

  it("✅ Layout Registry — preset id maps to curated section bundle", () => {
    assert.deepEqual(Object.keys(LayoutRegistry).sort(), [...LAYOUT_IDS].sort());
    assert.equal(LayoutRegistry.roofing, RoofingLayout);
    assert.equal(LayoutRegistry.restaurant, RestaurantLayout);
    assert.equal(LayoutRegistry.dentist, DentistLayout);
    assert.equal(LayoutRegistry.generic, GenericLayout);
  });

  it("✅ AI contract — accepts { layout: preset-id }", () => {
    assert.deepEqual(parseAiLayoutSelection({ layout: "roofing" }), {
      layout: "roofing",
    });
    assert.deepEqual(parseAiLayoutSelection({ layout: "restaurant" }), {
      layout: "restaurant",
    });
    assert.deepEqual(parseAiLayoutSelectionOrThrow({ layout: "generic" }), {
      layout: "generic",
    });
  });

  it("✅ AI contract — rejects invented layout ids", () => {
    assert.equal(parseAiLayoutSelection({ layout: "luxury-spa" }), null);
    assert.equal(parseAiLayoutSelection({ layout: "hero-first" }), null);
    assert.throws(() => parseAiLayoutSelectionOrThrow({ layout: "unknown" }));
  });

  it("✅ every registry id resolves without gaps", () => {
    for (const id of LAYOUT_IDS) {
      const layout = getLayout(id);
      assertLayoutShape(layout);
      assert.equal(resolveLayoutPreset(id).id, id);
    }
  });

  it("✅ niche routing — roofing, restaurant, dentist, generic", () => {
    assert.equal(suggestLayoutId({ tradeKey: "emergency roof repair" }), "roofing");
    assert.equal(suggestLayoutId({ industryId: "restaurant" }), "restaurant");
    assert.equal(suggestLayoutId({ industry: "family dentist" }), "dentist");
    assert.equal(suggestLayoutId({ tradeKey: "local handyman" }), "generic");
  });

  it("✅ planner — resolves ordered sections + UX flags", () => {
    const roofing = planLayout({
      industryId: "roofing",
      tradeKey: "roofing Manchester",
      template: getTemplate("construction-premium"),
    });
    assert.equal(roofing.layoutId, "roofing");
    assert.equal(roofing.sections[0]?.id, "hero");
    assert.equal(roofing.sections.at(-1)?.id, "contact");
    assert.equal(roofing.stickyCTA, true);
    assert.equal(roofing.floatingPhone, true);
    assert.ok(roofing.sections.some((s) => s.id === "projects"));

    const restaurant = planLayout({
      industryId: "restaurant",
      template: getTemplate("restaurant-modern"),
    });
    assert.equal(restaurant.layoutId, "restaurant");
    assert.ok(restaurant.sections.some((s) => s.id === "menu"));
  });

  it("✅ clamp — sections respect template allowedSections", () => {
    const template = getTemplate("dentist-family");
    const plan = buildLayoutPlan("roofing", { template });
    const clamped = clampLayoutToTemplate(plan.sections, template);
    for (const section of clamped) {
      assert.ok(
        ["hero", "trust", "services", "about", "testimonials", "faq", "contact"].includes(
          section.id,
        ),
      );
    }
    assert.equal(clamped[0]?.id, "hero");
    assert.equal(clamped.at(-1)?.id, "contact");
  });

  it("✅ Template Selector — uses Layout Engine for section order", () => {
    const src = readFileSync(templateSelectorPath, "utf8");
    assert.match(src, /planLayout/);
    assert.match(src, /layoutId/);

    const selection = selectTemplate({
      dna: roofingDna,
      tradeKey: "roofing",
      hints: { template: "construction-premium" },
    });
    assert.equal(selection.layoutId, "roofing");
    assert.ok(selection.sections.length >= 5);
    assert.match(layoutUxBrief(buildLayoutPlan(selection.layoutId)), /LAYOUT PRESET/);
  });

  it("✅ pipeline wiring — planner step runs template selector", () => {
    const src = readFileSync(plannerStepPath, "utf8");
    assert.match(src, /selectTemplate/);
    assert.match(src, /applyTemplateSelection/);
  });
});
