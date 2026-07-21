import type { ReactNode } from "react";
import type { About, FAQ, Hero, Service, Theme, Website } from "@/lib/website";
import type { TemplateBlocks } from "@/lib/template-engine";
import { DEFAULT_TEMPLATE_BLOCKS } from "@/lib/template-engine/defaults";
import { responsiveVisibility } from "@/components/ui";
import { resolveRegisteredBlockComponent } from "@/components/registry";
import { HeroRegistry } from "./registry";
import {
  findSection,
  sectionData,
  templateBlocksFor,
  websiteAbout,
  websiteContact,
  websiteFaq,
  websiteHero,
  websiteServices,
} from "./utils";

/** AI template picks — same shape as OpenAI `{ template: { hero, ... } }`. */
export type TemplateRenderData = {
  template: TemplateBlocks;
};

export function templateRenderData(website: Website): TemplateRenderData {
  return { template: templateBlocksFor(website) };
}

export type HeroBlockProps = {
  data: TemplateRenderData;
  website: Website;
};

export function HeroBlock({ data, website }: HeroBlockProps) {
  const heroId = HeroRegistry[data.template.hero]
    ? data.template.hero
    : DEFAULT_TEMPLATE_BLOCKS.hero;
  const HeroComponent = resolveRegisteredBlockComponent("hero", heroId);
  const hero = websiteHero(website);

  if (!hero) return null;

  return <HeroComponent hero={hero} />;
}

export type NavbarBlockProps = {
  data: TemplateRenderData;
  website: Website;
  businessName: string;
  phoneLink: (className: string, label?: string) => ReactNode;
  addressLink: (className: string, label?: string) => ReactNode;
};

export function NavbarBlock({
  data,
  website,
  businessName,
  phoneLink,
  addressLink,
}: NavbarBlockProps) {
  const NavbarComponent = resolveRegisteredBlockComponent("navbar", data.template.navbar);

  return (
    <NavbarComponent
      navigation={website.navigation}
      businessName={businessName}
      addressLink={addressLink("text-[11px] uppercase tracking-wide text-zinc-500")}
      phoneLink={phoneLink(
        `rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold ${responsiveVisibility.inlineFromTablet}`,
      )}
    />
  );
}

export type AboutBlockProps = {
  data: TemplateRenderData;
  website: Website;
  imageUrl?: string;
};

export function AboutBlock({ data, website, imageUrl }: AboutBlockProps) {
  const AboutComponent = resolveRegisteredBlockComponent("about", data.template.about);
  const about = websiteAbout(website);

  if (!about) return null;

  return (
    <AboutComponent
      data={about}
      imageUrl={imageUrl}
      imageAlt={about.title}
    />
  );
}

export type ServicesBlockProps = {
  data: TemplateRenderData;
  website: Website;
  locationLink: (className: string, label?: string) => ReactNode;
};

export function ServicesBlock({
  data,
  website,
  locationLink,
}: ServicesBlockProps) {
  const ServicesComponent = resolveRegisteredBlockComponent("services", data.template.services);
  const services = websiteServices(website);

  if (services.length === 0) return null;

  return (
    <ServicesComponent
      items={services}
      locationLink={locationLink("underline-offset-2 hover:underline")}
    />
  );
}

export type FaqBlockProps = {
  data: TemplateRenderData;
  website: Website;
};

export function FaqBlock({ data, website }: FaqBlockProps) {
  const FaqComponent = resolveRegisteredBlockComponent("faq", data.template.faq);
  const faq = websiteFaq(website);

  if (faq.length === 0) return null;

  return <FaqComponent items={faq} />;
}

export type FooterBlockProps = {
  data: TemplateRenderData;
  website: Website;
  businessName: string;
  phoneLink: (className: string, label?: string) => ReactNode;
  emailLink: (className: string, label?: string) => ReactNode;
  addressLink: (className: string, label?: string) => ReactNode;
};

export function FooterBlock({
  data,
  website,
  businessName,
  phoneLink,
  emailLink,
  addressLink,
}: FooterBlockProps) {
  const FooterComponent = resolveRegisteredBlockComponent("footer", data.template.footer);
  const contact = websiteContact(website);

  return (
    <FooterComponent
      businessName={businessName}
      contact={contact}
      phoneLink={phoneLink("hover:underline")}
      emailLink={emailLink("hover:underline")}
      addressLink={addressLink("hover:underline")}
    />
  );
}

/** Resolve hero from Website JSON — `website.hero` equivalent. */
export function resolveWebsiteHero(website: Website): Hero | null {
  return websiteHero(website);
}

/** Resolve theme from Website JSON. */
export function resolveWebsiteTheme(website: Website): Theme {
  return website.theme;
}

/** Low-level lookup — matches documented renderer pattern. */
export function lookupHeroComponent(data: TemplateRenderData) {
  return resolveRegisteredBlockComponent("hero", data.template.hero);
}
