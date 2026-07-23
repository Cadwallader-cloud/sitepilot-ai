/**
 * Theme Engine — acceptance (Phase 2.3 gate)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  THEME_ENGINE_RULE,
  THEME_PRESET_IDS,
  COLOR_TOKENS,
  DESIGN_TOKENS_RULE,
  RADIUS_TOKENS,
  SHADOW_TOKENS,
  ANIMATION_TOKENS,
  TYPOGRAPHY_ROLES,
  THEME_MODES,
  RENDERER_CSS_VARS,
  rendererCssVars,
  paletteFor,
  assertNoHexThemeFields,
  constructionModern,
  getTheme,
  ThemeRegistry,
  ConstructionModern,
  MedicalClean,
  RestaurantDark,
  parseAiThemeSelection,
  parseAiThemeSelectionOrThrow,
  resolveThemePreset,
  isThemePresetId,
  themeEnginePromptBlock,
  themeFieldsFromPreset,
  typographyRoleClass,
  radiusClass,
  radiusRem,
  shadowClass,
  shadowValue,
  animationClass,
  type Theme,
} from "@/theme";
import { themeCssVars } from "@/theme/define";
import {
  spacing,
  spacingCssVars,
  spacingRem,
} from "@/theme/tokens/spacing";
import {
  selectThemeWithRules,
  themeSelectorInputFromPipeline,
} from "@/lib/ai-engine/theme-selector-ai";
import type { BusinessBrief } from "@/lib/ai-engine/types";
import type { BusinessDna } from "@/lib/business-dna";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const qaStepPath = join(here, "../lib/ai/orchestrator/steps/qa.step.ts");
const themeSelectorPromptPath = join(
  here,
  "../lib/ai-engine/prompts/theme-selector-ai.ts",
);

function assertThemeShape(theme: Theme): void {
  assert.equal(typeof theme.id, "string");
  assert.equal(typeof theme.name, "string");
  for (const key of COLOR_TOKENS) {
    assert.match(
      theme.palette[key],
      /^#[0-9a-fA-F]{6}$/,
      `palette.${key} must be hex`,
    );
    assert.match(
      theme.modes.light[key],
      /^#[0-9a-fA-F]{6}$/,
      `modes.light.${key} must be hex`,
    );
    assert.match(
      theme.modes.dark[key],
      /^#[0-9a-fA-F]{6}$/,
      `modes.dark.${key} must be hex`,
    );
  }
  for (const role of TYPOGRAPHY_ROLES) {
    assert.ok(theme.typography[role].className);
    assert.ok(theme.typography[role].fontSize);
  }
  for (const token of RADIUS_TOKENS) {
    assert.ok(theme.radius[token].className);
    assert.ok(theme.radius[token].rem.length >= 0);
  }
  for (const token of SHADOW_TOKENS) {
    assert.ok(theme.shadow[token].className);
    assert.ok(theme.shadow[token].value.length >= 0);
  }
  for (const token of ANIMATION_TOKENS) {
    assert.ok(typeof theme.animation[token].className === "string");
    assert.ok(theme.animation[token].duration.length >= 0);
  }
  assert.ok(theme.typography.stack);
  assert.ok(theme.spacing.section);
  assert.ok(theme.radius.base);
  assert.ok(theme.shadow.soft.value);
  assert.ok(theme.animation.duration);
  assert.ok(theme.button.radius);
  assert.ok(theme.card.shadow);
}

describe("Theme Engine Acceptance", () => {
  it("✅ rule — AI picks preset id, engine resolves tokens", () => {
    assert.match(THEME_ENGINE_RULE, /preset id/i);
    assert.match(themeEnginePromptBlock(), /construction-modern/);
    assert.match(themeEnginePromptBlock(), /Never return hex/);
  });

  it("✅ Theme interface — nested palette, typography, spacing, radius, shadow, animation, button, card", () => {
    assertThemeShape(constructionModern);
    assert.equal(constructionModern.id, "construction-modern");
    assert.equal(getTheme("construction-modern").name, "Bold Trade");
  });

  it("✅ Theme Registry — preset id maps to curated Theme bundle", () => {
    assert.equal(ThemeRegistry["construction-modern"], ConstructionModern);
    assert.equal(ThemeRegistry["medical-clean"], MedicalClean);
    assert.equal(ThemeRegistry["restaurant-dark"], RestaurantDark);
    assert.equal(getTheme("construction-modern").id, "construction-modern");
    assert.equal(getTheme("restaurant-dark").palette.name, "Warm Burgundy");
    assert.ok(isThemePresetId("restaurant-luxury"));
    assert.equal(getTheme("restaurant-luxury").id, "restaurant-dark");
  });

  it("✅ AI contract — accepts { theme: preset-id }", () => {
    const parsed = parseAiThemeSelectionOrThrow({
      theme: "construction-modern",
    });
    assert.equal(parsed.theme, "construction-modern");
  });

  it("✅ AI contract — rejects hex color responses", () => {
    assert.throws(
      () => assertNoHexThemeFields({ color: "#0EA5E9" }),
      /preset id/i,
    );
    assert.throws(
      () => parseAiThemeSelection({ primary: "#1e3a5f" }),
      /preset id/i,
    );
    assert.equal(parseAiThemeSelection({ theme: "not-a-preset" }), null);
  });

  it("✅ resolveThemePreset — construction-modern token bundle", () => {
    const resolved = resolveThemePreset("construction-modern");
    assertThemeShape(resolved);
    assert.equal(resolved.id, "construction-modern");
    assert.equal(resolved.palette.name, "Amber Trade");
    assert.equal(resolved.typography.font, "Manrope");
    assert.equal(resolved.radius.scale, "Medium");
    assert.equal(resolved.spacing.scale, "Medium");
    assert.equal(resolved.button.style, "rounded");
    assert.equal(resolved.animation.style, "Bold");
    assert.equal(resolved.animation.entrance, "slide");
  });

  it("✅ every template library id resolves without gaps", () => {
    for (const id of THEME_PRESET_IDS) {
      const resolved = resolveThemePreset(id);
      assert.equal(resolved.id, id);
      assertThemeShape(resolved);
    }
  });

  it("✅ themeFieldsFromPreset — Website stores id only", () => {
    const fields = themeFieldsFromPreset("construction-modern");
    assert.equal(fields.id, "construction-modern");
    assert.deepEqual(Object.keys(fields), ["id"]);
  });

  it("✅ Design Tokens — semantic spacing scale, no magic px", () => {
    assert.match(DESIGN_TOKENS_RULE, /spacing\.xl/);
    assert.match(DESIGN_TOKENS_RULE, /palette\.text/);
    assert.equal(spacingRem("xl"), "1.5rem");
    assert.equal(spacing.xl.gap, "gap-6");
    assert.equal(spacingCssVars()["--spacing-xl"], "1.5rem");
    assert.equal(spacingCssVars()["--spacing-section-medium"], "3.5rem");
  });

  it("✅ Colors — full semantic palette on every preset", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.equal(theme.palette.secondary, "#ca8a04");
    assert.equal(theme.palette.background, "#ffffff");
    assert.equal(theme.palette.success, "#16a34a");
    assert.deepEqual(COLOR_TOKENS, [
      "primary",
      "secondary",
      "accent",
      "background",
      "surface",
      "text",
      "muted",
      "border",
      "success",
      "warning",
      "danger",
    ]);
  });

  it("✅ Typography — heading, body, button, small, hero roles", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.deepEqual(TYPOGRAPHY_ROLES, [
      "heading",
      "body",
      "button",
      "small",
      "hero",
    ]);
    for (const role of TYPOGRAPHY_ROLES) {
      assert.ok(theme.typography[role].className.length > 0);
      assert.ok(theme.typography[role].fontSize.endsWith("rem"));
    }
    assert.match(typographyRoleClass("hero"), /font-bold/);
    assert.match(typographyRoleClass("button"), /font-semibold/);
  });

  it("✅ Radius — none, sm, md, lg, xl, full tokens", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.deepEqual(RADIUS_TOKENS, [
      "none",
      "sm",
      "md",
      "lg",
      "xl",
      "full",
    ]);
    assert.equal(radiusRem("md"), "0.75rem");
    assert.equal(radiusClass("full"), "rounded-full");
    assert.equal(theme.radius.base, theme.radius.lg.rem);
    assert.equal(theme.radius.scale, "Medium");
  });

  it("✅ Shadow — none, soft, medium, large tokens", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.deepEqual(SHADOW_TOKENS, ["none", "soft", "medium", "large"]);
    assert.equal(shadowValue("none"), "none");
    assert.equal(shadowClass("medium"), "shadow-md");
    assert.equal(theme.shadow.soft.className, "shadow-sm");
    assert.ok(theme.button.shadow.includes("rgb"));
    assert.ok(theme.card.shadow.includes("rgb"));
  });

  it("✅ Animation — none, fade, slide, scale tokens", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.deepEqual(ANIMATION_TOKENS, ["none", "fade", "slide", "scale"]);
    assert.equal(animationClass("fade"), "animate-fade-in");
    assert.equal(theme.animation.duration, "400ms");
    assert.equal(theme.animation.entrance, "slide");
    assert.equal(theme.animation.slide.className, "animate-slide-up");
  });

  it("✅ Theme Selector AI — Industry + Brand Personality + Target Audience → preset id", async () => {
    const dna: BusinessDna = {
      industry: "Roofing",
      subcategory: "Roof repair",
      targetAudience: ["Homeowners", "Property managers"],
      customerIntent: "Get Quote",
      brandPosition: "Premium local roofer",
      brandPersonality: ["Bold", "Reliable", "Local", "Direct", "Pro"],
      tone: "bold",
      primaryGoal: "Lead",
      secondaryGoal: "Trust",
      trustSignals: ["Licensed"],
      conversionStrategy: "Get Quote",
      cta: "Get a quote",
      ctaOptions: ["Get a quote"],
      websiteStyle: "Bold Trade",
      colorDirection: "amber",
      imageDirection: "trade",
      sections: ["hero", "services"],
      seoIntent: "local",
      keywords: [],
      localSeo: [],
      advantages: [],
    };
    const brief: BusinessBrief = {
      dna,
      niche: "Roofing",
      tradeHint: "roofing",
      city: "Manchester",
      localeNote: "",
      tone: "bold",
      customerPains: [],
      uniqueAngle: "",
      serviceFocus: [],
    };

    const input = themeSelectorInputFromPipeline({
      brief,
      brandingTone: "Bold, confident, trade-forward",
    });

    assert.equal(input.industry, "Roofing");
    assert.match(input.brandPersonality, /Bold/i);
    assert.match(input.targetAudience, /Homeowners/i);

    const selected = selectThemeWithRules(input);
    assert.ok(isThemePresetId(selected.theme));
    assert.equal(
      parseAiThemeSelection({ theme: selected.theme })?.theme,
      selected.theme,
    );

    const prompt = readFileSync(themeSelectorPromptPath, "utf8");
    assert.match(prompt, /Industry:/);
    assert.match(prompt, /Brand Personality:/);
    assert.match(prompt, /Target Audience:/);
    assert.match(prompt, /"theme": "construction-modern"/);

    const qaStep = readFileSync(qaStepPath, "utf8");
    assert.match(qaStep, /runThemeSelector/);
    assert.match(qaStep, /themeSelectorInputFromPipeline/);
    assert.match(qaStep, /Theme Engine/);
  });

  it("✅ Dark Mode — every preset supports light and dark palettes", () => {
    assert.deepEqual(THEME_MODES, ["light", "dark"]);

    for (const id of THEME_PRESET_IDS) {
      const theme = resolveThemePreset(id);
      assert.equal(theme.palette.background, theme.modes.light.background);
      assert.notEqual(theme.modes.light.background, theme.modes.dark.background);
      assert.equal(theme.modes.dark.text, "#fafafa");
      assert.equal(paletteFor(theme, "dark").background, theme.modes.dark.background);
    }

    const modern = resolveThemePreset("construction-modern");
    assert.equal(modern.modes.light.background, "#ffffff");
    assert.equal(modern.modes.dark.background, "#09090b");
  });

  it("✅ Renderer CSS Variables — --primary, --background, --radius, --shadow, --font-heading", () => {
    const theme = resolveThemePreset("construction-modern");
    assert.deepEqual(RENDERER_CSS_VARS, [
      "primary",
      "background",
      "radius",
      "shadow",
      "font-heading",
    ]);
    const vars = rendererCssVars(theme);
    assert.equal(vars["--radius"], theme.radius.base);
    assert.equal(vars["--shadow"], theme.shadow.soft.value);
    assert.equal(vars["--font-heading"], theme.typography.stack);

    const injected = themeCssVars(theme);
    assert.equal(injected["--theme-light-primary"], theme.modes.light.primary);
    assert.ok(injected["--radius"]);
    assert.ok(injected["--theme-light-background"]);
  });
});
