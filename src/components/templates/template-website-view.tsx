"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeProvider, css } from "@/components/ui";
import type { Website } from "@/lib/website";
import {
  AboutBlock,
  FaqBlock,
  FooterBlock,
  HeroBlock,
  NavbarBlock,
  ServicesBlock,
  templateRenderData,
} from "./renderer";
import { websiteContact } from "./utils";

export type TemplateWebsiteViewProps = {
  website: Website;
  aboutImage?: string;
  /** Optional analytics-aware link factory */
  renderPhoneLink?: (phone: string, className: string, children: ReactNode) => ReactNode;
  renderEmailLink?: (email: string, className: string, children: ReactNode) => ReactNode;
  renderMapsLink?: (address: string, className: string, children: ReactNode) => ReactNode;
};

function defaultLink(href: string, className: string, children: ReactNode) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Renders Website JSON v2 using locked React templates.
 * AI selects block IDs on theme.blocks — never HTML.
 */
export function TemplateWebsiteView({
  website,
  aboutImage,
  renderPhoneLink,
  renderEmailLink,
  renderMapsLink,
}: TemplateWebsiteViewProps) {
  const data = templateRenderData(website);
  const businessName = website.business.name;
  const contact = websiteContact(website);

  const phone = contact.phone || website.business.phone || "";
  const email = contact.email || website.business.email || "";
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "#";
  const emailHref = email ? `mailto:${email.trim()}` : "#";

  const phoneLink = (className: string, label?: string) =>
    renderPhoneLink?.(phone, className, label ?? (phone || "Call")) ??
    defaultLink(phoneHref, className, label ?? (phone || "Call"));

  const emailLink = (className: string, label?: string) =>
    renderEmailLink?.(email, className, label ?? email) ??
    defaultLink(emailHref, className, label ?? email);

  const mapsLink = (className: string, label?: string) => {
    const text = label ?? contact.address ?? website.business.location;
    return (
      renderMapsLink?.(text, className, text) ??
      defaultLink(`https://maps.google.com/?q=${encodeURIComponent(text)}`, className, text)
    );
  };

  return (
    <ThemeProvider theme={website.theme}>
      <div className={`min-h-screen ${css.bg} ${css.text}`} data-template-engine="v1">
        <NavbarBlock
          data={data}
          website={website}
          businessName={businessName}
          phoneLink={phoneLink}
          addressLink={mapsLink}
        />

        <HeroBlock data={data} website={website} />

        <AboutBlock data={data} website={website} imageUrl={aboutImage} />

        <ServicesBlock
          data={data}
          website={website}
          locationLink={mapsLink}
        />

        <FaqBlock data={data} website={website} />

        <FooterBlock
          data={data}
          website={website}
          businessName={businessName}
          phoneLink={phoneLink}
          emailLink={emailLink}
          addressLink={mapsLink}
        />
      </div>
    </ThemeProvider>
  );
}
