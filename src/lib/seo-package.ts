import type { SeoBlock, SeoInternalLink, SeoSchemaBlock } from "./site-types";

/**
 * Crestis SEO Generator v1 package (Google-focused JSON only).
 * Crestis maps this → meta tags + JSON-LD. Never HTML.
 */
export type SeoAiPackage = {
  title?: string;
  metaDescription?: string;
  slug?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    imageSuggestion?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    imageSuggestion?: string;
  };
  schema?: SeoSchemaBlock;
  keywords?: string[];
  entities?: string[];
  internalLinks?: SeoInternalLink[];
  imageSeo?: {
    filename?: string;
    alt?: string;
    caption?: string;
    title?: string;
  };
  seoScore?: number;
  /** @deprecated nested shape — still accepted */
  seo?: {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    localSeoPhrase?: string;
  };
};

const SCHEMA_TYPES = [
  "LocalBusiness",
  "HomeAndConstructionBusiness",
  "ProfessionalService",
  "MedicalBusiness",
  "FoodEstablishment",
  "LegalService",
  "Electrician",
  "Plumber",
  "RoofingContractor",
  "GeneralContractor",
  "Dentist",
  "Attorney",
  "Restaurant",
  "Organization",
] as const;

const SCHEMA_ALIASES: Record<string, SeoSchemaBlock["@type"]> = {
  dentist: "Dentist",
  dental: "Dentist",
  attorney: "Attorney",
  lawyer: "Attorney",
  "law firm": "Attorney",
  restaurant: "Restaurant",
  cafe: "Restaurant",
  organization: "Organization",
  org: "Organization",
};

function pickSchemaType(value: unknown): SeoSchemaBlock["@type"] {
  if (typeof value !== "string") return "LocalBusiness";
  const needle = value.trim();
  const hit = SCHEMA_TYPES.find(
    (t) => t.toLowerCase() === needle.toLowerCase(),
  );
  if (hit) return hit;
  const alias = SCHEMA_ALIASES[needle.toLowerCase()];
  return alias ?? "LocalBusiness";
}

function cleanLinks(raw: unknown): SeoInternalLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { anchor?: string; href?: string; target?: string };
      const anchor = String(row.anchor ?? "").trim();
      let href = String(row.href ?? row.target ?? "").trim();
      if (!anchor || !href) return null;
      if (!href.startsWith("#")) {
        const id = href.replace(/^\//, "").replace(/^#/, "");
        href = `#${id}`;
      }
      const id = href.slice(1);
      const allowed = new Set([
        "hero",
        "services",
        "why_us",
        "about",
        "trust",
        "projects",
        "gallery",
        "menu",
        "testimonials",
        "faq",
        "contact",
      ]);
      if (!allowed.has(id)) return null;
      return { anchor, href } satisfies SeoInternalLink;
    })
    .filter((l): l is SeoInternalLink => Boolean(l))
    .slice(0, 8);
}

function cleanSchema(
  raw: unknown,
  fallback: {
    name: string;
    description: string;
    telephone: string;
    email: string;
    address: string;
    city: string;
  },
): SeoSchemaBlock {
  const row =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const addressRaw =
    row.address && typeof row.address === "object"
      ? (row.address as Record<string, unknown>)
      : {};

  return {
    "@type": pickSchemaType(row["@type"] ?? row.type),
    name: String(row.name ?? "").trim() || fallback.name,
    description:
      String(row.description ?? "").trim() || fallback.description.slice(0, 160),
    telephone: String(row.telephone ?? "").trim() || fallback.telephone,
    email: String(row.email ?? "").trim() || fallback.email,
    areaServed:
      String(row.areaServed ?? "").trim() || fallback.city || undefined,
    priceRange: String(row.priceRange ?? "").trim() || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        String(addressRaw.streetAddress ?? "").trim() || undefined,
      addressLocality:
        String(addressRaw.addressLocality ?? "").trim() ||
        fallback.city ||
        undefined,
      addressRegion: String(addressRaw.addressRegion ?? "").trim() || undefined,
      postalCode: String(addressRaw.postalCode ?? "").trim() || undefined,
      addressCountry:
        String(addressRaw.addressCountry ?? "").trim() || undefined,
    },
  };
}

