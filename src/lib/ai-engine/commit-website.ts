/**
 * Commit a fully assembled Website through AI ownership patches.
 * Ensures every agent-owned surface is written via the ownership API.
 */

import type { Website } from "../website";
import {
  applyAboutDataPatch,
  applyBrandingPatch,
  applyBusinessPatch,
  applyFaqDataPatch,
  applyHeroDataPatch,
  applyPagesPatch,
  applySeoPatch,
  applyServicesDataPatch,
  applyThemePatch,
} from "../website-ownership";

export function commitWebsiteViaOwnership(assembled: Website): Website {
  const home =
    assembled.pages.find((p) => p.id === "home" || p.slug === "/") ??
    assembled.pages[0];
  const heroData = home?.sections.find((s) => s.type === "hero")?.data;
  const aboutData = home?.sections.find((s) => s.type === "about")?.data;
  const servicesData = home?.sections.find((s) => s.type === "services")?.data;
  const faqData = home?.sections.find((s) => s.type === "faq")?.data;

  let website = assembled;
  website = applyBusinessPatch(website, assembled.business);
  website = applyBrandingPatch(website, assembled.branding);
  website = applyPagesPatch(website, assembled.pages);
  if (heroData) website = applyHeroDataPatch(website, heroData);
  if (aboutData) website = applyAboutDataPatch(website, aboutData);
  if (servicesData) website = applyServicesDataPatch(website, servicesData);
  if (faqData) website = applyFaqDataPatch(website, faqData);
  website = applySeoPatch(website, assembled.seo);
  website = applyThemePatch(website, assembled.theme);
  return website;
}
