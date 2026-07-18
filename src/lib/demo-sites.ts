import { generateFromForm } from "./generate-from-form";
import type { GeneratedSite } from "./site-types";

export type DemoSite = {
  slug: string;
  name: string;
  location: string;
  trade: string;
  prompt: string;
  site: GeneratedSite;
};

export const demoSites: DemoSite[] = [
  {
    slug: "abc-construction",
    name: "ABC Construction",
    location: "London",
    trade: "General contractor",
    prompt:
      "ABC Construction — general contractor in London, residential and commercial builds",
    site: generateFromForm({
      businessName: "ABC Construction",
      location: "London",
      services: "New builds, extensions, renovations, project management",
      phone: "(020) 7946 0958",
      email: "hello@abcconstruction.co.uk",
    }),
  },
  {
    slug: "smith-plumbing",
    name: "Smith Plumbing",
    location: "Manchester",
    trade: "Plumber",
    prompt: "Smith Plumbing — emergency and scheduled plumbing in Manchester",
    site: generateFromForm({
      businessName: "Smith Plumbing",
      location: "Manchester",
      services:
        "Emergency repairs, boiler installs, bathroom fitting, drain unblocking",
      phone: "(0161) 496 0000",
      email: "hello@smithplumbing.co.uk",
    }),
  },
  {
    slug: "elite-cleaning",
    name: "Elite Cleaning",
    location: "New York",
    trade: "Commercial cleaning",
    prompt:
      "Elite Cleaning — commercial and office cleaning services in New York",
    site: generateFromForm({
      businessName: "Elite Cleaning",
      location: "New York",
      services:
        "Office cleaning, deep sanitisation, post-construction cleanup",
      phone: "(212) 555-0198",
      email: "hello@elitecleaning.com",
    }),
  },
];

export function getDemoBySlug(slug: string): DemoSite | undefined {
  return demoSites.find((demo) => demo.slug === slug);
}
