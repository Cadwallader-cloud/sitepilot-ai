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
    if (!val || /SENSITIVE/i.test(val)) continue;
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.vercel.tmp"));

const SCHEMA_ORDER = [
  "schema.sql",
  "schema-auth.sql",
  "schema-publish.sql",
  "schema-admin.sql",
  "schema-billing.sql",
  "schema-subscriptions.sql",
  "schema-billing-v2.sql",
  "schema-crypto-orders.sql",
  "schema-payment-wallets.sql",
  "schema-add-btc.sql",
  "schema-leads.sql",
  "schema-analytics-simple.sql",
  "schema-analytics.sql",
  "schema-multitenant.sql",
  "schema-retry-attempt-logs.sql",
];

const VERIFY_TABLES = [
  "projects",
  "email_otps",
  "api_usage",
  "openai_usage",
  "plans",
  "subscriptions",
  "crypto_orders",
  "payment_wallets",
  "leads",
  "analytics_events",
  "retry_attempt_logs",
];

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const dbUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.DIRECT_URL?.trim();

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return null;
  }
}

function isAlreadyExistsError(msg) {
  const s = String(msg || "").toLowerCase();
  return (
    s.includes("already exists") ||
    s.includes("duplicate") ||
    /\b42p07\b/.test(s) ||
    /\b42710\b/.test(s)
  );
}

async function runSqlManagement(sql) {
  const ref = projectRefFromUrl(supabaseUrl || "");
  if (!ref || !accessToken) {
    return { ok: false, skipped: true, detail: "no access token/ref" };
  }
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
    return { ok: false, status: res.status, detail: text.slice(0, 400) };
  }
  return { ok: true, via: "management" };
}

async function runSqlPg(sql, client) {
  await client.query(sql);
  return { ok: true, via: "pg" };
}

async function verifyViaRest() {
  if (!supabaseUrl || !serviceKey) {
    console.warn("Skip verify: missing SUPABASE_URL / SERVICE_ROLE");
    return;
  }
  for (const t of VERIFY_TABLES) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${t}?select=*&limit=0`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
    });
    const range = res.headers.get("content-range") || "-";
    const err = res.ok ? "" : (await res.text()).slice(0, 160);
    console.log(
      `verify ${t}: status=${res.status} range=${range}${res.ok ? "" : " err=" + err}`,
    );
  }
}

console.log("Credentials (booleans only):", {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceRole: !!serviceKey,
  hasAccessToken: !!accessToken,
  hasDbUrl: !!dbUrl,
  projectRef: projectRefFromUrl(supabaseUrl || "") || null,
});

let pgClient = null;
const require = createRequire(import.meta.url);
if (!accessToken && dbUrl) {
  let pg;
  try {
    pg = require("pg");
  } catch {
    console.error("Install pg: npm i -D pg");
    process.exitCode = 1;
  }
  if (pg) {
    pgClient = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await pgClient.connect();
  }
}

if (!accessToken && !pgClient) {
  console.error(
    "Cannot apply SQL: need SUPABASE_ACCESS_TOKEN or DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL / DIRECT_URL.",
  );
  console.error("Will still attempt REST verification with service role.");
  await verifyViaRest();
  process.exit(1);
}

const results = [];
for (const name of SCHEMA_ORDER) {
  const path = resolve(root, "supabase", name);
  if (!existsSync(path)) {
    console.log(`SKIP missing: ${name}`);
    results.push({ name, status: "missing" });
    continue;
  }
  const sql = readFileSync(path, "utf8");
  process.stdout.write(`APPLY ${name} ... `);
  try {
    let r;
    if (accessToken) {
      r = await runSqlManagement(sql);
      if (!r.ok && r.skipped && pgClient) r = await runSqlPg(sql, pgClient);
    } else {
      r = await runSqlPg(sql, pgClient);
    }
    if (r.ok) {
      console.log(`OK via ${r.via}`);
      results.push({ name, status: "ok", via: r.via });
    } else if (isAlreadyExistsError(r.detail)) {
      console.log(`WARN already-exists: ${(r.detail || "").slice(0, 200)}`);
      results.push({
        name,
        status: "already_exists",
        detail: (r.detail || "").slice(0, 200),
      });
    } else {
      console.log(`FAIL: ${(r.detail || JSON.stringify(r)).slice(0, 300)}`);
      results.push({
        name,
        status: "fail",
        detail: (r.detail || "").slice(0, 300),
      });
    }
  } catch (e) {
    const msg = e?.message || String(e);
    if (isAlreadyExistsError(msg)) {
      console.log(`WARN already-exists: ${msg.slice(0, 200)}`);
      results.push({ name, status: "already_exists", detail: msg.slice(0, 200) });
    } else {
      console.log(`FAIL: ${msg.slice(0, 300)}`);
      results.push({ name, status: "fail", detail: msg.slice(0, 300) });
    }
  }
}

if (pgClient) await pgClient.end();

console.log("\n--- Summary ---");
for (const r of results) {
  console.log(
    `${r.name}: ${r.status}${r.via ? " (" + r.via + ")" : ""}${r.detail ? " :: " + r.detail : ""}`,
  );
}

console.log("\n--- Verify ---");
await verifyViaRest();

if (results.some((r) => r.status === "fail")) process.exitCode = 1;

