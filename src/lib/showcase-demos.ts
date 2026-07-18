import { showcaseImages } from "./showcase-images";

export type ShowcaseDemoMeta = {
  slug: keyof typeof showcaseImages;
  name: string;
  trade: string;
  location: string;
  tagline: string;
  heroImage: string;
  accent: string;
  description: string;
};

export const showcaseDemos: ShowcaseDemoMeta[] = [
  {
    slug: "roofing",
    name: "Summit Roofing Co.",
    trade: "Roofing",
    location: "Denver, CO",
    tagline: "Protecting homes from the Rockies to the plains",
    heroImage: showcaseImages.roofing.hero,
    accent: "#c2410c",
    description: "Bold hero imagery, copper accents, storm-damage focus",
  },
  {
    slug: "construction",
    name: "Ironbridge Builders",
    trade: "Construction",
    location: "Chicago, IL",
    tagline: "Commercial & residential builds since 2008",
    heroImage: showcaseImages.construction.hero,
    accent: "#eab308",
    description: "Industrial yellow-black grid, project portfolio feel",
  },
  {
    slug: "landscaping",
    name: "Verdant Landscapes",
    trade: "Landscaping",
    location: "Portland, OR",
    tagline: "Outdoor spaces that breathe life into your property",
    heroImage: showcaseImages.landscaping.hero,
    accent: "#16a34a",
    description: "Organic curves, lush greens, garden gallery",
  },
  {
    slug: "electrician",
    name: "VoltPro Electric",
    trade: "Electrician",
    location: "Austin, TX",
    tagline: "Powering homes & businesses safely — 24/7",
    heroImage: showcaseImages.electrician.hero,
    accent: "#0ea5e9",
    description: "Dark neon theme, glass cards, tech-forward",
  },
  {
    slug: "plumbing",
    name: "FlowMaster Plumbing",
    trade: "Plumbing",
    location: "Miami, FL",
    tagline: "Fast fixes. Fair prices. Available around the clock.",
    heroImage: showcaseImages.plumbing.hero,
    accent: "#0284c7",
    description: "Clean aqua-white, friendly rounded UI, emergency CTA",
  },
];

export function getShowcaseDemo(slug: string) {
  return showcaseDemos.find((demo) => demo.slug === slug);
}
