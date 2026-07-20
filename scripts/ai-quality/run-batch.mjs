/**
 * Phase 1 — AI Quality Testing batch generator.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ai-quality/run-batch.mjs
 *   node --env-file=.env.local scripts/ai-quality/run-batch.mjs --limit=10
 *   node --env-file=.env.local scripts/ai-quality/run-batch.mjs --niche=roofing
 *
 * Writes sites to scripts/ai-quality/output/*.json
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(__dirname, "output");

const SYSTEM = `You are an expert website copywriter for local businesses.

Your task is to create a premium business website that feels UNIQUE to this exact business and city.

Rules:
- Write naturally. Do not sound like AI.
- Focus on conversion.
- Use simple English.
- Mention the city naturally in hero, about, SEO, and FAQ when it fits.
- Never use placeholders like "Lorem ipsum", "Service 1", or "Coming soon".

ANTI-TEMPLATE RULES (critical):
- NEVER use generic hero titles like "Professional Roofing Services", "Quality Plumbing Services", "Expert Dental Care", or "Welcome to Our Restaurant".
- Hero title MUST be specific: include city OR weather/locale OR a concrete outcome.
- Hero CTA must vary — avoid defaulting everything to "Contact Us Today".
- About text must be unique for this city and niche.
- FAQ must match the niche (dentist emergency patients vs roofing emergency roof repair).
- SEO title/description/keywords must include city + niche and differ per business.
- Testimonials are DEMO EXAMPLES only (demo:true), distinct wording, never claim verified real customers.

Return ONLY valid JSON:
{
  "hero": { "headline": "", "subheadline": "", "primaryCTA": "", "secondaryCTA": "" },
  "about": { "title": "", "text": "" },
  "services": [{ "title": "", "description": "" }],
  "testimonials": [{ "name": "", "text": "", "demo": true }],
  "faq": [{ "question": "", "answer": "" }],
  "contact": { "phone": "", "email": "", "address": "" },
  "seo": { "title": "", "description": "", "keywords": ["..."] }
}

- services: 4–6 items
- testimonials: exactly 3 with demo:true
- faq: 4–6 niche-specific items
- seo.keywords: 5–10 local phrases`;

function parseArgs(argv) {
  const out = { limit: 50, niche: null, concurrency: 3 };
  for (const arg of argv) {
    if (arg.startsWith("--limit=")) out.limit = Number(arg.slice(8)) || 50;
    if (arg.startsWith("--niche=")) out.niche = arg.slice(8);
    if (arg.startsWith("--concurrency="))
      out.concurrency = Math.max(1, Number(arg.slice(14)) || 3);
  }
  return out;
}

function userPrompt(row) {
  return [
    "Business:",
    row.businessName,
    "",
    "Location:",
    row.location,
    "",
    "Services:",
    row.services,
    "",
    "Phone:",
    row.phone,
    "",
    "Email:",
    row.email,
    "",
    "Create the premium website JSON now.",
    `Write as if this is the only ${row.location} business of its kind — unique hero, about, FAQ, SEO, and CTAs.`,
    "Write FAQ specifically for this niche and these services — not generic business FAQs.",
    "Write all website copy in English.",
  ].join("\n");
}

const NICHE_TO_TRADE = {
  roofing: "roofing",
  plumbing: "plumbing",
  electricians: "electrician",
  dentists: "dentist",
  restaurants: "restaurant",
};

function detectTrade(row) {
  if (NICHE_TO_TRADE[row.niche]) return NICHE_TO_TRADE[row.niche];
  const t = `${row.niche} ${row.services} ${row.businessName}`.toLowerCase();
  if (
    /restaurant|bistro|cafe|diner|eatery|kitchen|food|menu|pizza|grill|dining/.test(
      t,
    )
  )
    return "restaurant";
  if (/dentist|dental|smile/.test(t)) return "dentist";
  if (/\broofing\b|\broofer\b|\broofs?\b|gutter|shingle|dach/.test(t))
    return "roofing";
  if (/plumb|drain|boiler/.test(t)) return "plumbing";
  if (/electric/.test(t)) return "electrician";
  return "general";
}

const THEMES = {
  roofing: { primary: "#1e3a5f", accent: "#2563eb", style: "bold" },
  plumbing: { primary: "#0f766e", accent: "#14b8a6", style: "professional" },
  electrician: { primary: "#c2410c", accent: "#f97316", style: "bold" },
  dentist: { primary: "#0e7490", accent: "#67e8f9", style: "clean" },
  restaurant: { primary: "#7f1d1d", accent: "#f59e0b", style: "bold" },
  general: { primary: "#1e40af", accent: "#3b82f6", style: "professional" },
};

async function generateOne(openai, model, row) {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt(row) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("EMPTY");
  const content = JSON.parse(raw);
  const trade = detectTrade(row);

  content.testimonials = (content.testimonials ?? []).map((t) => ({
    ...t,
    demo: true,
  }));

  return {
    id: row.id,
    niche: row.niche,
    input: row,
    trade,
    theme: THEMES[trade] ?? THEMES.general,
    site: {
      ...content,
      businessName: row.businessName,
      contact: {
        phone: row.phone,
        email: row.email,
        address: content.contact?.address || row.location,
      },
    },
    generatedAt: new Date().toISOString(),
    model,
  };
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error("OPENAI_API_KEY missing. Use: node --env-file=.env.local ...");
    process.exit(1);
  }

  const matrix = JSON.parse(
    await readFile(path.join(__dirname, "matrix.json"), "utf8"),
  );
  let rows = matrix;
  if (args.niche) rows = rows.filter((r) => r.niche === args.niche);
  rows = rows.slice(0, args.limit);

  await mkdir(OUT_DIR, { recursive: true });
  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  console.log(
    `Generating ${rows.length} sites (concurrency=${args.concurrency}, model=${model})…`,
  );

  const results = await mapPool(rows, args.concurrency, async (row, idx) => {
    process.stdout.write(`[${idx + 1}/${rows.length}] ${row.id}… `);
    try {
      const result = await generateOne(openai, model, row);
      const outPath = path.join(OUT_DIR, `${row.id}.json`);
      await writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
      console.log("ok");
      return { ok: true, id: row.id };
    } catch (err) {
      console.log("FAIL", err instanceof Error ? err.message : err);
      return {
        ok: false,
        id: row.id,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  const summary = {
    total: rows.length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
    outputDir: path.relative(ROOT, OUT_DIR),
    finishedAt: new Date().toISOString(),
  };
  await writeFile(
    path.join(OUT_DIR, "_batch-summary.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
