export type TradeKey =
  | "roofing"
  | "plumbing"
  | "electrician"
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
  lawyer: {
    hero: "/demos/construction.jpg",
    gallery: [
      "/demos/construction.jpg",
      "/demos/roofing.jpg",
      "/demos/electrician.jpg",
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
  // Roofing → Dark Blue
  roofing: { primary: "#1e3a5f", accent: "#2563eb", style: "bold" },
  // Plumber → Teal
  plumbing: { primary: "#0f766e", accent: "#14b8a6", style: "professional" },
  // Electrician → Orange
  electrician: { primary: "#c2410c", accent: "#f97316", style: "bold" },
  // Lawyer → Dark Gray
  lawyer: { primary: "#1f2937", accent: "#6b7280", style: "professional" },
  landscaping: { primary: "#15803d", accent: "#22c55e", style: "clean" },
  construction: { primary: "#a16207", accent: "#eab308", style: "bold" },
  general: { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
};

export function detectTrade(text: string): TradeKey {
  const t = text.toLowerCase();

  if (/roof|gutter|chimney|shingle|slate|tile roof/.test(t)) return "roofing";
  if (/plumb|drain|pipe|boiler|water heater|leak|toilet|faucet/.test(t))
    return "plumbing";
  if (/electric|wiring|panel|ev charger|socket|lighting|volt/.test(t))
    return "electrician";
  if (/lawyer|attorney|legal|law firm|solicitor|barrister|litigation/.test(t))
    return "lawyer";
  if (/landscape|garden|lawn|tree|hedge|patio|outdoor/.test(t))
    return "landscaping";
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
) {
  const key = detectTrade(tradeHint);
  const theme = getTradeTheme(key);
  const local = getTradeImages(key);

  // Prefer stock API photos (Unsplash / Pexels); keep local demos as last resort
  let stock: { hero: string; gallery: string[] } | null = null;
  try {
    const { fetchTradeStockPhotos } = await import("./stock-photos");
    stock = await fetchTradeStockPhotos(key);
  } catch (error) {
    console.warn("Stock photo lookup failed, using local demos:", error);
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
