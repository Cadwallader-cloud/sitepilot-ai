import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const withPlan = await fetch(
  `${url}/rest/v1/projects?select=id,plan&limit=1`,
  { headers },
);
console.log("with plan", withPlan.status, await withPlan.text());

const noPlan = await fetch(
  `${url}/rest/v1/projects?select=id,business_name,slug,published_at&limit=1`,
  { headers },
);
console.log("no plan", noPlan.status, await noPlan.text());
