/**
 * Apply supabase/schema-subscriptions.sql using SUPABASE_URL + SERVICE_ROLE
 * via PostgREST is not possible for DDL — uses the Supabase Database query
 * API when SUPABASE_ACCESS_TOKEN is set, otherwise falls back to `pg` with
 * DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const sqlPath = resolve(root, "supabase/schema-subscriptions.sql");
const sql = readFileSync(sqlPath, "utf8");

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const dbUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0];
  } catch {
    return null;
  }
}

async function viaManagementApi() {
  const ref = projectRefFromUrl(supabaseUrl || "");
  if (!ref || !accessToken) return false;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("Management API failed:", res.status, text.slice(0, 500));
    return false;
  }
  console.log("OK: schema applied via Supabase Management API");
  return true;
}

async function viaPg() {
  if (!dbUrl) return false;
  const require = createRequire(import.meta.url);
  let pg;
  try {
    pg = require("pg");
  } catch {
    console.error("Install pg: npm i -D pg");
    return false;
  }
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK: schema applied via DATABASE_URL");
    return true;
  } finally {
    await client.end();
  }
}

async function verifyViaRest() {
  if (!supabaseUrl || !serviceKey) {
    console.warn("Skip verify: missing SUPABASE_URL / SERVICE_ROLE");
    return;
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/plans?select=id&limit=5`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Verify failed (run SQL manually?):", res.status, text.slice(0, 300));
    process.exitCode = 1;
    return;
  }
  console.log("Verify plans:", text);
}

const okApi = await viaManagementApi();
const okPg = okApi ? false : await viaPg();

if (!okApi && !okPg) {
  console.error(`
Could not apply SQL automatically.
Need one of:
  - SUPABASE_ACCESS_TOKEN (supabase.com account token)
  - DATABASE_URL / SUPABASE_DB_URL (Postgres connection string)

Or paste supabase/schema-subscriptions.sql into the Supabase SQL Editor.
`);
  process.exitCode = 1;
} else {
  await verifyViaRest();
}
