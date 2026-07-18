import type { GeneratedSite } from "@/lib/site-types";

export type { GeneratedSite, SiteSection } from "./site-types";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractBusinessName(prompt: string) {
  const match = prompt.match(/^([^—–-]+)/);
  const name = match?.[1]?.trim();
  return capitalize(name || "Your Business");
}

export function generateSiteFromPrompt(prompt: string): GeneratedSite {
  const name = extractBusinessName(prompt);
  const lower = prompt.toLowerCase();

  const isPlumber = /plumb|drain|pipe|boiler/.test(lower);
  const isElectrician = /electric|wiring|hvac/.test(lower);
  const isCleaning = /clean|janitor|sanit/.test(lower);
  const isRenovation = /renovat|remodel|kitchen|bathroom/.test(lower);

  if (isPlumber) {
    return {
      title: name,
      tagline: "Reliable plumbing services — fast response, fair prices, jobs done right.",
      cta: "Call now",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Emergency repairs · Boiler installs · Bathroom fitting · Leak detection · Drain unblocking.",
        },
        {
          id: "why-us",
          title: "Why hire us",
          body: "Licensed & insured · Same-day emergencies · Upfront pricing · 500+ happy customers.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Available 24/7 · Free estimates · Call (555) 123-4567 · Response within 30 minutes.",
        },
      ],
    };
  }

  if (isElectrician) {
    return {
      title: name,
      tagline: "Licensed electricians for residential and commercial projects.",
      cta: "Get a quote",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Panel upgrades · Rewiring · Lighting installs · EV charger setup · Safety inspections.",
        },
        {
          id: "why-us",
          title: "Why hire us",
          body: "Fully certified · Code-compliant work · Same-week scheduling · 10-year warranty on labor.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Mon–Sat 7am–7pm · Emergency call-outs · (555) 987-6543 · Free on-site estimates.",
        },
      ],
    };
  }

  if (isCleaning) {
    return {
      title: name,
      tagline: "Professional cleaning services for offices and commercial spaces.",
      cta: "Request a quote",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Office cleaning · Deep sanitisation · Post-construction cleanup · Nightly janitorial contracts.",
        },
        {
          id: "why-us",
          title: "Why hire us",
          body: "Insured teams · Flexible schedules · Eco-friendly products · Trusted by 100+ businesses.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Free walkthrough · Custom quotes · (555) 456-7890 · Available 7 days a week.",
        },
      ],
    };
  }

  if (isRenovation) {
    return {
      title: name,
      tagline: "Quality renovations that transform your home — on time and on budget.",
      cta: "Free estimate",
      sections: [
        {
          id: "services",
          title: "Services",
          body: "Kitchen remodels · Bathroom upgrades · Full home renovations · Flooring & tiling.",
        },
        {
          id: "why-us",
          title: "Why hire us",
          body: "20+ years experience · Licensed contractors · Transparent pricing · Project manager on every job.",
        },
        {
          id: "contact",
          title: "Contact",
          body: "Free in-home consultation · (555) 234-5678 · Mon–Fri 8am–6pm · References available.",
        },
      ],
    };
  }

  return {
    title: name,
    tagline: "Trusted construction and building services — quality work, every project.",
    cta: "Get a free quote",
    sections: [
      {
        id: "services",
        title: "Services",
        body: "New builds · Extensions · Renovations · Commercial projects · Project management.",
      },
      {
        id: "why-us",
        title: "Why hire us",
        body: "Fully insured · 15+ years experience · On-time delivery · Free site surveys & quotes.",
      },
      {
        id: "contact",
        title: "Contact",
        body: "Serving your local area · Mon–Sat 7am–6pm · (555) 000-1234 · Quotes within 24 hours.",
      },
    ],
  };
}
