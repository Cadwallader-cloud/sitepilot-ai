import type { BusinessFormInput } from "./business-form";
import type { GeneratedSite, SiteTheme } from "./site-types";

const themes: SiteTheme[] = [
  { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
  { primary: "#ea580c", accent: "#f59e0b", style: "bold" },
  { primary: "#059669", accent: "#10b981", style: "clean" },
  { primary: "#0f172a", accent: "#0ea5e9", style: "bold" },
];

function pickTheme(name: string): SiteTheme {
  const index = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return themes[index % themes.length];
}

function parseServices(services: string): string[] {
  return services
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateFromForm(input: BusinessFormInput): GeneratedSite {
  const name = input.businessName.trim();
  const type = input.type.trim();
  const location = input.location.trim();
  const phone = input.phone.trim() || "(555) 000-0000";
  const serviceList = parseServices(input.services);
  const typeLower = type.toLowerCase();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return {
    title: name,
    tagline: `Professional ${typeLower} serving ${location}`,
    trade: type,
    location,
    phone,
    email: `hello@${slug || "business"}.com`,
    hours: "Mon–Sat 7am–7pm · Emergency call-outs available",
    cta: "Get a free quote",
    about: `${name} is a trusted ${typeLower} based in ${location}. We help homeowners and businesses get reliable work done on time — with clear pricing and craftsmanship you can see.`,
    services:
      serviceList.length > 0
        ? serviceList
        : ["General services", "Free estimates", "Emergency call-outs"],
    highlights: [
      "Licensed & insured",
      "Free estimates",
      "Local team you can trust",
    ],
    testimonials: [
      {
        quote: `Hired ${name} for a job in ${location}. Showed up on time, explained everything, and finished clean.`,
        name: "Alex M.",
        role: `Homeowner, ${location}`,
      },
      {
        quote: "Fair quote, professional crew, and they cleaned up after themselves. Will call again.",
        name: "Jordan P.",
        role: "Property manager",
      },
    ],
    theme: pickTheme(name),
    sections: [
      {
        id: "services",
        title: "Our services",
        body: `From everyday jobs to urgent repairs, ${name} covers what ${location} needs.`,
        items: serviceList.length > 0 ? serviceList : ["General services"],
      },
      {
        id: "why-us",
        title: "Why choose us",
        body: `We are a local ${typeLower} focused on clear communication, solid workmanship, and jobs done right the first time.`,
      },
      {
        id: "service-area",
        title: "Service area",
        body: `Proudly serving ${location} and surrounding neighborhoods. Call ${phone} to book.`,
      },
    ],
  };
}

export function formInputToJson(input: BusinessFormInput) {
  const site = generateFromForm(input);

  return {
    hero: {
      title: site.title,
      subtitle: site.tagline,
    },
    services: site.services ?? [],
    about: site.about ?? "",
    contact: {
      phone: site.phone,
      location: site.location,
      email: site.email,
    },
  };
}
