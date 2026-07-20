/**
 * Crestis SEO Memory
 * Per-site ledger of used SEO/copy signals so agents avoid pointless repetition.
 */

export type SeoMemory = {
  usedKeywords: string[];
  usedEntities: string[];
  usedLocations: string[];
  usedHeadlines: string[];
  usedCTA: string[];
  /** Frequency map — agents see "roof repair (4)" */
  counts: {
    keywords: Record<string, number>;
    entities: Record<string, number>;
    locations: Record<string, number>;
    headlines: Record<string, number>;
    cta: Record<string, number>;
  };
};

function norm(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bump(map: Record<string, number>, term: string, by = 1) {
  const key = norm(term);
  if (!key || key.length < 2) return;
  map[key] = (map[key] ?? 0) + by;
}

function uniqueFromCounts(map: Record<string, number>): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k]) => k);
}

function mergeCountMaps(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

export function emptySeoMemory(): SeoMemory {
  return {
    usedKeywords: [],
    usedEntities: [],
    usedLocations: [],
    usedHeadlines: [],
    usedCTA: [],
    counts: {
      keywords: {},
      entities: {},
      locations: {},
      headlines: {},
      cta: {},
    },
  };
}

export function normalizeSeoMemory(raw: unknown): SeoMemory {
  const base = emptySeoMemory();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Record<string, unknown>;
  const countsRaw =
    row.counts && typeof row.counts === "object"
      ? (row.counts as Record<string, unknown>)
      : {};

  const asCountMap = (value: unknown): Record<string, number> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const n = Number(v);
      if (k.trim() && Number.isFinite(n) && n > 0) out[norm(k)] = Math.round(n);
    }
    return out;
  };

  const fromList = (value: unknown, target: Record<string, number>) => {
    if (!Array.isArray(value)) return;
    for (const item of value) bump(target, String(item ?? ""), 1);
  };

  const keywords = asCountMap(countsRaw.keywords);
  const entities = asCountMap(countsRaw.entities);
  const locations = asCountMap(countsRaw.locations);
  const headlines = asCountMap(countsRaw.headlines);
  const cta = asCountMap(countsRaw.cta);

  fromList(row.usedKeywords, keywords);
  fromList(row.usedEntities, entities);
  fromList(row.usedLocations, locations);
  fromList(row.usedHeadlines, headlines);
  fromList(row.usedCTA, cta);

  return {
    usedKeywords: uniqueFromCounts(keywords),
    usedEntities: uniqueFromCounts(entities),
    usedLocations: uniqueFromCounts(locations),
    usedHeadlines: uniqueFromCounts(headlines),
    usedCTA: uniqueFromCounts(cta),
    counts: { keywords, entities, locations, headlines, cta },
  };
}

export function mergeSeoMemory(
  previous: SeoMemory | null | undefined,
  next: SeoMemory | null | undefined,
): SeoMemory {
  const a = normalizeSeoMemory(previous);
  const b = normalizeSeoMemory(next);
  const counts = {
    keywords: mergeCountMaps(a.counts.keywords, b.counts.keywords),
    entities: mergeCountMaps(a.counts.entities, b.counts.entities),
    locations: mergeCountMaps(a.counts.locations, b.counts.locations),
    headlines: mergeCountMaps(a.counts.headlines, b.counts.headlines),
    cta: mergeCountMaps(a.counts.cta, b.counts.cta),
  };
  return {
    usedKeywords: uniqueFromCounts(counts.keywords),
    usedEntities: uniqueFromCounts(counts.entities),
    usedLocations: uniqueFromCounts(counts.locations),
    usedHeadlines: uniqueFromCounts(counts.headlines),
    usedCTA: uniqueFromCounts(counts.cta),
    counts,
  };
}

/** Count phrase occurrences in a blob of text (case-insensitive). */
function countInText(haystack: string, needle: string): number {
  const h = norm(haystack);
  const n = norm(needle);
  if (!h || !n) return 0;
  if (!h.includes(n)) return 0;
  // rough count of non-overlapping occurrences
  let count = 0;
  let idx = 0;
  while (idx <= h.length) {
    const found = h.indexOf(n, idx);
    if (found < 0) break;
    count += 1;
    idx = found + Math.max(n.length, 1);
  }
  return count;
}

export function buildSeoMemoryFromSite(params: {
  city?: string;
  keywords?: string[];
  entities?: string[];
  headlines?: string[];
  ctas?: string[];
  /** Full page text blob for frequency counting */
  textBlob?: string;
}): SeoMemory {
  const memory = emptySeoMemory();
  const blob = params.textBlob || "";

  for (const k of params.keywords ?? []) {
    const times = Math.max(1, countInText(blob, k) || 1);
    bump(memory.counts.keywords, k, times);
  }
  for (const e of params.entities ?? []) {
    const times = Math.max(1, countInText(blob, e) || 1);
    bump(memory.counts.entities, e, times);
  }
  if (params.city?.trim()) {
    const city = params.city.trim();
    bump(memory.counts.locations, city, Math.max(1, countInText(blob, city)));
  }
  for (const h of params.headlines ?? []) {
    bump(memory.counts.headlines, h, 1);
  }
  for (const c of params.ctas ?? []) {
    bump(memory.counts.cta, c, 1);
  }

  memory.usedKeywords = uniqueFromCounts(memory.counts.keywords);
  memory.usedEntities = uniqueFromCounts(memory.counts.entities);
  memory.usedLocations = uniqueFromCounts(memory.counts.locations);
  memory.usedHeadlines = uniqueFromCounts(memory.counts.headlines);
  memory.usedCTA = uniqueFromCounts(memory.counts.cta);
  return memory;
}

