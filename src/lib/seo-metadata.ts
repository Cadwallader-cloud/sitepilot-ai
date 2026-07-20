import type { GeneratedSite } from "./site-types";
import type { Metadata } from "next";

/** Map SEO Generator v1 → Next.js Metadata (incl. Open Graph / Twitter) */
export function siteSeoToMetadata(site: GeneratedSite): Metadata {
  const { seo } = site;
  const ogTitle = seo.openGraph?.title || seo.ogTitle || seo.title;
  const ogDescription =
    seo.openGraph?.description || seo.ogDescription || seo.description;
  const twTitle = seo.twitter?.title || ogTitle;
  const twDescription = seo.twitter?.description || ogDescription;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: (seo.openGraph?.type as "website") || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: twTitle,
      description: twDescription,
    },
    other: {
      ...(seo.localSeoPhrase
        ? { "crestis:local-seo": seo.localSeoPhrase }
        : {}),
      ...(seo.schema?.["@type"]
        ? { "crestis:schema-type": seo.schema["@type"] }
        : {}),
      ...(seo.seoScore != null
        ? { "crestis:seo-score": String(seo.seoScore) }
        : {}),
      ...(seo.entities?.length
        ? { "crestis:entities": seo.entities.slice(0, 12).join(", ") }
        : {}),
      ...(seo.imageSeo?.alt
        ? { "crestis:image-alt": seo.imageSeo.alt }
        : {}),
    },
  };
}
