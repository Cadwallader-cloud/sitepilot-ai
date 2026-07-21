import type { ComponentType } from "react";
import type {
  AboutTemplateId,
  FaqTemplateId,
  FooterTemplateId,
  NavbarTemplateId,
} from "@/lib/template-engine";
import { About01 } from "./about/about-01";
import { About02 } from "./about/about-02";
import { Faq01 } from "./faq/faq-01";
import { Faq02 } from "./faq/faq-02";
import { Footer01 } from "./footer/footer-01";
import { Footer02 } from "./footer/footer-02";
import { HeroRegistry } from "@/components/hero/registry";
import { Navbar01 } from "./navbar/navbar-01";
import { Navbar02 } from "./navbar/navbar-02";
import { ServicesRegistry } from "@/components/services/registry";
import type {
  AboutTemplateProps,
  FaqTemplateProps,
  FooterTemplateProps,
  NavbarTemplateProps,
} from "./types";

export { HeroRegistry } from "@/components/hero/registry";

/** @deprecated Use HeroRegistry */
export const HERO_TEMPLATES = HeroRegistry;

export const NAVBAR_TEMPLATES: Record<
  NavbarTemplateId,
  ComponentType<NavbarTemplateProps>
> = {
  "navbar-01": Navbar01,
  "navbar-02": Navbar02,
};

export const SERVICES_TEMPLATES = ServicesRegistry;

export { ServicesRegistry } from "@/components/services/registry";

export const FAQ_TEMPLATES: Record<FaqTemplateId, ComponentType<FaqTemplateProps>> = {
  "faq-01": Faq01,
  "faq-02": Faq02,
};

export const ABOUT_TEMPLATES: Record<
  AboutTemplateId,
  ComponentType<AboutTemplateProps>
> = {
  "about-01": About01,
  "about-02": About02,
};

export const FOOTER_TEMPLATES: Record<
  FooterTemplateId,
  ComponentType<FooterTemplateProps>
> = {
  "footer-01": Footer01,
  "footer-02": Footer02,
};

export const TEMPLATE_REGISTRY = {
  hero: HeroRegistry,
  navbar: NAVBAR_TEMPLATES,
  services: SERVICES_TEMPLATES,
  faq: FAQ_TEMPLATES,
  about: ABOUT_TEMPLATES,
  footer: FOOTER_TEMPLATES,
} as const;

export {
  assertRegistryParity,
  ComponentRegistry,
  ComponentVariantRegistry,
  COMPONENT_REGISTRY_CHAIN,
  COMPONENT_REGISTRY_RULE,
  registryComponent,
  registryNameForTemplateId,
  registryVariant,
  resolveRegisteredBlockComponent,
  TEMPLATE_ID_REGISTRY_NAME,
} from "@/components/registry";
