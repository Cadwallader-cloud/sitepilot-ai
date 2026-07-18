import type { GeneratedSite } from "./site-types";

export type DemoSite = {
  slug: string;
  name: string;
  location: string;
  trade: string;
  prompt: string;
};

/** Metadata only — live content always comes from OpenAI via /api/generate */
export const demoSites: DemoSite[] = [
  {
    slug: "abc-construction",
    name: "ABC Construction",
    location: "London",
    trade: "General contractor",
    prompt:
      "ABC Construction — general contractor in London, residential and commercial builds",
  },
  {
    slug: "smith-plumbing",
    name: "Smith Plumbing",
    location: "Manchester",
    trade: "Plumber",
    prompt: "Smith Plumbing — emergency and scheduled plumbing in Manchester",
  },
  {
    slug: "elite-cleaning",
    name: "Elite Cleaning",
    location: "New York",
    trade: "Commercial cleaning",
    prompt:
      "Elite Cleaning — commercial and office cleaning services in New York",
  },
];

export function getDemoBySlug(slug: string): DemoSite | undefined {
  return demoSites.find((demo) => demo.slug === slug);
}

/** @deprecated demos no longer embed GeneratedSite placeholders */
export type DemoSiteWithContent = DemoSite & { site?: GeneratedSite };
