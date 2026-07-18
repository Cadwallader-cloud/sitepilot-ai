import type { TradeKey } from "./trade-images";
import type { SiteImages } from "./site-types";

/** Search queries tuned per niche for Unsplash / Pexels */
const TRADE_QUERIES: Record<TradeKey, string> = {
  roofing: "residential roofing contractor house roof",
  plumbing: "plumber bathroom pipes water",
  electrician: "electrician electrical wiring panel",
  lawyer: "law office attorney professional desk",
  landscaping: "landscaping garden backyard lawn",
  construction: "construction site building renovation",
  general: "local small business storefront",
};

/** Stable Unsplash CDN fallbacks (licensed) when API keys are missing */
const TRADE_UNSPLASH_FALLBACKS: Record<TradeKey, SiteImages> = {
  roofing: {
    hero: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  plumbing: {
    hero: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  electrician: {
    hero: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    ],
  },
  lawyer: {
    hero: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  landscaping: {
    hero: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
    ],
  },
  construction: {
    hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  general: {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    ],
  },
};

function toSiteImages(urls: string[]): SiteImages | null {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length < 1) return null;

  const hero = unique[0];
  const rest = unique.slice(1);
  const gallery = [rest[0] ?? hero, rest[1] ?? hero, rest[2] ?? hero];

  return { hero, gallery };
}

async function fetchUnsplash(query: string): Promise<SiteImages | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) return null;

  const params = new URLSearchParams({
    query,
    per_page: "8",
    orientation: "landscape",
    content_filter: "high",
  });

  const res = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(6000),
    },
  );

  if (!res.ok) {
    console.warn("Unsplash search failed:", res.status);
    return null;
  }

  const data = (await res.json()) as {
    results?: {
      urls?: { regular?: string; full?: string };
      links?: { download_location?: string };
    }[];
  };

  const results = data.results ?? [];
  const urls = results
    .map((photo) => photo.urls?.regular || photo.urls?.full)
    .filter((url): url is string => Boolean(url));

  const images = toSiteImages(urls);
  if (!images) return null;

  // Unsplash API guideline: trigger download endpoint when using a photo
  for (const photo of results.slice(0, 4)) {
    const download = photo.links?.download_location;
    if (!download) continue;
    void fetch(download, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    }).catch(() => {});
  }

  return images;
}

async function fetchPexels(query: string): Promise<SiteImages | null> {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    query,
    per_page: "8",
    orientation: "landscape",
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    console.warn("Pexels search failed:", res.status);
    return null;
  }

  const data = (await res.json()) as {
    photos?: { src?: { large2x?: string; large?: string; medium?: string } }[];
  };

  const urls = (data.photos ?? [])
    .map(
      (photo) =>
        photo.src?.large2x || photo.src?.large || photo.src?.medium,
    )
    .filter((url): url is string => Boolean(url));

  return toSiteImages(urls);
}

/**
 * Pick licensed stock photos for a trade.
 * Order: Unsplash API → Pexels API → curated Unsplash CDN URLs.
 */
export async function fetchTradeStockPhotos(
  tradeKey: TradeKey,
): Promise<SiteImages> {
  const query = TRADE_QUERIES[tradeKey];

  try {
    const fromUnsplash = await fetchUnsplash(query);
    if (fromUnsplash) return fromUnsplash;
  } catch (error) {
    console.warn("Unsplash fetch error:", error);
  }

  try {
    const fromPexels = await fetchPexels(query);
    if (fromPexels) return fromPexels;
  } catch (error) {
    console.warn("Pexels fetch error:", error);
  }

  return TRADE_UNSPLASH_FALLBACKS[tradeKey];
}
