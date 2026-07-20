import {
  detectIndustry,
  industryToTradeKey,
} from "./industries";

export type TradeKey =
  | "roofing"
  | "plumbing"
  | "electrician"
  | "dentist"
  | "restaurant"
  | "lawyer"
  | "landscaping"
  | "construction"
  | "general";

/** Curated local + stable CDN images by trade — never random picsum */
const TRADE_IMAGES: Record<
  TradeKey,
  { hero: string; gallery: string[] }
> = {
  roofing: {
    hero: "/demos/roofing.jpg",
    gallery: [
      "/demos/roofing.jpg",
      "/demos/construction.jpg",
      "/demos/plumbing.jpg",
    ],
  },
  plumbing: {
    hero: "/demos/plumbing.jpg",
    gallery: [
      "/demos/plumbing.jpg",
      "/demos/plumbing-bathroom.jpg",
      "/demos/plumbing-heater.jpg",
    ],
  },
  electrician: {
    hero: "/demos/electrician.jpg",
    gallery: [
      "/demos/electrician.jpg",
      "/demos/electrician-ev.jpg",
      "/demos/construction.jpg",
    ],
  },
  dentist: {
    hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606811841689-23dfdb7ee46b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    ],
  },
  restaurant: {
    hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
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
    hero: "/demos/landscaping.jpg",
    gallery: [
      "/demos/landscaping.jpg",
      "/demos/landscaping.jpg",
      "/demos/construction.jpg",
    ],
  },
  construction: {
    hero: "/demos/construction.jpg",
    gallery: [
      "/demos/construction.jpg",
      "/demos/roofing.jpg",
      "/demos/electrician.jpg",
    ],
  },
  general: {
    hero: "/demos/construction.jpg",
    gallery: [
      "/demos/construction.jpg",
      "/demos/roofing.jpg",
      "/demos/plumbing.jpg",
    ],
  },
};

/** Niche → brand colors (applied at generate time, not from AI) */
const TRADE_THEMES: Record<
  TradeKey,
  { primary: string; accent: string; style: "bold" | "clean" | "professional" }
> = {
  roofing: { primary: "#1e3a5f", accent: "#2563eb", style: "bold" },
  plumbing: { primary: "#0f766e", accent: "#14b8a6", style: "professional" },
  electrician: { primary: "#c2410c", accent: "#f97316", style: "bold" },
  // Dentist → soft clinical teal / mint (≠ roofing navy)
  dentist: { primary: "#0e7490", accent: "#67e8f9", style: "clean" },
  // Restaurant → warm burgundy / amber (≠ dentist teal)
  restaurant: { primary: "#7f1d1d", accent: "#f59e0b", style: "bold" },
  lawyer: { primary: "#1f2937", accent: "#6b7280", style: "professional" },
  landscaping: { primary: "#15803d", accent: "#22c55e", style: "clean" },
  construction: { primary: "#a16207", accent: "#eab308", style: "bold" },
  general: { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
};

export function detectTrade(text: string): TradeKey {
  const t = text.toLowerCase();

  // Check hospitality before "roof" so "rooftop cocktails" ≠ roofing
  if (
    /restaurant|bistro|cafe|café|diner|eatery|kitchen|food|menu|pizza|grill|ceviche|brunch|dining/.test(
      t,
    )
  )
    return "restaurant";
  if (/dentist|dental|orthodont|teeth|tooth|smile clinic/.test(t))
    return "dentist";
  // Word-bound roofing — do not match "rooftop"
  if (
    /\broofing\b|\broofer\b|\broofs?\b|gutter|chimney|shingle|slate roof|tile roof|dach/.test(
      t,
    )
  )
    return "roofing";
  if (/plumb|drain|pipe|boiler|water heater|leak|toilet|faucet/.test(t))
    return "plumbing";
  if (/electric|wiring|panel|ev charger|socket|lighting|volt/.test(t))
    return "electrician";
  if (/lawyer|attorney|legal|law firm|solicitor|barrister|litigation/.test(t))
    return "lawyer";
  if (/landscape|garden|lawn|hedge|landscap/.test(t)) return "landscaping";
  if (/build|construct|renovat|remodel|carpenter|builder|extension/.test(t))
    return "construction";

  return "general";
}

export function getTradeImages(tradeKey: TradeKey) {
  return TRADE_IMAGES[tradeKey];
}

export function getTradeTheme(tradeKey: TradeKey) {
  return TRADE_THEMES[tradeKey];
}

export async function attachTradeAssets(
  tradeHint: string,
  existing?: { hero?: string; gallery?: string[] },
  /** Extra salt so regenerate rotates photos even with the same business */
  imageSeed?: string,
) {
  const industryId = detectIndustry(tradeHint);
  const key =
    industryId === "general"
      ? detectTrade(tradeHint)
      : industryToTradeKey(industryId);
  const theme = getTradeTheme(key);
  const local = getTradeImages(key);
  const seed = imageSeed?.trim()
    ? `${tradeHint}::${imageSeed.trim()}`
    : tradeHint;

  // Never block generate on Unsplash/Pexels unless explicitly opted in
  const liveStock =
    process.env.CRESTIS_LIVE_STOCK_PHOTOS?.trim().toLowerCase();
  const wantLive =
    liveStock === "1" ||
    liveStock === "true" ||
    liveStock === "on" ||
    liveStock === "yes";

  let stock: { hero: string; gallery: string[] } | null = null;
  if (wantLive) {
    try {
      const { fetchTradeStockPhotos } = await import("./stock-photos");
      stock = await Promise.race([
        fetchTradeStockPhotos(key, seed),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 2500);
        }),
      ]);
    } catch (error) {
      console.warn("Stock photo lookup failed, using local demos:", error);
    }
  }

  const images = stock ?? local;

  return {
    tradeKey: key,
    theme,
    images: {
      hero: existing?.hero || images.hero,
      gallery:
        existing?.gallery?.length === 3 ? existing.gallery : images.gallery,
    },
  };
}
