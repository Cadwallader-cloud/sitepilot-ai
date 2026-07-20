import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NO_ENV");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function probe(name) {
  const res = await fetch(
    `${url}/rest/v1/${name}?select=id&limit=1`,
    { headers },
  );
  const text = await res.text();
  console.log(name, res.status, text.slice(0, 300));
}

await probe("projects");
await probe("analytics_events");
