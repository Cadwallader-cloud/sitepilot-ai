/**
 * Layout Engine — acceptance (Phase 2.4 gate)
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  layoutSelectorInputFromPipeline,
  runLayoutSelector,
} from "@/lib/ai-engine/layout-selector-ai";
import { selectTemplate } from "@/lib/ai-engine/template-selector";
import type { BusinessBrief } from "@/lib/ai-engine/types";
import type { BusinessDna } from "@/lib/business-dna";
import { getTemplate } from "@/lib/template-library";
import {
  INDUSTRY_LAYOUT_IDS,
  LAYOUT_ENGINE_RULE,
  LAYOUT_IDS,
  LayoutRegistry,
  roofing,
  restaurant,
  dentist,
  generic,
  applySmartLayoutRules,
  smartRulePreservedComponents,
  applyDynamicLayoutSections,
  applyDynamicSiteSectionIds,
  buildLayoutPlan,
  parseAiSectionRules,
  resolveSectionsWithRules,
  clampLayoutToTemplate,
  getLayout,
  layoutEnginePromptBlock,
  layoutUxBrief,
  parseAiLayoutSelection,
  parseAiLayoutSelectionOrThrow,
  planLayout,
  reorderLayoutSections,
  reorderPreservedComponents,
  layoutSection,
  resolveLayout,
  resolveLayoutFromAi,
  resolveLayoutPreset,
  suggestLayoutId,
  type Layout,
  type LayoutPreset,
  type LayoutSection,
} from "@/layout";

const here = dirname(fileURLToPath(import.meta.url));
const plannerStepPath = join(here, "../lib/ai/orchestrator/steps/planner.step.ts");
const templateSelectorPath = join(here, "../lib/ai-engine/template-selector.ts");
const layoutSelectorPromptPath = join(
  here,
  "../lib/ai-engine/prompts/layout-selector-ai.ts",
);

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

const roofingBrief = {
  dna: roofingDna,
  niche: "Roofing",
  tradeHint: "roofing",
  city: "Manchester",
  localeNote: "UK",
  tone: "bold",
  customerPains: ["Storm damage"],
  uniqueAngle: "Fast response",
  serviceFocus: ["Roof repair"],
} satisfies BusinessBrief;

function assertLayoutShape(layout: Layout): void {
  assert.equal(typeof layout.id, "string");
  assert.equal(typeof layout.name, "string");
  assert.ok(layout.industry.length >= 1);
  assert.ok(layout.sections.length >= 4);
  assert.equal(layout.sections[0]?.id, "hero");
  assert.equal(layout.sections.at(-1)?.id, "contact");
  for (const section of layout.sections) {
    assertLayoutSectionShape(section);
  }
}

function assertLayoutSectionShape(section: LayoutSection): void {
  assert.equal(typeof section.id, "string");
  assert.equal(typeof section.component, "string");
  assert.equal(typeof section.required, "boolean");
  assert.equal(typeof section.priority, "number");
  assert.ok(Array.isArray(section.variants));
  assert.ok(section.variants.length >= 1);
}

function assertLayoutPresetShape(layout: LayoutPreset): void {
  assertLayoutShape(layout);
  assert.equal(typeof layout.stickyCTA, "boolean");
  assert.equal(typeof layout.floatingPhone, "boolean");
  assert.match(layout.heroVariant, /^[ABC]$/);
  assert.ok(layout.rationale.length >= 1);
}

const layoutRoot = here;

function readLayoutSources(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
        files.push(readFileSync(fullPath, "utf8"));
      }
    }
  };
  walk(layoutRoot);
  return files;
}

describe("Layout Engine Acceptance Gate", () => {
  it("✅ 1 — Layout Registry exists", () => {
    assert.ok(LayoutRegistry);
    assert.ok(LAYOUT_IDS.length >= 11);
    assert.equal(typeof getLayout, "function");
    assert.equal(typeof resolveLayout, "function");
  });

  it("✅ 2 — minimum 10 industry layout profiles", () => {
    assert.equal(INDUSTRY_LAYOUT_IDS.length, 10);
    for (const id of INDUSTRY_LAYOUT_IDS) {
      assert.ok(id in LayoutRegistry, `missing profile ${id}`);
    }
  });

  it("✅ 3 — AI selects only registered layouts", () => {
    for (const id of LAYOUT_IDS) {
      assert.deepEqual(parseAiLayoutSelection({ layout: id }), { layout: id });
    }
    assert.equal(parseAiLayoutSelection({ layout: "made-up-layout" }), null);
    assert.equal(parseAiLayoutSelection({ layout: "spa-luxury" }), null);
  });

  it("✅ 4 — sections can be reordered", () => {
    const order = ["hero", "services", "about", "faq", "contact"];
    const plan = buildLayoutPlan("generic-standard", { sectionOrder: order });
    const ids = plan.sections.map((section) => section.id);
    const servicesIdx = ids.indexOf("services");
    const aboutIdx = ids.indexOf("about");
    assert.ok(servicesIdx >= 0 && aboutIdx >= 0);
    assert.ok(servicesIdx < aboutIdx);
    assert.ok(reorderPreservedComponents(getLayout("generic-standard").sections, plan.sections));
  });

  it("✅ 5 — optional sections can be disabled", () => {
    const plan = buildLayoutPlan("roofing-modern", {
      sectionRules: [
        { section: "faq", required: false },
        { section: "testimonials", required: false },
      ],
    });
    assert.ok(!plan.sections.some((section) => section.id === "faq"));
    assert.ok(!plan.sections.some((section) => section.id === "testimonials"));
    assert.ok(plan.sections.some((section) => section.id === "hero"));
    assert.ok(plan.sections.some((section) => section.id === "contact"));
  });

  it("✅ 6 — layout does not depend on Theme", () => {
    for (const source of readLayoutSources()) {
      assert.doesNotMatch(source, /@\/theme|from ["']\.\.\/theme/);
    }

    const withoutTheme = buildLayoutPlan("lawyer-modern");
    assert.equal(withoutTheme.layoutId, "lawyer-modern");
    assert.equal(withoutTheme.layout, LayoutRegistry["lawyer-modern"]);
    assert.ok(withoutTheme.sections.length >= 4);
  });

  it("✅ 7 — layout does not depend on Template", () => {
    for (const source of readLayoutSources()) {
      if (source.includes('from "../sections"') || source.includes('from "./sections"')) {
        continue;
      }
      if (source.includes('from "../types"') || source.includes('from "./types"')) {
        continue;
      }
      if (source.includes("/layouts/")) {
        assert.doesNotMatch(source, /@\/lib\/template-library|template-library/);
      }
    }

    const baseline = buildLayoutPlan("roofing-modern");
    const withConstruction = buildLayoutPlan("roofing-modern", {
      template: getTemplate("construction-premium"),
    });
    const withRestaurant = buildLayoutPlan("roofing-modern", {
      template: getTemplate("restaurant-modern"),
    });

    assert.equal(baseline.layoutId, "roofing-modern");
    assert.equal(withConstruction.layoutId, "roofing-modern");
    assert.equal(withRestaurant.layoutId, "roofing-modern");
    assert.equal(baseline.layout, LayoutRegistry["roofing-modern"]);
    assert.equal(withConstruction.layout, LayoutRegistry["roofing-modern"]);
    assert.equal(withRestaurant.layout, LayoutRegistry["roofing-modern"]);
  });
});

describe("Layout Engine Acceptance", () => {
  it("✅ rule — AI picks preset id, never HTML", () => {
    assert.match(LAYOUT_ENGINE_RULE, /never HTML/i);
    assert.match(layoutEnginePromptBlock(), /roofing-modern/);
    assert.match(layoutEnginePromptBlock(), /Never return HTML/i);
  });

  it("✅ LayoutSection — component, required, priority, variants", () => {
    const hero = getLayout("roofing-modern").sections[0];
    assertLayoutSectionShape(hero!);
    assert.equal(hero?.component, "Hero03");
    assert.equal(hero?.required, true);
    assert.ok(hero!.variants.includes("Hero03"));
  });

  it("✅ Layout interface — id, name, industry, sections", () => {
    const layout = getLayout("roofing-modern");
    assertLayoutShape(layout);
    assertLayoutPresetShape(layout);
    assert.equal(layout.id, "roofing-modern");
  });

  it("✅ Engine — resolveLayout(data) → LayoutRegistry[data.layout]", () => {
    const data = { layout: "roofing-modern" as const };
    const layout = resolveLayout(data);
    assert.equal(layout, LayoutRegistry[data.layout]);
    assert.equal(layout.id, "roofing-modern");
    assert.ok(layout.sections.length >= 4);

    const fromAi = resolveLayoutFromAi({ layout: "restaurant-modern" });
    assert.equal(fromAi.id, "restaurant-modern");
  });

  it("✅ Layout Registry — preset id maps to curated section bundle", () => {
    assert.deepEqual(Object.keys(LayoutRegistry).sort(), [...LAYOUT_IDS].sort());
    assert.deepEqual([...INDUSTRY_LAYOUT_IDS], [
      "roofing-modern",
      "plumber-modern",
      "hvac-modern",
      "electrician-modern",
      "landscaping-modern",
      "cleaning-modern",
      "dentist-modern",
      "restaurant-modern",
      "lawyer-modern",
      "real-estate-modern",
    ]);
    assert.equal(LayoutRegistry["roofing-modern"], roofing);
    assert.equal(LayoutRegistry["restaurant-modern"], restaurant);
    assert.equal(LayoutRegistry["dentist-modern"], dentist);
    assert.equal(LayoutRegistry["generic-standard"], generic);
    assert.equal(LAYOUT_IDS.length, 11);
  });

  it("✅ AI contract — accepts { layout: preset-id }", () => {
    assert.deepEqual(parseAiLayoutSelection({ layout: "roofing-modern" }), {
      layout: "roofing-modern",
    });
    assert.deepEqual(parseAiLayoutSelection({ layout: "restaurant-modern" }), {
      layout: "restaurant-modern",
    });
    assert.deepEqual(parseAiLayoutSelectionOrThrow({ layout: "generic-standard" }), {
      layout: "generic-standard",
    });
    assert.deepEqual(
      parseAiLayoutSelection({
        layout: "roofing-modern",
        sectionRules: [{ section: "faq", required: false }],
      }),
      {
        layout: "roofing-modern",
        sectionRules: [{ section: "faq", required: false }],
      },
    );
    assert.deepEqual(
      parseAiLayoutSelection({
        layout: "generic-standard",
        sectionOrder: ["hero", "services", "about", "faq", "contact"],
      }),
      {
        layout: "generic-standard",
        sectionOrder: ["hero", "services", "about", "faq", "contact"],
      },
    );
    assert.equal(parseAiLayoutSelection({ layout: "roofing" })?.layout, "roofing-modern");
    assert.equal(parseAiLayoutSelection({ layout: "plumber" })?.layout, "plumber-modern");
    assert.equal(parseAiLayoutSelection({ layout: "real_estate" })?.layout, "real-estate-modern");
  });

  it("✅ AI contract — rejects HTML and invented layout ids", () => {
    assert.equal(parseAiLayoutSelection({ layout: "luxury-spa" }), null);
    assert.equal(parseAiLayoutSelection({ layout: "hero-first" }), null);
    assert.equal(parseAiLayoutSelection({ layout: "roofing-modern", html: "<div>" }), null);
    assert.equal(parseAiLayoutSelection({ layout: "roofing-modern", sections: [] }), null);
    assert.throws(() => parseAiLayoutSelectionOrThrow({ layout: "unknown" }));
  });

  it("✅ every registry id resolves without gaps", () => {
    for (const id of LAYOUT_IDS) {
      const layout = getLayout(id);
      assertLayoutPresetShape(layout);
      assert.equal(resolveLayoutPreset(id).id, id);
    }
  });

  it("✅ niche routing — 10 industry layouts + generic fallback", () => {
    assert.equal(suggestLayoutId({ tradeKey: "emergency roof repair" }), "roofing-modern");
    assert.equal(suggestLayoutId({ tradeKey: "blocked drain plumber" }), "plumber-modern");
    assert.equal(suggestLayoutId({ industry: "HVAC heating repair" }), "hvac-modern");
    assert.equal(suggestLayoutId({ tradeKey: "EV charger electrician" }), "electrician-modern");
    assert.equal(suggestLayoutId({ industry: "lawn care landscaping" }), "landscaping-modern");
    assert.equal(suggestLayoutId({ tradeKey: "office cleaning" }), "cleaning-modern");
    assert.equal(suggestLayoutId({ industry: "family dentist" }), "dentist-modern");
    assert.equal(suggestLayoutId({ industryId: "restaurant" }), "restaurant-modern");
    assert.equal(suggestLayoutId({ industry: "personal injury lawyer" }), "lawyer-modern");
    assert.equal(suggestLayoutId({ tradeKey: "homes for sale realtor" }), "real-estate-modern");
    assert.equal(suggestLayoutId({ tradeKey: "local handyman" }), "generic-standard");
  });

  it("✅ industry layouts — hero first, contact last, valid sections", () => {
    for (const id of INDUSTRY_LAYOUT_IDS) {
      const layout = getLayout(id);
      assertLayoutPresetShape(layout);
      assert.equal(layout.id, id);
      assert.equal(layout.sections[0]?.id, "hero");
      assert.equal(layout.sections.at(-1)?.id, "contact");
    }
  });

  it("✅ planner — resolves ordered sections + UX flags", () => {
    const roofingPlan = planLayout({
      industryId: "roofing",
      tradeKey: "roofing Manchester",
      template: getTemplate("construction-premium"),
      hints: { layout: "roofing-modern" },
    });
    assert.equal(roofingPlan.layoutId, "roofing-modern");
    assert.equal(roofingPlan.sections[0]?.id, "hero");
    assert.equal(roofingPlan.sections.at(-1)?.id, "contact");
    assert.ok(roofingPlan.siteSections.length >= 5);
    assert.equal(roofingPlan.floatingPhone, true);

    const restaurantPlan = planLayout({
      industryId: "restaurant",
      template: getTemplate("restaurant-modern"),
    });
    assert.equal(restaurantPlan.layoutId, "restaurant-modern");
    assert.ok(restaurantPlan.sections.some((s) => s.id === "menu"));
  });

  it("✅ Layout Selector AI — Industry + Brand + Audience → preset id", async () => {
    const prompt = readFileSync(layoutSelectorPromptPath, "utf8");
    assert.match(prompt, /do NOT generate HTML/i);
    assert.match(prompt, /"layout": "roofing-modern"/);

    const input = layoutSelectorInputFromPipeline({ brief: roofingBrief });
    assert.ok(input.industry.length > 0);
    assert.ok(input.brandPersonality.length > 0);
    assert.ok(input.targetAudience.length > 0);

    const out = await runLayoutSelector(input);
    assert.equal(out.layout, "roofing-modern");
  });

  it("✅ clamp — sections respect template allowedSections", () => {
    const template = getTemplate("dentist-family");
    const plan = buildLayoutPlan("roofing-modern", { template });
    const clamped = clampLayoutToTemplate(plan.sections, template);
    for (const section of clamped) {
      assertLayoutSectionShape(section);
    }
    assert.equal(clamped[0]?.id, "hero");
    assert.equal(clamped.at(-1)?.id, "contact");
  });

  it("✅ Smart Rules — industry order without component changes", () => {
    const restaurantPlan = buildLayoutPlan("restaurant-modern");
    const restaurantIds = restaurantPlan.sections.map((section) => section.id);
    const reservationIdx = restaurantIds.indexOf("cta");
    const galleryIdx = restaurantIds.indexOf("gallery");
    assert.ok(reservationIdx >= 0);
    assert.ok(galleryIdx >= 0);
    assert.ok(reservationIdx < galleryIdx);
    assert.equal(
      restaurantPlan.siteSections.find((section) => section.id === "cta")?.label,
      "Reservation",
    );
    assert.ok(
      smartRulePreservedComponents(
        getLayout("restaurant-modern").sections,
        restaurantPlan.sections.filter((section) => section.id !== "cta"),
      ),
    );

    const lawyerReversed = reorderLayoutSections(getLayout("lawyer-modern").sections, [
      "hero",
      "services",
      "trust",
      "about",
      "testimonials",
      "faq",
      "contact",
    ]);
    const lawyerFixed = applySmartLayoutRules("lawyer-modern", lawyerReversed);
    const lawyerTrustIdx = lawyerFixed.findIndex((section) => section.id === "trust");
    const lawyerServicesIdx = lawyerFixed.findIndex((section) => section.id === "services");
    assert.ok(lawyerTrustIdx >= 0 && lawyerServicesIdx >= 0);
    assert.ok(lawyerTrustIdx < lawyerServicesIdx);
    assert.ok(smartRulePreservedComponents(lawyerReversed, lawyerFixed));

    const roofingPlan = buildLayoutPlan("roofing-modern");
    const roofingIds = roofingPlan.sections.map((section) => section.id);
    assert.equal(roofingIds[0], "hero");
    assert.equal(roofingIds[1], "cta");
    assert.equal(
      roofingPlan.siteSections.find((section) => section.id === "cta")?.label,
      "Emergency CTA",
    );
  });

  it("✅ Section Reorder — Hero/About/Services/FAQ → Hero/Services/About/FAQ", () => {
    const before = [
      layoutSection("hero", "Hero03", {
        required: true,
        priority: 10,
        variants: ["Hero03"],
      }),
      layoutSection("about", "About01", {
        required: false,
        priority: 20,
        variants: ["About01", "About02"],
      }),
      layoutSection("services", "Services02", {
        required: true,
        priority: 30,
        variants: ["Services01", "Services02"],
      }),
      layoutSection("faq", "FAQAccordion01", {
        required: false,
        priority: 40,
        variants: ["FAQAccordion01"],
      }),
      layoutSection("contact", "Footer01", {
        required: true,
        priority: 50,
        variants: ["Footer01"],
      }),
    ];

    const order = ["hero", "services", "about", "faq", "contact"];
    const after = reorderLayoutSections(before, order);

    assert.deepEqual(
      after.map((section) => section.id),
      order,
    );
    assert.ok(reorderPreservedComponents(before, after));
    assert.equal(after.find((s) => s.id === "about")?.component, "About01");
    assert.equal(after.find((s) => s.id === "services")?.component, "Services02");

    const plan = planLayout({
      industryId: "general",
      hints: {
        layout: "generic-standard",
        sectionOrder: order,
      },
    });
    const servicesIdx = plan.sections.findIndex((s) => s.id === "services");
    const aboutIdx = plan.sections.findIndex((s) => s.id === "about");
    assert.ok(servicesIdx >= 0 && aboutIdx >= 0);
    assert.ok(servicesIdx < aboutIdx);
    assert.ok(
      reorderPreservedComponents(
        getLayout("generic-standard").sections,
        plan.sections,
      ),
    );
  });

  it("✅ Section Rules — AI can disable optional sections", () => {
    const base = getLayout("roofing-modern").sections;
    const rules = parseAiSectionRules([{ section: "faq", required: false }]);
    const resolved = resolveSectionsWithRules(base, rules);
    assert.ok(!resolved.some((s) => s.id === "faq"));
    assert.ok(resolved.some((s) => s.id === "hero"));
    assert.ok(resolved.some((s) => s.id === "contact"));

    const plan = buildLayoutPlan("roofing-modern", {
      sectionRules: [{ section: "faq", required: false }],
    });
    assert.ok(!plan.siteSections.some((s) => s.id === "faq"));

    const locked = parseAiSectionRules([{ section: "hero", required: false }]);
    assert.equal(locked.length, 0);
  });

  it("✅ Dynamic Sections — drop testimonials and gallery without content", () => {
    const base = getLayout("restaurant-modern").sections;
    const withContent = applyDynamicLayoutSections(base, {
      hasTestimonials: true,
      hasGallery: true,
    });
    assert.ok(withContent.some((s) => s.id === "testimonials"));
    assert.ok(withContent.some((s) => s.id === "gallery"));

    const withoutReviews = applyDynamicLayoutSections(base, {
      hasTestimonials: false,
      hasGallery: true,
    });
    assert.ok(!withoutReviews.some((s) => s.id === "testimonials"));
    assert.ok(withoutReviews.some((s) => s.id === "gallery"));

    const withoutGallery = applyDynamicLayoutSections(base, {
      hasTestimonials: true,
      hasGallery: false,
    });
    assert.ok(withoutGallery.some((s) => s.id === "testimonials"));
    assert.ok(!withoutGallery.some((s) => s.id === "gallery"));

    const plan = buildLayoutPlan("restaurant-modern", {
      contentSignals: { hasTestimonials: false, hasGallery: false },
    });
    assert.ok(!plan.siteSections.some((s) => s.id === "testimonials"));
    assert.ok(!plan.siteSections.some((s) => s.id === "gallery"));
    assert.equal(plan.siteSections[0]?.id, "hero");
    assert.equal(plan.siteSections.at(-1)?.id, "contact");

    const siteSections = applyDynamicSiteSectionIds(
      [
        { id: "hero", label: "Hero" },
        { id: "gallery", label: "Gallery" },
        { id: "testimonials", label: "Testimonials" },
        { id: "contact", label: "Contact" },
      ],
      { hasTestimonials: false, hasGallery: false },
    );
    assert.deepEqual(
      siteSections.map((s) => s.id),
      ["hero", "contact"],
    );
  });

  it("✅ Template Selector — uses Layout Engine for section order", () => {
    const src = readFileSync(templateSelectorPath, "utf8");
    assert.match(src, /planLayout/);
    assert.match(src, /layoutId/);

    const selection = selectTemplate({
      dna: roofingDna,
      tradeKey: "roofing",
      hints: { layout: "roofing-modern", template: "construction-premium" },
    });
    assert.equal(selection.layoutId, "roofing-modern");
    assert.ok(selection.sections.length >= 5);
    assert.match(layoutUxBrief(buildLayoutPlan(selection.layoutId)), /LAYOUT PRESET/);
  });

  it("✅ pipeline wiring — planner step runs Layout Selector AI", () => {
    const src = readFileSync(plannerStepPath, "utf8");
    assert.match(src, /runLayoutSelector/);
    assert.match(src, /selectTemplate/);
    assert.match(src, /applyTemplateSelection/);
    assert.match(src, /sectionOrder/);
    assert.match(src, /Promise\.all/);
    assert.match(src, /runSeoPlanner/);
  });
});
