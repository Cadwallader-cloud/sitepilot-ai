import type { BusinessFormInput } from "./business-form";
import type { GeneratedSite, SiteTheme } from "./site-types";

const themes: SiteTheme[] = [
  { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
  { primary: "#ea580c", accent: "#f59e0b", style: "bold" },
  { primary: "#059669", accent: "#10b981", style: "clean" },
  { primary: "#7c3aed", accent: "#8b5cf6", style: "bold" },
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
  const phone = input.phone.trim();
  const serviceList = parseServices(input.services);

  const typeLower = type.toLowerCase();

  return {
    title: name,
    tagline: `Professional ${typeLower} in ${location}`,
    trade: type,
    location,
    phone,
    cta: "Get a free quote",
    theme: pickTheme(name),
    sections: [
      {
        id: "services",
        title: "Services",
        body: "",
        items: serviceList.length > 0 ? serviceList : ["General services"],
      },
      {
        id: "about",
        title: "About us",
        body: `${name} is a trusted ${typeLower} serving ${location} and surrounding areas. With over 10 years of experience, we deliver quality workmanship, fair pricing, and reliable service on every project.`,
      },
      {
        id: "contact",
        title: "Contact",
        body: `Ready to get started? Call ${phone}. We proudly serve ${location} and nearby communities. Free estimates — no obligation.`,
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
    services: site.sections.find((s) => s.id === "services")?.items ?? [],
    about: site.sections.find((s) => s.id === "about")?.body ?? "",
    contact: {
      phone: site.phone,
      location: site.location,
      text: site.sections.find((s) => s.id === "contact")?.body ?? "",
    },
  };
}