function formatCounted(
  map: Record<string, number>,
  limit = 12,
): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => `- ${term} (${count})`);
}

/**
 * Prior memory for regenerate: prefer stored ledger, else rebuild from site copy.
 */
export function resolveSeoMemoryFromSite(
  site: unknown,
): SeoMemory {
  if (!site || typeof site !== "object") return emptySeoMemory();
  const row = site as {
    seoMemory?: SeoMemory | null;
    website?: {
      seo?: { memory?: SeoMemory | null } | null;
      settings?: Record<string, unknown> | null;
      crestis?: { seoMemory?: SeoMemory | null } | null;
    } | null;
    contact?: { address?: string };
    seo?: {
      keywords?: string[];
      entities?: string[];
      title?: string;
      description?: string;
    };
    hero?: {
      headline?: string;
      subheadline?: string;
      primaryCTA?: string;
      secondaryCTA?: string;
    };
    about?: { title?: string; text?: string };
    services?: { title?: string; description?: string }[];
    faq?: { question?: string; answer?: string }[];
    cta?: { headline?: string; primaryCTA?: string; secondaryCTA?: string };
  };

  if (row.seoMemory) return normalizeSeoMemory(row.seoMemory);
  if (row.website?.crestis?.seoMemory) {
    return normalizeSeoMemory(row.website.crestis.seoMemory);
  }
  if (row.website?.settings && "seoMemory" in row.website.settings) {
    return normalizeSeoMemory(
      (row.website.settings as { seoMemory?: SeoMemory }).seoMemory,
    );
  }
  if (row.website?.seo?.memory) {
    return normalizeSeoMemory(row.website.seo.memory);
  }

  const textBlob = [
    row.hero?.headline,
    row.hero?.subheadline,
    row.about?.text,
    ...(row.services ?? []).map((s) => `${s.title ?? ""} ${s.description ?? ""}`),
    ...(row.faq ?? []).map((f) => `${f.question ?? ""} ${f.answer ?? ""}`),
    row.cta?.headline,
    row.cta?.primaryCTA,
    row.seo?.title,
    row.seo?.description,
    ...(row.seo?.keywords ?? []),
  ]
    .filter(Boolean)
    .join("\n");

  return buildSeoMemoryFromSite({
    city: row.contact?.address,
    keywords: [
      ...(row.seo?.keywords ?? []),
      ...(row.seo?.entities ?? []),
    ],
    entities: row.seo?.entities ?? [],
    headlines: [row.hero?.headline, row.about?.title].filter(
      (v): v is string => Boolean(v?.trim()),
    ),
    ctas: [
      row.hero?.primaryCTA,
      row.hero?.secondaryCTA,
      row.cta?.primaryCTA,
      row.cta?.secondaryCTA,
    ].filter((v): v is string => Boolean(v?.trim())),
    textBlob,
  });
}

/** Brief for SEO Planner / Final SEO Review / copy agents */
export function seoMemoryBrief(memory: SeoMemory | null | undefined): string {
  const m = normalizeSeoMemory(memory);
  const hotKeywords = Object.entries(m.counts.keywords).filter(([, c]) => c >= 2);
  const hotLocations = Object.entries(m.counts.locations).filter(
    ([, c]) => c >= 2,
  );

  if (
    !m.usedKeywords.length &&
    !m.usedEntities.length &&
    !m.usedHeadlines.length &&
    !m.usedCTA.length
  ) {
    return "SEO MEMORY: (empty — first generation for this site)";
  }

  return [
    "SEO MEMORY (do not repeat high-count terms without need):",
    "Keywords:",
    ...(formatCounted(m.counts.keywords) || ["- (none)"]),
    "Entities:",
    ...(formatCounted(m.counts.entities) || ["- (none)"]),
    "Locations:",
    ...(formatCounted(m.counts.locations) || ["- (none)"]),
    "Headlines already used:",
    ...m.usedHeadlines.slice(0, 8).map((h) => `- ${h}`),
    "CTAs already used:",
    ...m.usedCTA.slice(0, 8).map((c) => `- ${c}`),
    hotKeywords.length
      ? `Overused keywords (prefer alternatives): ${hotKeywords
          .map(([t, c]) => `${t}×${c}`)
          .join(", ")}`
      : "",
    hotLocations.length
      ? `Location already mentioned often — do not spam city name: ${hotLocations
          .map(([t, c]) => `${t}×${c}`)
          .join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
