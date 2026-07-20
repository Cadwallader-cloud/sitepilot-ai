import { readFileSync, writeFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
const pools = JSON.parse(readFileSync("scripts/demo-image-pools.json", "utf8"));

async function search(query, page = 1) {
  const params = new URLSearchParams({
    query,
    per_page: "30",
    page: String(page),
    orientation: "landscape",
    content_filter: "high",
  });
  const res = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    { headers: { Authorization: `Client-ID ${key}` } },
  );
  if (!res.ok) {
    console.warn("fail", query, res.status);
    return [];
  }
  const data = await res.json();
  return (data.results ?? [])
    .map((p) => p.urls?.regular?.split("?")[0])
    .filter(Boolean);
}

// refill thin pools
for (const [niche, query] of [
  ["dental", "dentist dental clinic"],
  ["dental", "dental office chair"],
  ["law", "lawyer office desk"],
  ["law", "courthouse justice"],
  ["painting", "house painting exterior brush"],
  ["hvac", "air conditioning technician"],
  ["landscaping", "garden design outdoor living"],
]) {
  const extra = await search(query, 1);
  pools[niche] = [...new Set([...(pools[niche] ?? []), ...extra])];
  console.log("extra", niche, pools[niche].length);
  await new Promise((r) => setTimeout(r, 700));
}

/** slug -> niche key in pools */
const assignments = [
  ["roofing", "roofing"],
  ["apex-roofing-dallas", "roofing"],
  ["harbor-roofing-seattle", "roofing"],
  ["plumbing", "plumbing"],
  ["pipewright-chicago", "plumbing"],
  ["clearflow-phoenix", "plumbing"],
  ["electrician", "electrician"],
  ["brightline-electric-boston", "electrician"],
  ["spark-city-electric-nyc", "electrician"],
  ["climate-pro-hvac-atlanta", "hvac"],
  ["northwind-hvac-minneapolis", "hvac"],
  ["airwell-hvac-houston", "hvac"],
  ["landscaping", "landscaping"],
  ["stonepath-landscapes-austin", "landscaping"],
  ["greenline-care-charlotte", "landscaping"],
  ["brushwork-painting-nashville", "painting"],
  ["colorfield-painting-san-diego", "painting"],
  ["sparkle-home-cleaning-denver", "cleaning"],
  ["proshine-commercial-cleaning", "cleaning"],
  ["brightsmile-dental-austin", "dental"],
  ["harbor-dental-group", "dental"],
  ["sterling-law-group", "law"],
  ["northside-family-law", "law"],
  ["ember-table-restaurant", "restaurant"],
  ["noon-kitchen-cafe", "cafe"],
  ["construction", "construction"],
];

const used = new Set();
const cursors = Object.fromEntries(Object.keys(pools).map((k) => [k, 0]));

function take(niche, n) {
  const pool = pools[niche] ?? [];
  const out = [];
  while (out.length < n && cursors[niche] < pool.length) {
    const url = pool[cursors[niche]++];
    if (!url || used.has(url)) continue;
    used.add(url);
    out.push(`${url}?auto=format&fit=crop&w=${out.length === 0 ? 1600 : 800}&q=80`);
  }
  // fallback: allow reuse within niche if pool exhausted
  while (out.length < n && pool.length) {
    const url = pool[out.length % pool.length];
    out.push(
      `${url}?auto=format&fit=crop&w=${out.length === 0 ? 1600 : 800}&q=80`,
    );
  }
  return out;
}

const map = {};
for (const [slug, niche] of assignments) {
  const imgs = take(niche, 4);
  map[slug] = {
    hero: imgs[0],
    gallery: [imgs[1] ?? imgs[0], imgs[2] ?? imgs[0], imgs[3] ?? imgs[0]],
  };
  console.log(slug, niche, imgs.length);
}

const ts = `/** Auto-generated unique Unsplash images per demo — do not hand-edit */
export const demoImages = ${JSON.stringify(map, null, 2)} as const;

export type DemoImageSlug = keyof typeof demoImages;
`;

writeFileSync("src/lib/demo-images.ts", ts);
writeFileSync("scripts/demo-image-pools.json", JSON.stringify(pools, null, 2));
console.log("wrote src/lib/demo-images.ts", Object.keys(map).length);
