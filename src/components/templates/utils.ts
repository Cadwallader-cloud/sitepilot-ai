import type {
  About,
  Contact,
  FAQ,
  Hero,
  Page,
  Section,
  Service,
  Website,
} from "@/lib/website";
import { normalizeTemplateBlocks } from "@/lib/template-engine";

export function homePage(website: Website): Page | undefined {
  return (
    website.pages.find((p) => p.id === "home" || p.slug === "/") ?? website.pages[0]
  );
}

export function findSection(
  website: Website,
  type: string,
): Section | undefined {
  return homePage(website)?.sections.find((s) => s.type === type && s.enabled !== false);
}

export function sectionData<T>(section: Section | undefined): T | null {
  if (!section?.data) return null;
  return section.data as T;
}

export function templateBlocksFor(website: Website) {
  return normalizeTemplateBlocks(website.theme?.blocks);
}

export function primaryColor(website: Website): string {
  return website.branding.colors[0]?.trim() || "#2563eb";
}

export function websiteHero(website: Website): Hero | null {
  return sectionData<Hero>(findSection(website, "hero"));
}

export function websiteAbout(website: Website): About | null {
  return sectionData<About>(findSection(website, "about"));
}

export function websiteServices(website: Website): Service[] {
  const section = findSection(website, "services");
  return sectionData<{ items: Service[] }>(section)?.items ?? [];
}

export function websiteFaq(website: Website): FAQ[] {
  const section = findSection(website, "faq");
  return sectionData<{ items: FAQ[] }>(section)?.items ?? [];
}

export function websiteContact(website: Website): Contact {
  return (
    sectionData<Contact>(findSection(website, "contact")) ?? {
      phone: website.business.phone ?? "",
      email: website.business.email ?? "",
      address: website.business.location,
      form: true,
    }
  );
}
