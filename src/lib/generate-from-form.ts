import type { BusinessFormInput } from "./business-form";
import { normalizeGeneratedSite } from "./generate-site-ai";
import type { GeneratedSite } from "./site-types";

export function generateFromForm(input: BusinessFormInput): GeneratedSite {
  const name = input.businessName.trim();
  const location = input.location.trim();
  const services = input.services
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return normalizeGeneratedSite(
    {
      title: name,
      tagline: `Trusted local specialists in ${location}`,
      trade: "Local service business",
      location,
      phone: input.phone.trim(),
      email: input.email.trim(),
      hours: "Mon–Sat 7am–7pm · Emergency call-outs available",
      cta: "Get a free quote",
      heroHeadline: `${name} — quality work in ${location}`,
      heroSubheadline: `Professional ${services.slice(0, 2).join(" & ") || "services"} for homes and businesses across ${location}.`,
      about: `${name} is a local team serving ${location}. We focus on clear pricing, reliable scheduling, and workmanship you can trust — from first call to final clean-up.`,
      services,
      whyChooseUs: [
        "Licensed & insured",
        "Clear upfront pricing",
        "Local team, fast response",
        "Workmanship guaranteed",
      ],
      testimonials: [
        {
          quote: `Hired ${name} in ${location}. On time, professional, and the job looked excellent.`,
          name: "Alex M.",
          role: `Homeowner, ${location}`,
        },
        {
          quote: "Fair quote and they cleaned up perfectly. Would book again.",
          name: "Jordan P.",
          role: "Property manager",
        },
        {
          quote: "Clear communication from start to finish. Highly recommend.",
          name: "Sam R.",
          role: `Customer, ${location}`,
        },
      ],
      faq: [
        {
          question: "Do you offer free estimates?",
          answer: "Yes — we provide clear written estimates before work begins.",
        },
        {
          question: "Are you licensed and insured?",
          answer: "Yes. Fully licensed and insured for your peace of mind.",
        },
        {
          question: "Which areas do you cover?",
          answer: `We serve ${location} and nearby neighborhoods.`,
        },
        {
          question: "How soon can you start?",
          answer: "Many jobs can be booked within days — ask about emergencies.",
        },
      ],
      ctaBanner: `Ready for a free quote from ${name}? Get in touch today.`,
      contactBlurb: `Call or email ${name} — we're happy to help.`,
    },
    {
      businessName: name,
      location,
      services: input.services,
      phone: input.phone,
      email: input.email,
    },
  );
}
