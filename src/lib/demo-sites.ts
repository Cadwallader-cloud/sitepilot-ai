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
    prompt: "ABC Construction — general contractor in London, residential and commercial builds",
    site: {
      title: "ABC Construction",
      tagline: "Trusted builders for residential and commercial projects across London.",
      trade: "General contractor",
      location: "London",
      phone: "(020) 7946 0958",
      theme: { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
      cta: "Get a free quote",
      sections: [
        {
          id: "services",
          title: "Our services",
          body: "New builds · Extensions · Renovations · Project management · Free site surveys.",
        },
        {
          id: "why-us",
          title: "Why choose us",
          body: "15+ years experience · Fully insured · On-time delivery · 200+ completed projects.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Serving Greater London · Mon–Sat 7am–6pm · Call (020) 7946 0958 · Free quotes within 24h.",
        },
      ],
    },
  },
  {
    slug: "smith-plumbing",
    name: "Smith Plumbing",
    location: "Manchester",
    trade: "Plumber",
    prompt: "Smith Plumbing — emergency and scheduled plumbing in Manchester",
    site: {
      title: "Smith Plumbing",
      tagline: "Fast, reliable plumbing for homes and businesses in Manchester.",
      trade: "Plumber",
      location: "Manchester",
      phone: "(0161) 496 0000",
      theme: { primary: "#0369a1", accent: "#0ea5e9", style: "clean" },
      cta: "Call now",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Emergency repairs · Boiler installs · Bathroom fitting · Leak detection · Drain unblocking.",
        },
        {
          id: "coverage",
          title: "Coverage",
          body: "Manchester & surrounding areas · Same-day emergency call-outs · Gas Safe registered engineers.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "24/7 emergency line · (0161) 496 0000 · Free estimates on all standard jobs.",
        },
      ],
    },
  },
  {
    slug: "elite-cleaning",
    name: "Elite Cleaning",
    location: "New York",
    trade: "Commercial cleaning",
    prompt: "Elite Cleaning — commercial and office cleaning services in New York",
    site: {
      title: "Elite Cleaning",
      tagline: "Professional commercial cleaning for offices and businesses in NYC.",
      trade: "Commercial cleaning",
      location: "New York",
      phone: "(212) 555-0198",
      theme: { primary: "#059669", accent: "#34d399", style: "clean" },
      cta: "Request a quote",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Office cleaning · Deep sanitisation · Post-construction cleanup · Nightly janitorial contracts.",
        },
        {
          id: "clients",
          title: "Who we serve",
          body: "Corporate offices · Retail spaces · Medical facilities · Co-working spaces across Manhattan & Brooklyn.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Licensed & insured · Flexible scheduling · (212) 555-0198 · Free walkthrough assessment.",
        },
      ],
    },
  },
];

export function getDemoBySlug(slug: string): DemoSite | undefined {
  return demoSites.find((demo) => demo.slug === slug);
}
