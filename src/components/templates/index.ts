export { TemplateWebsiteView } from "./template-website-view";
export type { TemplateWebsiteViewProps } from "./template-website-view";

export {
  HeroBlock,
  NavbarBlock,
  AboutBlock,
  ServicesBlock,
  FaqBlock,
  FooterBlock,
  templateRenderData,
  lookupHeroComponent,
  resolveWebsiteHero,
  resolveWebsiteTheme,
} from "./renderer";
export type { TemplateRenderData, HeroBlockProps } from "./renderer";

export { TEMPLATE_REGISTRY, HeroRegistry, HERO_TEMPLATES } from "./registry";
export {
  ComponentRegistry,
  ComponentVariantRegistry,
  COMPONENT_REGISTRY_CHAIN,
  resolveRegisteredBlockComponent,
} from "@/components/registry";
export type { HeroProps } from "@/components/hero/types";
export * from "@/components/ui";
export * from "@/components/hero";
export * from "@/components/services";

export type {
  HeroTemplateProps,
  NavbarTemplateProps,
  AboutTemplateProps,
  ServicesTemplateProps,
  FaqTemplateProps,
  FooterTemplateProps,
} from "./types";

export {
  homePage,
  findSection,
  sectionData,
  templateBlocksFor,
  primaryColor,
  websiteHero,
  websiteAbout,
  websiteServices,
  websiteFaq,
  websiteContact,
} from "./utils";

export { Hero01 } from "@/components/hero/Hero01/Hero01";
export { Hero02 } from "@/components/hero/Hero02/Hero02";
export { Hero03 } from "@/components/hero/Hero03/Hero03";
export { Hero04 } from "@/components/hero/Hero04/Hero04";
export { Hero05 } from "@/components/hero/Hero05/Hero05";
export { Navbar01 } from "./navbar/navbar-01";
export { Navbar02 } from "./navbar/navbar-02";
export { Services01 } from "./services/services-01";
export { Services02 } from "./services/services-02";
export { Services03 } from "./services/services-03";
export { Faq01 } from "./faq/faq-01";
export { Faq02 } from "./faq/faq-02";
export { About01 } from "./about/about-01";
export { About02 } from "./about/about-02";
export { Footer01 } from "./footer/footer-01";
export { Footer02 } from "./footer/footer-02";
