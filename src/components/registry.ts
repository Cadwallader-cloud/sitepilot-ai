/**
 * Component Registry — every renderable block + variant sub-component is registered.
 *
 * Flow: ComponentRegistry → Hero03 → ServiceCard02 → FAQAccordion01
 */

import type { ComponentType } from "react";
import type {
  AboutTemplateId,
  FaqTemplateId,
  FooterTemplateId,
  HeroTemplateId,
  NavbarTemplateId,
  ServicesTemplateId,
  TemplateBlockKind,
  TemplateBlocks,
} from "@/lib/template-engine";
import { Hero01 } from "@/components/hero/Hero01/Hero01";
import { Hero02 } from "@/components/hero/Hero02/Hero02";
import { Hero03 } from "@/components/hero/Hero03/Hero03";
import { Hero04 } from "@/components/hero/Hero04/Hero04";
import { Hero05 } from "@/components/hero/Hero05/Hero05";
import { HeroRegistry } from "@/components/hero/registry";
import type { HeroProps } from "@/components/hero/types";
import { ServiceCard } from "@/components/services/components/ServiceCard";
import {
  SERVICE_CARD_VARIANT_BY_TEMPLATE,
  type ServiceCardVariant,
} from "@/components/services/service-card-variants";
import { Services01, Services02, Services03 } from "@/components/services/registry";
import { About01 } from "@/components/templates/about/about-01";
import { About02 } from "@/components/templates/about/about-02";
import { Faq01 } from "@/components/templates/faq/faq-01";
import { Faq02 } from "@/components/templates/faq/faq-02";
import { Footer01 } from "@/components/templates/footer/footer-01";
import { Footer02 } from "@/components/templates/footer/footer-02";
import { Navbar01 } from "@/components/templates/navbar/navbar-01";
import { Navbar02 } from "@/components/templates/navbar/navbar-02";
import type {
  AboutTemplateProps,
  FaqTemplateProps,
  FooterTemplateProps,
  NavbarTemplateProps,
  ServicesTemplateProps,
} from "@/components/templates/types";

export const COMPONENT_REGISTRY_RULE =
  "Every block template and variant sub-component must be registered in ComponentRegistry." as const;

/** PascalCase registry — one entry per renderable template component. */
export const ComponentRegistry = {
  Hero01,
  Hero02,
  Hero03,
  Hero04,
  Hero05,
  Navbar01,
  Navbar02,
  Services01,
  Services02,
  Services03,
  About01,
  About02,
  Footer01,
  Footer02,
  FAQAccordion01: Faq01,
  FAQGrid01: Faq02,
  ServiceCard,
} as const;

export type RegistryComponentName = keyof typeof ComponentRegistry;

/** Variant sub-components — ServiceCard02 → ServiceCard variant "2". */
export const ComponentVariantRegistry = {
  ServiceCard01: {
    component: "ServiceCard",
    variant: "1",
    templateId: "services-01",
  },
  ServiceCard02: {
    component: "ServiceCard",
    variant: "2",
    templateId: "services-02",
  },
  ServiceCard03: {
    component: "ServiceCard",
    variant: "3",
    templateId: "services-03",
  },
} as const satisfies Record<
  string,
  {
    component: "ServiceCard";
    variant: ServiceCardVariant;
    templateId: ServicesTemplateId;
  }
>;

export type RegistryVariantName = keyof typeof ComponentVariantRegistry;

/** AI catalog id → PascalCase registry name. */
export const TEMPLATE_ID_REGISTRY_NAME = {
  "hero-01": "Hero01",
  "hero-02": "Hero02",
  "hero-03": "Hero03",
  "hero-04": "Hero04",
  "hero-05": "Hero05",
  "navbar-01": "Navbar01",
  "navbar-02": "Navbar02",
  "services-01": "Services01",
  "services-02": "Services02",
  "services-03": "Services03",
  "about-01": "About01",
  "about-02": "About02",
  "footer-01": "Footer01",
  "footer-02": "Footer02",
  "faq-01": "FAQAccordion01",
  "faq-02": "FAQGrid01",
} as const satisfies Record<
  | HeroTemplateId
  | NavbarTemplateId
  | ServicesTemplateId
  | AboutTemplateId
  | FooterTemplateId
  | FaqTemplateId,
  RegistryComponentName
>;

export type TemplateIdRegistryName = keyof typeof TEMPLATE_ID_REGISTRY_NAME;

/** Documented resolution chain — block → card variant → FAQ accordion. */
export const COMPONENT_REGISTRY_CHAIN = [
  "Hero03",
  "ServiceCard02",
  "FAQAccordion01",
] as const satisfies readonly (RegistryComponentName | RegistryVariantName)[];

export function registryComponent(name: RegistryComponentName): (typeof ComponentRegistry)[RegistryComponentName] {
  return ComponentRegistry[name];
}

export function registryVariant(name: RegistryVariantName) {
  return ComponentVariantRegistry[name];
}

export function registryNameForTemplateId(
  templateId: TemplateIdRegistryName,
): RegistryComponentName {
  return TEMPLATE_ID_REGISTRY_NAME[templateId];
}

type BlockPropsMap = {
  hero: HeroProps;
  navbar: NavbarTemplateProps;
  services: ServicesTemplateProps;
  faq: FaqTemplateProps;
  about: AboutTemplateProps;
  footer: FooterTemplateProps;
};

/** Resolve a registered block component by AI template kind + id. */
export function resolveRegisteredBlockComponent<K extends TemplateBlockKind>(
  kind: K,
  id: TemplateBlocks[K],
): ComponentType<BlockPropsMap[K]> {
  const name = registryNameForTemplateId(id as TemplateIdRegistryName);
  const component = ComponentRegistry[name];

  if (kind === "hero") {
    return component as ComponentType<BlockPropsMap[K]>;
  }

  return component as ComponentType<BlockPropsMap[K]>;
}

/** Verify HeroRegistry parity — kebab id map stays aligned with PascalCase registry. */
export function heroRegistryEntry(id: HeroTemplateId): ComponentType<HeroProps> {
  const name = registryNameForTemplateId(id);
  return ComponentRegistry[name] as ComponentType<HeroProps>;
}

export function serviceCardVariantForRegistry(name: RegistryVariantName): ServiceCardVariant {
  return ComponentVariantRegistry[name].variant;
}

export function assertRegistryParity(): void {
  for (const [id, component] of Object.entries(HeroRegistry) as [HeroTemplateId, ComponentType<HeroProps>][]) {
    const name = registryNameForTemplateId(id);
    if (ComponentRegistry[name] !== component) {
      throw new Error(`ComponentRegistry.${name} must match HeroRegistry["${id}"]`);
    }
  }

  for (const [variantName, entry] of Object.entries(ComponentVariantRegistry) as [
    RegistryVariantName,
    (typeof ComponentVariantRegistry)[RegistryVariantName],
  ][]) {
    if (SERVICE_CARD_VARIANT_BY_TEMPLATE[entry.templateId] !== entry.variant) {
      throw new Error(
        `ComponentVariantRegistry.${variantName} variant must match services template ${entry.templateId}`,
      );
    }
  }
}