function clampChars(raw: string, min: number, max: number): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max).trim();
}

function cleanStringList(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const s = String(item ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function slugifyPath(raw: unknown): string {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s === "/" || s === "home" || s === "homepage" || s === "index") {
    return "/";
  }
  const cleaned = s
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "");
  if (!cleaned || cleaned === "/") return "/";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

/** Normalize SEO Generator v1 JSON → SeoBlock stored in Website JSON */
export function normalizeSeoAiPackage(
  ai: Partial<SeoAiPackage> | Record<string, unknown> | null | undefined,
  fallback: {
    businessName: string;
    city: string;
    niche: string;
    heroSubheadline: string;
    aboutText: string;
    phone: string;
    email: string;
    address: string;
    serviceTitles: string[];
  },
): SeoBlock {
  const root =
    ai && typeof ai === "object"
      ? (ai as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const nested =
    root.seo && typeof root.seo === "object"
      ? (root.seo as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const openGraph =
    root.openGraph && typeof root.openGraph === "object"
      ? (root.openGraph as Record<string, unknown>)
      : {};
  const twitter =
    root.twitter && typeof root.twitter === "object"
      ? (root.twitter as Record<string, unknown>)
      : {};
  const imageSeo =
    root.imageSeo && typeof root.imageSeo === "object"
      ? (root.imageSeo as Record<string, unknown>)
      : {};

  const localSeoPhrase =
    String(nested.localSeoPhrase ?? "").trim() ||
    `${fallback.niche} in ${fallback.city}`;

  let title =
    String(root.title ?? nested.title ?? "").trim() ||
    `${fallback.serviceTitles[0] || fallback.niche} in ${fallback.city} | ${fallback.businessName}`;

  title = clampChars(title, 45, 60);

  let description =
    String(
      root.metaDescription ??
        root.description ??
        nested.description ??
        "",
    ).trim() ||
    (fallback.heroSubheadline || fallback.aboutText).slice(0, 160) ||
    `${fallback.businessName} provides ${fallback.niche} in ${fallback.city}. Contact us to get started.`;

  description = clampChars(description, 140, 160);

  const ogTitle =
    String(openGraph.title ?? nested.ogTitle ?? "").trim() || title;
  const ogDescription =
    String(openGraph.description ?? nested.ogDescription ?? "").trim() ||
    description;

  let keywords = cleanStringList(
    root.keywords ?? nested.keywords,
    15,
  );

  if (keywords.length < 10) {
    const extras = [
      localSeoPhrase,
      `${fallback.city} ${fallback.niche}`,
      ...fallback.serviceTitles.slice(0, 6).map((s) => `${s} ${fallback.city}`),
      ...fallback.serviceTitles.slice(0, 4),
      fallback.businessName,
    ];
    keywords = cleanStringList([...keywords, ...extras], 15);
  }

  const entities = cleanStringList(root.entities, 16);

  const schema = cleanSchema(root.schema, {
    name: fallback.businessName,
    description,
    telephone: fallback.phone,
    email: fallback.email,
    address: fallback.address,
    city: fallback.city,
  });

  const internalLinks = cleanLinks(root.internalLinks);
  const links =
    internalLinks.length > 0
      ? internalLinks
      : [
          { anchor: "Services", href: "#services" },
          { anchor: "About", href: "#about" },
          { anchor: "FAQ", href: "#faq" },
          { anchor: "Contact", href: "#contact" },
        ];

  const slug = slugifyPath(root.slug);
  const canonical = slugifyPath(root.canonical ?? root.slug);

  const scoreRaw = Number(root.seoScore);
  const seoScore =
    Number.isFinite(scoreRaw) && scoreRaw >= 0
      ? Math.min(100, Math.round(scoreRaw))
      : undefined;

  const imageFilename = String(imageSeo.filename ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/img[_-]?\d+/gi, "")
    .replace(/-+/g, "-");

  return {
    title,
    description,
    keywords,
    ogTitle: clampChars(ogTitle, 0, 70),
    ogDescription: clampChars(ogDescription, 0, 160),
    localSeoPhrase: localSeoPhrase.slice(0, 80),
    slug,
    canonical,
    entities: entities.length ? entities : undefined,
    seoScore,
    openGraph: {
      title: clampChars(ogTitle, 0, 70),
      description: clampChars(ogDescription, 0, 160),
      type: String(openGraph.type ?? "website").trim() || "website",
      imageSuggestion:
        String(openGraph.imageSuggestion ?? "").trim() || undefined,
    },
    twitter: {
      title:
        clampChars(
          String(twitter.title ?? "").trim() || ogTitle,
          0,
          70,
        ),
      description:
        clampChars(
          String(twitter.description ?? "").trim() || ogDescription,
          0,
          160,
        ),
      imageSuggestion:
        String(twitter.imageSuggestion ?? "").trim() || undefined,
    },
    imageSeo:
      imageFilename || imageSeo.alt
        ? {
            filename:
              imageFilename ||
              `${fallback.niche}-${fallback.city}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/-+/g, "-") + ".jpg",
            alt: String(imageSeo.alt ?? "").trim() || undefined,
            caption: String(imageSeo.caption ?? "").trim() || undefined,
            title: String(imageSeo.title ?? "").trim() || undefined,
          }
        : undefined,
    schema,
    internalLinks: links,
  };
}

/** Build Google JSON-LD from Crestis-validated schema (never invent ratings). */
export function seoSchemaToJsonLd(
  seo: SeoBlock,
  opts?: { url?: string },
): Record<string, unknown> | null {
  const s = seo.schema;
  if (!s) return null;

  const address = s.address
    ? {
        "@type": "PostalAddress" as const,
        ...(s.address.streetAddress
          ? { streetAddress: s.address.streetAddress }
          : {}),
        ...(s.address.addressLocality
          ? { addressLocality: s.address.addressLocality }
          : {}),
        ...(s.address.addressRegion
          ? { addressRegion: s.address.addressRegion }
          : {}),
        ...(s.address.postalCode ? { postalCode: s.address.postalCode } : {}),
        ...(s.address.addressCountry
          ? { addressCountry: s.address.addressCountry }
          : {}),
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": s["@type"] || "LocalBusiness",
    name: s.name,
    description: s.description,
    ...(s.telephone ? { telephone: s.telephone } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.areaServed ? { areaServed: s.areaServed } : {}),
    ...(s.priceRange ? { priceRange: s.priceRange } : {}),
    ...(address && Object.keys(address).length > 1 ? { address } : {}),
    ...(opts?.url ? { url: opts.url } : {}),
  };
}

/** Package shape for logging / debugging */
export function seoBlockToPackage(seo: SeoBlock): SeoAiPackage {
  return {
    title: seo.title,
    metaDescription: seo.description,
    slug: seo.slug ?? "/",
    canonical: seo.canonical ?? "/",
    openGraph: seo.openGraph ?? {
      title: seo.ogTitle,
      description: seo.ogDescription,
      type: "website",
    },
    twitter: seo.twitter,
    schema: seo.schema ?? {
      "@type": "LocalBusiness",
      name: seo.title,
      description: seo.description,
    },
    keywords: seo.keywords,
    entities: seo.entities,
    internalLinks: seo.internalLinks ?? [],
    imageSeo: seo.imageSeo,
    seoScore: seo.seoScore,
  };
}
