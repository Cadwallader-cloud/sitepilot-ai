/**
 * Template Engine — Acceptance Criteria (gate before next phase)
 *
 * ✅ Hero більше не генерується як HTML
 * ✅ Hero рендериться React-компонентом
 * ✅ Registry працює
 * ✅ Template Selector працює
 * ✅ AI може вибрати лише існуючі шаблони
 * ✅ Додавання нового Hero = .tsx + запис у Registry
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { HeroRegistry } from "@/components/hero/registry";
import { ComponentRegistry, assertRegistryParity } from "@/components/registry";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";
import { HeroBlock } from "@/components/templates/renderer";
import {
  runTemplateSelector,
  templateSelectorInputFromPipeline,
} from "@/lib/ai-engine/template-selector-ai";
import {
  enforceTemplateCatalog,
  findInvalidTemplatePicks,
  getTemplateMetadata,
  HERO_TEMPLATE_IDS,
  parseAiTemplateSelection,
  TEMPLATE_METADATA,
  templateMetadataCatalogForPrompt,
} from "@/lib/template-engine";
import { HeroSchema } from "@/lib/validation/hero";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const heroDir = join(repoRoot, "src/components/hero");

function heroTemplatePath(id: string): string {
  const folder = id.replace("hero-", "Hero");
  return join(heroDir, `${folder}/${folder}.tsx`);
}
const qaStepPath = join(repoRoot, "src/lib/ai/orchestrator/steps/qa.step.ts");
const heroPromptPath = join(repoRoot, "src/lib/ai-engine/prompts/hero.ts");
const templateSelectorPromptPath = join(
  repoRoot,
  "src/lib/ai-engine/prompts/template-selector-ai.ts",
);

describe("Template Engine Acceptance Criteria", () => {
  it("✅ Hero більше не генерується як HTML — лише JSON copy fields", () => {
    const heroPrompt = readFileSync(heroPromptPath, "utf8");
    assert.match(heroPrompt, /Never HTML/i);
    assert.match(heroPrompt, /Never return HTML/i);

    const parsed = HeroSchema.safeParse({
      headline: "Roof Repairs Built for Manchester Weather",
      subheadline:
        "Licensed local roofers fixing leaks and storm damage with clear quotes and fast response across Greater Manchester.",
      primaryCTA: "Get a free quote",
      secondaryCTA: "Call today",
      trustBar: ["Licensed", "Insured", "Local"],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      const keys = Object.keys(parsed.data);
      assert.ok(!keys.some((k) => /html|markup|component/i.test(k)));
      assert.ok(keys.includes("headline"));
      assert.ok(keys.includes("subheadline"));
    }

    const templateSelectorPrompt = readFileSync(templateSelectorPromptPath, "utf8");
    assert.match(templateSelectorPrompt, /Never invent ids/i);
    assert.match(templateSelectorPrompt, /metadata/i);
  });

  it("✅ Hero рендериться React-компонентом через HeroBlock + HeroRegistry", () => {
    assert.equal(typeof HeroBlock, "function");
    assert.equal(typeof HeroRegistry["hero-01"], "function");
    assert.equal(typeof HeroRegistry["hero-03"], "function");

    for (const id of HERO_TEMPLATE_IDS) {
      const file = heroTemplatePath(id);
      assert.ok(existsSync(file), `missing React hero component ${file}`);
      const src = readFileSync(file, "utf8");
      assert.match(src, /HeroProps/);
      assert.match(src, /export function Hero/);
    }
  });

  it("✅ Registry працює — кожен catalog id має React component", () => {
    assert.doesNotThrow(() => assertRegistryParity());
    assert.equal(ComponentRegistry.Hero03, HeroRegistry["hero-03"]);
    assert.equal(Object.keys(HeroRegistry).length, HERO_TEMPLATE_IDS.length);
    for (const id of HERO_TEMPLATE_IDS) {
      assert.ok(HeroRegistry[id], `HeroRegistry missing ${id}`);
      assert.equal(TEMPLATE_REGISTRY.hero[id], HeroRegistry[id]);
    }
  });

  it("✅ Template Selector працює — модуль, prompt metadata, QA step wired", () => {
    assert.equal(typeof runTemplateSelector, "function");
    assert.equal(typeof templateSelectorInputFromPipeline, "function");

    const metadataJson = templateMetadataCatalogForPrompt();
    assert.match(metadataJson, /"hero-01"/);
    assert.match(metadataJson, /"industries"/);
    assert.equal(TEMPLATE_METADATA.length, 16);

    const qaStep = readFileSync(qaStepPath, "utf8");
    assert.match(qaStep, /runTemplateSelector/);
    assert.match(qaStep, /templateSelectorInputFromPipeline/);
    assert.match(qaStep, /Template Selector/);
  });

  it("✅ AI може вибрати лише існуючі шаблони — hero-92 відхилено", () => {
    const rejected = findInvalidTemplatePicks({
      hero: "hero-92",
      services: "services-01",
      faq: "faq-02",
    });
    assert.deepEqual(rejected, [{ kind: "hero", id: "hero-92" }]);

    const { blocks } = enforceTemplateCatalog({
      hero: "hero-92",
      services: "services-01",
      faq: "faq-02",
    });
    assert.ok(HERO_TEMPLATE_IDS.includes(blocks.hero));
    assert.equal(blocks.services, "services-01");
    assert.equal(blocks.faq, "faq-02");

    const normalized = parseAiTemplateSelection({
      hero: "hero-03",
      services: "services-01",
      faq: "faq-02",
    });
    assert.equal(normalized.hero, "hero-03");
    assert.ok(getTemplateMetadata("hero-03"));
  });

  it("✅ Додавання нового Hero = HeroXX/HeroXX.tsx + Registry + metadata + ids", () => {
    const heroFolders = readdirSync(heroDir).filter((name) => /^Hero\d+$/.test(name));
    assert.equal(heroFolders.length, HERO_TEMPLATE_IDS.length);

    const registrySrc = readFileSync(join(heroDir, "registry.ts"), "utf8");
    for (const id of HERO_TEMPLATE_IDS) {
      assert.match(registrySrc, new RegExp(`"${id}"`));
      assert.ok(getTemplateMetadata(id), `add metadata for ${id} in metadata.ts`);
      assert.ok(existsSync(heroTemplatePath(id)));
    }

    assert.match(registrySrc, /Record<HeroTemplateId/);
    assert.match(registrySrc, /HeroProps/);
  });
});
