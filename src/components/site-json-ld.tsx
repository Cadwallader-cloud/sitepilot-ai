import { seoSchemaToJsonLd } from "@/lib/seo-package";
import type { GeneratedSite } from "@/lib/site-types";

type SiteJsonLdProps = {
  site: GeneratedSite;
  url?: string;
};

/** Inject schema.org JSON-LD from Layer 6 SEO AI (never invent ratings). */
export function SiteJsonLd({ site, url }: SiteJsonLdProps) {
  const jsonLd = seoSchemaToJsonLd(site.seo, { url });
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
