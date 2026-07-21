/**
 * Component Engine — acceptance (Phase 2.2 gate)
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  FORBIDDEN_SPACING_PATTERN,
  FORBIDDEN_BREAKPOINT_PATTERN,
  FORBIDDEN_THEME_COLOR_PATTERN,
  ACCEPTANCE_CRITERIA,
  ABOUT_TEMPLATE_COMPOSITION,
  CANONICAL_PRIMITIVE_PATHS,
  COMPOSITION_SCAN_PATHS,
  COMPONENT_REGISTRY_CHAIN,
  COMPONENT_REGISTRY_RULE,
  FAQ_TEMPLATE_COMPOSITION,
  FORBIDDEN_DUPLICATE_BUTTON_PATTERN,
  FORBIDDEN_DUPLICATE_CARD_PATTERN,
  FORBIDDEN_DUPLICATE_CONTAINER_PATTERN,
  HERO_COMPONENT_SLOTS,
  HERO_TEMPLATE_COMPOSITION,
  REGISTERED_BLOCK_COMPONENTS,
  REGISTERED_VARIANT_COMPONENTS,
  RESPONSIVE_SCAN_PATHS,
  RESPONSIVE_SYSTEM_RULE,
  SERVICES_TEMPLATE_COMPOSITION,
  THEME_AWARE_UI_COMPONENTS,
  THEME_INJECTION_RULE,
  THEME_RESOLVER_PATHS,
  THEME_SCAN_PATHS,
  TEMPLATE_ID_REGISTRY_NAME,
  UI_KIT_COMPONENTS,
  heroComposition,
} from "@/lib/component-engine";
import {
  assertRegistryParity,
  ComponentRegistry,
  ComponentVariantRegistry,
  serviceCardVariantForRegistry,
} from "@/components/registry";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Footer,
  Grid,
  Heading,
  Headline,
  Icon,
  Image,
  Input,
  Logo,
  Navbar,
  Section,
  Stack,
  Subheadline,
  Text,
  Textarea,
  TrustBar,
} from "@/components/ui";
import { Hero03 } from "@/components/hero/Hero03/Hero03";

const here = dirname(fileURLToPath(import.meta.url));
const heroDir = join(here, "../../components/hero");
const uiDir = join(here, "../../components/ui");

describe("Component Engine Acceptance", () => {
  it("✅ UI Kit — canonical components exported from components/ui/", () => {
    const kit = {
      Button,
      Card,
      Section,
      Container,
      Grid,
      Stack,
      Heading,
      Text,
      Input,
      Textarea,
      Accordion,
      Navbar,
      Footer,
      Badge,
      Avatar,
      Logo,
      Icon,
    };

    assert.deepEqual(Object.keys(kit).sort(), [...UI_KIT_COMPONENTS].sort());
    assert.equal(UI_KIT_COMPONENTS.length, 17);
  });

  it("✅ UI Kit — one file per component, each tagged data-component", () => {
    const files: Record<string, string> = {
      Button: "Button.tsx",
      Card: "Card.tsx",
      Section: "Section.tsx",
      Container: "Container.tsx",
      Grid: "Grid.tsx",
      Stack: "Stack.tsx",
      Heading: "Heading.tsx",
      Text: "Text.tsx",
      Input: "Input.tsx",
      Textarea: "Textarea.tsx",
      Accordion: "Accordion.tsx",
      Navbar: "Navbar.tsx",
      Footer: "Footer.tsx",
      Badge: "Badge.tsx",
      Avatar: "Avatar.tsx",
      Logo: "Logo.tsx",
      Icon: "Icon.tsx",
    };

    for (const [name, file] of Object.entries(files)) {
      const src = readFileSync(join(uiDir, file), "utf8");
      assert.match(src, /data-component=/, `${name} must expose data-component`);
    }
  });

  it("✅ legacy hero typography still available (Headline, Subheadline)", () => {
    assert.equal(typeof Headline, "function");
    assert.equal(typeof Subheadline, "function");
    assert.equal(typeof TrustBar, "function");
    assert.equal(typeof Image, "function");
  });

  it("✅ Hero03 lives in components/hero/Hero03/ and composes ui slots", () => {
    assert.equal(typeof Hero03, "function");
    const src = readFileSync(join(heroDir, "Hero03/Hero03.tsx"), "utf8");
    assert.match(src, /@\/components\/ui/);
    assert.match(src, /Section/);
    assert.match(src, /Container/);
    assert.match(src, /Headline/);
    assert.match(src, /Subheadline/);
    assert.doesNotMatch(src, /<h1 className/);

    assert.deepEqual(heroComposition("hero-03"), [
      "Section",
      "Container",
      "Headline",
      "Subheadline",
      "CTAGroup",
      "Button",
    ]);
  });

  it("✅ every hero template folder composes ui + hero/components", () => {
    for (const id of Object.keys(HERO_TEMPLATE_COMPOSITION)) {
      const folder = id.replace("hero-", "Hero");
      const file = join(heroDir, `${folder}/${folder}.tsx`);
      const src = readFileSync(file, "utf8");
      assert.match(src, /@\/components\/ui/);
      assert.ok(heroComposition(id).length > 0);
    }
  });

  it("✅ faq-01 composes ui Accordion instead of inline markup", () => {
    const src = readFileSync(
      join(here, "../../components/templates/faq/faq-01.tsx"),
      "utf8",
    );
    assert.match(src, /Accordion/);
    assert.match(src, /AccordionItem/);
    assert.doesNotMatch(src, /useState/);
  });

  it("✅ Button variant system — primary, secondary, ghost", () => {
    const buttonSrc = readFileSync(join(uiDir, "Button.tsx"), "utf8");
    const variantsSrc = readFileSync(join(uiDir, "button-variants.ts"), "utf8");
    const themeContextSrc = readFileSync(join(uiDir, "theme-context.tsx"), "utf8");

    assert.match(buttonSrc, /data-variant=/);
    assert.match(buttonSrc, /useTheme\(\)/);
    assert.doesNotMatch(buttonSrc, /\btheme:\s*Theme/);
    assert.match(themeContextSrc, /ThemeProvider/);
    assert.match(variantsSrc, /primary/);
    assert.match(variantsSrc, /secondary/);
    assert.match(variantsSrc, /ghost/);

    for (const variant of ["primary", "secondary", "ghost"] as const) {
      assert.match(variantsSrc, new RegExp(`"${variant}"`));
    }
  });

  it("✅ Design Tokens — UI Kit files use tokens, not magic spacing utilities", () => {
    const uiFiles = readdirSync(uiDir).filter(
      (name) => name.endsWith(".tsx") && name !== "tokens.ts",
    );

    for (const file of uiFiles) {
      const src = readFileSync(join(uiDir, file), "utf8");
      assert.doesNotMatch(
        src,
        FORBIDDEN_SPACING_PATTERN,
        `${file} must use design tokens instead of raw spacing utilities`,
      );
    }

    const tokensSrc = readFileSync(join(uiDir, "tokens.ts"), "utf8");
    assert.match(tokensSrc, /export const spacing/);
    assert.match(tokensSrc, /export const padding/);
    assert.match(tokensSrc, /@\/theme\/tokens\/spacing/);
    assert.match(tokensSrc, /@\/theme\/tokens\/radius/);
    assert.match(tokensSrc, /@\/theme\/tokens\/shadow/);
    assert.match(tokensSrc, /@\/theme\/tokens\/animation/);
    assert.match(tokensSrc, /export const shadow/);
    assert.match(tokensSrc, /export const animation/);

    const engineHeroDir = join(here, "../../components/templates/engine/hero");
    for (const file of readdirSync(engineHeroDir).filter((n) => n.endsWith(".tsx"))) {
      const src = readFileSync(join(engineHeroDir, file), "utf8");
      assert.doesNotMatch(
        src,
        FORBIDDEN_SPACING_PATTERN,
        `engine/hero/${file} must use design tokens instead of raw spacing utilities`,
      );
    }
  });

  it("✅ ServiceCard system — variants 1–3, AI picks template id only", () => {
    const servicesDir = join(here, "../../components/services");
    const cardSrc = readFileSync(join(servicesDir, "components/ServiceCard.tsx"), "utf8");
    const variantsSrc = readFileSync(join(servicesDir, "service-card-variants.ts"), "utf8");
    const sectionSrc = readFileSync(join(servicesDir, "ServicesSection.tsx"), "utf8");

    assert.match(cardSrc, /data-component="ServiceCard"/);
    assert.match(cardSrc, /data-variant=/);
    assert.match(variantsSrc, /"services-01": "1"/);
    assert.match(variantsSrc, /"services-02": "2"/);
    assert.match(variantsSrc, /"services-03": "3"/);
    assert.match(sectionSrc, /ServiceCard/);
    assert.doesNotMatch(sectionSrc, /ServiceIcon name=\{service\.icon\}/);
  });

  it("✅ Section Wrapper — every block template uses Section id + Container", () => {
    const sectionTemplates = [
      join(here, "../../components/templates/about/about-01.tsx"),
      join(here, "../../components/templates/about/about-02.tsx"),
      join(here, "../../components/services/ServicesSection.tsx"),
      join(here, "../../components/templates/faq/faq-01.tsx"),
      join(here, "../../components/templates/faq/faq-02.tsx"),
    ];

    for (const id of Object.keys(HERO_TEMPLATE_COMPOSITION)) {
      const folder = id.replace("hero-", "Hero");
      sectionTemplates.push(join(heroDir, `${folder}/${folder}.tsx`));
    }

    for (const file of sectionTemplates) {
      const src = readFileSync(file, "utf8");
      assert.match(src, /<Section[\s\S]*id="/, `${file} must use Section with id`);
      assert.match(src, /<Container/, `${file} must wrap content in Container`);
      assert.doesNotMatch(src, /<section[\s>]/, `${file} must not use raw <section>`);
    }
  });

  it("✅ Theme Injection — colors resolved at ThemeProvider, not in templates", () => {
    const viewSrc = readFileSync(
      join(here, "../../components/templates/template-website-view.tsx"),
      "utf8",
    );
    assert.match(viewSrc, /ThemeProvider/);
    assert.match(viewSrc, /theme=\{website\.theme\}/);
    assert.equal(THEME_INJECTION_RULE.includes("--primary"), true);

    const rendererSrc = readFileSync(
      join(here, "../../components/templates/renderer.tsx"),
      "utf8",
    );
    assert.match(rendererSrc, /resolveWebsiteRendererVars/);

    const tokensSrc = readFileSync(join(uiDir, "semantic-css.ts"), "utf8");
    assert.match(tokensSrc, /export const css/);
    assert.match(tokensSrc, /var\(--primary\)/);

    const isThemeResolver = (file: string) => {
      const normalized = file.replace(/\\/g, "/");
      return THEME_RESOLVER_PATHS.some((rel) => normalized.endsWith(rel));
    };

    const scanRoots = THEME_SCAN_PATHS.map((rel) => join(here, "../..", rel));

    for (const root of scanRoots) {
      const files =
        root.endsWith(".tsx")
          ? [root]
          : readdirSync(root, { recursive: true }).filter(
              (name): name is string =>
                typeof name === "string" && name.endsWith(".tsx"),
            ).map((name) => join(root, name));

      for (const file of files) {
        if (isThemeResolver(file)) continue;

        const src = readFileSync(file, "utf8");
        assert.doesNotMatch(
          src,
          FORBIDDEN_THEME_COLOR_PATTERN,
          `${file} must receive injected theme — ${THEME_INJECTION_RULE}`,
        );
      }
    }
  });

  it("✅ Responsive System — breakpoints only in responsive.ts", () => {
    const responsiveSrc = readFileSync(join(uiDir, "responsive.ts"), "utf8");
    assert.match(responsiveSrc, /export function responsive/);
    assert.match(responsiveSrc, /VIEWPORTS/);
    assert.equal(RESPONSIVE_SYSTEM_RULE.includes("sm:/md:/lg:"), true);

    const scanRoots = RESPONSIVE_SCAN_PATHS.map((rel) => join(here, "../..", rel));

    for (const root of scanRoots) {
      const files =
        root.endsWith(".tsx")
          ? [root]
          : readdirSync(root, { recursive: true }).filter(
              (name): name is string =>
                typeof name === "string" && name.endsWith(".tsx"),
            ).map((name) => join(root, name));

      for (const file of files) {
        const src = readFileSync(file, "utf8");
        assert.doesNotMatch(
          src,
          FORBIDDEN_BREAKPOINT_PATTERN,
          `${file} must use responsive presets — ${RESPONSIVE_SYSTEM_RULE}`,
        );
      }
    }
  });

  it("✅ Component Registry — Hero03, ServiceCard02, FAQAccordion01", () => {
    const registrySrc = readFileSync(join(here, "../../components/registry.ts"), "utf8");

    assert.match(registrySrc, /export const ComponentRegistry/);
    assert.match(registrySrc, /export const ComponentVariantRegistry/);
    assert.deepEqual([...COMPONENT_REGISTRY_CHAIN], ["Hero03", "ServiceCard02", "FAQAccordion01"]);
    assert.equal(typeof ComponentRegistry.Hero03, "function");
    assert.equal(typeof ComponentRegistry.FAQAccordion01, "function");
    assert.equal(typeof ComponentRegistry.ServiceCard, "function");
    assert.equal(ComponentVariantRegistry.ServiceCard02.variant, "2");
    assert.equal(ComponentVariantRegistry.ServiceCard02.templateId, "services-02");
    assert.equal(serviceCardVariantForRegistry("ServiceCard02"), "2");
    assert.equal(TEMPLATE_ID_REGISTRY_NAME["hero-03"], "Hero03");
    assert.equal(TEMPLATE_ID_REGISTRY_NAME["faq-01"], "FAQAccordion01");
    assert.equal(TEMPLATE_ID_REGISTRY_NAME["services-02"], "Services02");
    assert.deepEqual([...REGISTERED_BLOCK_COMPONENTS].sort(), [
      ...Object.keys(ComponentRegistry).sort(),
    ]);
    assert.deepEqual([...REGISTERED_VARIANT_COMPONENTS], [
      ...Object.keys(ComponentVariantRegistry),
    ]);
    assert.doesNotThrow(() => assertRegistryParity());

    const rendererSrc = readFileSync(
      join(here, "../../components/templates/renderer.tsx"),
      "utf8",
    );
    assert.match(rendererSrc, /resolveRegisteredBlockComponent/);
    assert.equal(COMPONENT_REGISTRY_RULE.includes("ComponentRegistry"), true);
  });

  it("✅ hero slot catalog matches architecture", () => {
    assert.ok(HERO_COMPONENT_SLOTS.includes("Section"));
    assert.ok(HERO_COMPONENT_SLOTS.includes("Container"));
    assert.ok(HERO_COMPONENT_SLOTS.includes("Image"));
  });
});

describe("Acceptance Criteria — Phase 2.2 gate", () => {
  const uiDir = join(here, "../../components/ui");

  function scanCompositionFiles(): string[] {
    const roots = COMPOSITION_SCAN_PATHS.map((rel) => join(here, "../..", rel));
    const files: string[] = [];

    for (const root of roots) {
      if (root.endsWith(".tsx")) {
        files.push(root);
        continue;
      }

      for (const name of readdirSync(root, { recursive: true })) {
        if (typeof name === "string" && name.endsWith(".tsx")) {
          files.push(join(root, name));
        }
      }
    }

    return files;
  }

  function assertCompositionSlots(
    file: string,
    slots: readonly string[],
    label: string,
  ) {
    const src = readFileSync(file, "utf8");
    for (const slot of slots) {
      if (slot === "Button" && src.includes("CTAGroup")) {
        continue;
      }
      assert.match(src, new RegExp(slot), `${label} must compose ui ${slot}`);
    }
    assert.match(src, /@\/components\/ui/, `${label} must import from ui kit`);
  }

  it("✅ Hero складається з маленьких компонентів", () => {
    assert.equal(ACCEPTANCE_CRITERIA.length, 8);

    for (const id of Object.keys(HERO_TEMPLATE_COMPOSITION)) {
      const folder = id.replace("hero-", "Hero");
      const file = join(heroDir, `${folder}/${folder}.tsx`);
      assertCompositionSlots(file, heroComposition(id), id);
    }
  });

  it("✅ About складається з маленьких компонентів", () => {
    for (const [id, slots] of Object.entries(ABOUT_TEMPLATE_COMPOSITION)) {
      const file = join(here, `../../components/templates/about/${id}.tsx`);
      assertCompositionSlots(file, slots, id);
    }
  });

  it("✅ Services складається з маленьких компонентів", () => {
    const sectionSrc = readFileSync(
      join(here, "../../components/services/ServicesSection.tsx"),
      "utf8",
    );
    assert.match(sectionSrc, /ServiceCard/);
    assert.match(sectionSrc, /<Section[\s\S]*id="services"/);

    for (const [id, slots] of Object.entries(SERVICES_TEMPLATE_COMPOSITION)) {
      for (const slot of slots) {
        assert.ok(
          sectionSrc.includes(slot) || slot === "Card",
          `services section must compose ${slot} for ${id}`,
        );
      }
    }

    const cardSrc = readFileSync(
      join(here, "../../components/services/components/ServiceCard.tsx"),
      "utf8",
    );
    assert.match(cardSrc, /<Card/);
    assert.match(cardSrc, /useThemeStyle/);
  });

  it("✅ FAQ складається з маленьких компонентів", () => {
    for (const [id, slots] of Object.entries(FAQ_TEMPLATE_COMPOSITION)) {
      const file = join(here, `../../components/templates/faq/${id}.tsx`);
      assertCompositionSlots(file, slots, id);
    }
  });

  it("✅ Немає дублювання Button / Card / Container", () => {
    const primitiveFiles = Object.values(CANONICAL_PRIMITIVE_PATHS).map((rel) =>
      join(here, "../..", rel),
    );

    assert.equal(primitiveFiles.length, 3);
    assert.ok(primitiveFiles.every((file) => existsSync(file)));

    for (const file of scanCompositionFiles()) {
      const normalized = file.replace(/\\/g, "/");
      if (primitiveFiles.some((allowed) => normalized.endsWith(allowed.replace(/\\/g, "/")))) {
        continue;
      }

      const src = readFileSync(file, "utf8");
      assert.doesNotMatch(
        src,
        FORBIDDEN_DUPLICATE_BUTTON_PATTERN,
        `${file} must use ui/Button — no inline CTA markup`,
      );
      assert.doesNotMatch(
        src,
        FORBIDDEN_DUPLICATE_CARD_PATTERN,
        `${file} must use ui/Card — no inline card surfaces`,
      );
      assert.doesNotMatch(
        src,
        FORBIDDEN_DUPLICATE_CONTAINER_PATTERN,
        `${file} must use ui/Container — no inline mx-auto max-w-*`,
      );
    }
  });

  it("✅ Усі компоненти підтримують Theme", () => {
    const viewSrc = readFileSync(
      join(here, "../../components/templates/template-website-view.tsx"),
      "utf8",
    );
    assert.match(viewSrc, /ThemeProvider/);

    for (const name of THEME_AWARE_UI_COMPONENTS) {
      const src = readFileSync(join(uiDir, `${name}.tsx`), "utf8");
      assert.match(
        src,
        /useTheme|useThemeStyle|semantic-css|css\.|var\(--primary\)/,
        `${name} must consume injected theme`,
      );
    }

    for (const file of scanCompositionFiles()) {
      const src = readFileSync(file, "utf8");
      assert.doesNotMatch(
        src,
        FORBIDDEN_THEME_COLOR_PATTERN,
        `${file} must not resolve colors locally`,
      );
    }
  });
});
