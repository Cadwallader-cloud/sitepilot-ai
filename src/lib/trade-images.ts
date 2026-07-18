export type TradeKey =
  | "roofing"
  | "plumbing"
  | "electrician"
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

const TRADE_THEMES: Record<
  TradeKey,
  { primary: string; accent: string; style: "bold" | "clean" | "professional" }
> = {
  roofing: { primary: "#c2410c", accent: "#ea580c", style: "bold" },
  plumbing: { primary: "#0369a1", accent: "#0ea5e9", style: "professional" },
  electrician: { primary: "#0f172a", accent: "#0ea5e9", style: "bold" },
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

export function attachTradeAssets(
  tradeHint: string,
  existing?: { hero?: string; gallery?: string[] },
) {
  const key = detectTrade(tradeHint);
  const images = getTradeImages(key);
  const theme = getTradeTheme(key);

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
