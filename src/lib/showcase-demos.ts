import { demoCatalog, type DemoSite } from "@/lib/demo-catalog";
import { demoImages, type DemoImageSlug } from "@/lib/demo-images";

/** Listing metadata for /demos and landing cards */
export type ShowcaseDemoMeta = {
  slug: string;
  name: string;
  trade: string;
  location: string;
  tagline: string;
  heroImage: string;
  accent: string;
  description: string;
};

function applyUniqueImages(demo: DemoSite): DemoSite {
  const imgs = demoImages[demo.slug as DemoImageSlug];
  if (!imgs) return demo;

  return {
    ...demo,
    heroImage: imgs.hero,
    gallery: demo.gallery.map((item, index) => ({
      ...item,
      src: imgs.gallery[index] ?? imgs.hero,
    })),
  };
}

const demosWithImages = demoCatalog.map(applyUniqueImages);

export const showcaseDemos: ShowcaseDemoMeta[] = demosWithImages.map(
  (demo) => ({
    slug: demo.slug,
    name: demo.name,
    trade: demo.trade,
    location: demo.location,
    tagline: demo.tagline,
    heroImage: demo.heroImage,
    accent: demo.accent,
    description: demo.description,
  }),
);

export function getShowcaseDemo(slug: string): ShowcaseDemoMeta | undefined {
  return showcaseDemos.find((demo) => demo.slug === slug);
}

export function getShowcaseDemoSite(slug: string): DemoSite | undefined {
  return demosWithImages.find((demo) => demo.slug === slug);
}

export const showcaseDemoCount = showcaseDemos.length;
