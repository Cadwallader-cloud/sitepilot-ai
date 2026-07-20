import { readFileSync, existsSync } from "node:fs";

function load(path) {
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

load(".env.vercel.tmp");
load(".env.local");

const keys = Object.keys(process.env)
  .filter((k) =>
    /SUPABASE|DATABASE|POSTGRES|DIRECT/i.test(k),
  )
  .sort();
console.log("keys:", keys.join(", ") || "(none)");
console.log(
  "hasDbUrl",
  !!(
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL
  ),
);
console.log("hasAccessToken", !!process.env.SUPABASE_ACCESS_TOKEN);
console.log(
  "hasService",
  !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
);
