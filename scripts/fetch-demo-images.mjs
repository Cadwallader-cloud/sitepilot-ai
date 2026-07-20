/**
 * Fetch unique Unsplash photos per demo niche and print a TS map.
 * Requires UNSPLASH_ACCESS_KEY in .env.local
 */
import { readFileSync, writeFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
if (!key) {
  console.error("NO_UNSPLASH_KEY");
  process.exit(1);
}

const queries = {
  roofing: "residential roofing contractor roof house",
  plumbing: "plumber bathroom sink pipes repair",
  electrician: "electrician electrical panel wiring",
  hvac: "hvac air conditioner technician outdoor unit",
  landscaping: "landscaping garden backyard patio",
  painting: "house painter painting interior walls",
  cleaning: "home cleaning service tidy kitchen",
  dental: "dental clinic dentist office modern",
  law: "law office attorney professional meeting",
  restaurant: "restaurant dining room food plating",
  cafe: "coffee shop cafe interior brunch",
  construction: "construction site builders renovation",
};

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
  if (!res.ok) throw new Error(`${query} ${res.status}`);
  const data = await res.json();
  return (data.results ?? [])
    .map((p) => p.urls?.regular?.split("?")[0])
    .filter(Boolean);
}

const pools = {};
for (const [niche, query] of Object.entries(queries)) {
  const a = await search(query, 1);
  await new Promise((r) => setTimeout(r, 800));
  const b = await search(query, 2);
  pools[niche] = [...new Set([...a, ...b])];
  console.log(niche, pools[niche].length);
  await new Promise((r) => setTimeout(r, 800));
}

writeFileSync(
  "scripts/demo-image-pools.json",
  JSON.stringify(pools, null, 2),
);
console.log("wrote scripts/demo-image-pools.json");
