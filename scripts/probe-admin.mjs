import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

for (const name of ["api_usage", "openai_usage"]) {
  const res = await fetch(`${url}/rest/v1/${name}?select=id&limit=1`, {
    headers,
  });
  console.log(name, res.status, (await res.text()).slice(0, 200));
}
