import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_TEMPLATE_BLOCKS } from "./defaults";
import {
  ABOUT_TEMPLATE_IDS,
  FAQ_TEMPLATE_IDS,
  FOOTER_TEMPLATE_IDS,
  HERO_TEMPLATE_IDS,
  NAVBAR_TEMPLATE_IDS,
  SERVICES_TEMPLATE_IDS,
} from "./ids";
import { getTemplateMetadata, TEMPLATE_METADATA } from "./metadata";
import { parseAiTemplateSelection } from "./parse-ai-template";
import {
  enforceTemplateCatalog,
  findInvalidTemplatePicks,
  isValidTemplateBlockId,
} from "./template-rules";
import {
  normalizeTemplateBlocks,
  selectTemplateBlocks,
} from "./select-blocks";

describe("Template Engine", () => {
  it("selectTemplateBlocks returns valid catalog IDs", () => {
    const blocks = selectTemplateBlocks({
      templateId: "construction-premium",
      variant: "B",
    });

    assert.ok(HERO_TEMPLATE_IDS.includes(blocks.hero));
    assert.ok(NAVBAR_TEMPLATE_IDS.includes(blocks.navbar));
    assert.ok(SERVICES_TEMPLATE_IDS.includes(blocks.services));
    assert.ok(FAQ_TEMPLATE_IDS.includes(blocks.faq));
    assert.ok(ABOUT_TEMPLATE_IDS.includes(blocks.about));
    assert.ok(FOOTER_TEMPLATE_IDS.includes(blocks.footer));
  });

  it("variant A/B/C maps to distinct hero shells", () => {
    const a = selectTemplateBlocks({ templateId: "dentist-premium", variant: "A" });
    const b = selectTemplateBlocks({ templateId: "dentist-premium", variant: "B" });
    const c = selectTemplateBlocks({ templateId: "dentist-premium", variant: "C" });

    assert.equal(a.hero, "hero-01");
    assert.equal(b.hero, "hero-02");
    assert.equal(c.hero, "hero-03");
  });

  it("normalizeTemplateBlocks falls back to defaults for invalid picks", () => {
    const normalized = normalizeTemplateBlocks({
      hero: "hero-99",
      navbar: "navbar-01",
      services: "services-02",
      faq: "invalid",
      about: "about-02",
      footer: "footer-02",
    });

    assert.equal(normalized.hero, DEFAULT_TEMPLATE_BLOCKS.hero);
    assert.equal(normalized.navbar, "navbar-01");
    assert.equal(normalized.services, "services-02");
    assert.equal(normalized.faq, DEFAULT_TEMPLATE_BLOCKS.faq);
    assert.equal(normalized.about, "about-02");
    assert.equal(normalized.footer, "footer-02");
  });

  it("parseAiTemplateSelection accepts AI template JSON shape", () => {
    const blocks = parseAiTemplateSelection({
      template: {
        hero: "hero-03",
        about: "about-02",
        services: "services-01",
        faq: "faq-02",
        footer: "footer-01",
      },
    });

    assert.equal(blocks.hero, "hero-03");
    assert.equal(blocks.about, "about-02");
    assert.equal(blocks.services, "services-01");
    assert.equal(blocks.faq, "faq-02");
    assert.equal(blocks.footer, "footer-01");
    assert.equal(blocks.navbar, DEFAULT_TEMPLATE_BLOCKS.navbar);
  });

  it("rejects invented template ids like hero-92", () => {
    const rejected = findInvalidTemplatePicks({
      template: {
        hero: "hero-92",
        about: "about-02",
        services: "services-01",
        faq: "faq-02",
        footer: "footer-01",
      },
    });

    assert.deepEqual(rejected, [{ kind: "hero", id: "hero-92" }]);

    const { blocks } = enforceTemplateCatalog({
      template: {
        hero: "hero-92",
        about: "about-02",
        services: "services-01",
        faq: "faq-02",
        footer: "footer-01",
      },
    });

    assert.equal(blocks.hero, DEFAULT_TEMPLATE_BLOCKS.hero);
    assert.equal(blocks.about, "about-02");
    assert.ok(isValidTemplateBlockId("hero", "hero-03"));
    assert.ok(!isValidTemplateBlockId("hero", "hero-92"));
  });

  it("parseAiTemplateSelection accepts flat Template Selector output", () => {
    const blocks = parseAiTemplateSelection({
      hero: "hero-03",
      services: "services-01",
      faq: "faq-02",
    });

    assert.equal(blocks.hero, "hero-03");
    assert.equal(blocks.services, "services-01");
    assert.equal(blocks.faq, "faq-02");
    assert.equal(blocks.about, DEFAULT_TEMPLATE_BLOCKS.about);
    assert.equal(blocks.footer, DEFAULT_TEMPLATE_BLOCKS.footer);
  });

  it("template metadata covers every catalog id", () => {
    assert.equal(TEMPLATE_METADATA.length, 16);
    for (const id of HERO_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }
    for (const id of SERVICES_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }
    for (const id of ABOUT_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }
    for (const id of FAQ_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }
    for (const id of FOOTER_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }
    for (const id of NAVBAR_TEMPLATE_IDS) {
      assert.ok(getTemplateMetadata(id), `missing metadata for ${id}`);
    }

    const hero03 = getTemplateMetadata("hero-03");
    assert.equal(hero03?.style, "bold");
    assert.equal(hero03?.layout, "centered");
    assert.ok(hero03?.industries.includes("roofing"));
  });
});
