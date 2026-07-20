/**
 * Phase 1 — Diversity analyzer for generated sites.
 *
 * Usage:
 *   node scripts/ai-quality/analyze.mjs
 *
 * Reads scripts/ai-quality/output/*.json and writes REPORT.md + report.json
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");

/** Titles that are essentially these boilerplate phrases (exact or near-exact). */
const BAD_HERO_EXACT = [
  "professional roofing services",
  "quality plumbing services",
  "expert dental care",
  "professional electrician services",
  "welcome to our restaurant",
  "your trusted local experts",
  "quality services you can trust",
];

const BAD_HERO_PATTERNS = [
  /^(professional|quality|expert|trusted)\s+\w+(\s+\w+)?\s+services$/i,
  /^welcome to our .+$/i,
];

const BAD_CTAS = ["contact us today", "get in touch today", "call us today"];

const NICHE_FAQ_HINTS = {
  roofing: [
    /roof|dach/i,
    /leak|undicht/i,
    /storm|hail|gutter|shingle|slate|tile|notfall|flachdach/i,
  ],
  plumbing: [/plumb|drain|boiler|pipe|leak|water heater|rohr|heizung/i],
  electricians: [
    /electric|wiring|panel|eicr|fuse|outlet|charger|strom|wallbox/i,
  ],
  dentists: [
    /dental|dentist|tooth|teeth|emergency patient|whitening|implant|zahn/i,
  ],
  restaurants: [
    /reserv|menu|dining|table|brunch|catering|hours|speisekarte|tisch/i,
  ],
};

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(s) {
  return normalize(s).split(" ").filter(Boolean).length;
}

function isGenericHeroTitle(title) {
  const n = normalize(title);
  if (BAD_HERO_EXACT.some((b) => n === b)) return true;
  if (BAD_HERO_PATTERNS.some((re) => re.test(String(title).trim()))) return true;
  return BAD_HERO_EXACT.some((b) => n.length <= b.length + 8 && n.includes(b));
}

/**
 * Per-site professionalism + critical errors.
 * Critical = broken / unusable. Professional = publishable quality.
 */
function scoreSiteProfessionalism(s) {
  const site = s.site ?? {};
  const city = normalize(s.input?.location ?? "");
  const critical = [];
  const soft = [];

  const heroTitle = site.hero?.headline ?? site.hero?.title ?? "";
  const heroCta = site.hero?.primaryCTA ?? site.hero?.cta ?? "";
  const about = site.about?.text ?? "";
  const services = site.services ?? [];
  const faq = site.faq ?? [];
  const seo = site.seo ?? {};
  const contact = site.contact ?? {};

  if (!heroTitle.trim()) critical.push("missing hero title");
  else if (isGenericHeroTitle(heroTitle)) critical.push("generic hero title");

  if (!heroCta.trim()) critical.push("missing CTA");
  if (wordCount(about) < 25) critical.push("about text too short");
  if (services.length < 3) critical.push("fewer than 3 services");
  if (faq.length < 3) critical.push("fewer than 3 FAQ items");
  if (!seo.title?.trim() || !seo.description?.trim())
    critical.push("incomplete SEO");
  if ((contact.phone ?? "").trim().length < 7) critical.push("missing phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((contact.email ?? "").trim()))
    critical.push("invalid email");

  if (city && !normalize(heroTitle).includes(city.split(" ")[0] ?? ""))
    soft.push("hero missing city");
  if (wordCount(about) < 40) soft.push("about a bit thin");
  if (services.some((svc) => wordCount(svc.description ?? "") < 8))
    soft.push("thin service descriptions");
  if ((seo.keywords ?? []).length < 3) soft.push("few SEO keywords");
  if (BAD_CTAS.includes(normalize(heroCta))) soft.push("generic CTA");
  if ((site.testimonials ?? []).length < 2) soft.push("few testimonials");

  return {
    id: s.id,
    niche: s.niche,
    critical,
    soft,
    professional: critical.length === 0 && soft.length <= 2,
  };
}

function jaccard(a, b) {
  const A = new Set(normalize(a).split(" ").filter(Boolean));
  const B = new Set(normalize(b).split(" ").filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

function duplicates(values, threshold = 0.92) {
  const dups = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const sim = jaccard(values[i].text, values[j].text);
      if (sim >= threshold || normalize(values[i].text) === normalize(values[j].text)) {
        dups.push({
          a: values[i].id,
          b: values[j].id,
          similarity: Number(sim.toFixed(3)),
          sample: values[i].text.slice(0, 80),
        });
      }
    }
  }
  return dups;
}

function frequencyMap(items) {
  const map = new Map();
  for (const item of items) {
    const key = normalize(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));
}

async function loadSites() {
  const files = (await readdir(OUT_DIR))
    .filter(
      (f) =>
        f.endsWith(".json") &&
        !f.startsWith("_") &&
        f !== "report.json",
    )
    .sort();
  const sites = [];
  for (const file of files) {
    const raw = JSON.parse(await readFile(path.join(OUT_DIR, file), "utf8"));
    sites.push(raw);
  }
  return sites;
}

function analyze(sites) {
  const heroes = sites.map((s) => ({
    id: s.id,
    text: s.site?.hero?.headline ?? s.site?.hero?.title ?? "",
  }));
  const abouts = sites.map((s) => ({
    id: s.id,
    text: s.site?.about?.text ?? "",
  }));
  const ctas = sites.map((s) => ({
    id: s.id,
    text: s.site?.hero?.primaryCTA ?? s.site?.hero?.cta ?? "",
  }));
  const seoTitles = sites.map((s) => ({
    id: s.id,
    text: s.site?.seo?.title ?? "",
  }));
  const seoDescs = sites.map((s) => ({
    id: s.id,
    text: s.site?.seo?.description ?? "",
  }));
  const testimonials = sites.flatMap((s) =>
    (s.site?.testimonials ?? []).map((t, i) => ({
      id: `${s.id}#${i}`,
      text: t.text ?? "",
      demo: t.demo === true,
    })),
  );

  const serviceDescs = sites.flatMap((s) =>
    (s.site?.services ?? []).map((svc, i) => ({
      id: `${s.id}#svc${i}`,
      text: svc.description ?? "",
    })),
  );

  const themes = sites.map((s) => ({
    id: s.id,
    niche: s.niche,
    primary: s.theme?.primary,
    accent: s.theme?.accent,
  }));

  const badHeroHits = heroes.filter((h) => isGenericHeroTitle(h.text));
  const perSite = sites.map(scoreSiteProfessionalism);
  const criticalSites = perSite.filter((p) => p.critical.length > 0);
  const professionalSites = perSite.filter((p) => p.professional);
  const professionalRate = sites.length
    ? Number((professionalSites.length / sites.length).toFixed(3))
    : 0;

  const genericCtaHits = ctas.filter((c) =>
    BAD_CTAS.includes(normalize(c.text)),
  );

  const faqChecks = sites.map((s) => {
    const hints = NICHE_FAQ_HINTS[s.niche] ?? [];
    const faqs = s.site?.faq ?? [];
    const joined = faqs.map((f) => `${f.question} ${f.answer}`).join(" ");
    const matched = hints.some((re) => re.test(joined));
    return {
      id: s.id,
      niche: s.niche,
      faqCount: faqs.length,
      nicheRelevant: matched,
      sampleQuestions: faqs.slice(0, 2).map((f) => f.question),
    };
  });

  const colorByNiche = {};
  for (const t of themes) {
    colorByNiche[t.niche] ??= new Set();
    colorByNiche[t.niche].add(`${t.primary}|${t.accent}`);
  }

  const roofVsDentist =
    colorByNiche.roofing && colorByNiche.dentists
      ? [...colorByNiche.roofing].some((c) => colorByNiche.dentists.has(c))
      : null;

  const cityInHero = sites.filter((s) => {
    const city = normalize(s.input?.location ?? "");
    const title = normalize(
      s.site?.hero?.headline ?? s.site?.hero?.title ?? "",
    );
    return city && title.includes(city);
  }).length;

  const demoOk = testimonials.every((t) => t.demo);

  const report = {
    generatedAt: new Date().toISOString(),
    totalSites: sites.length,
    byNiche: Object.fromEntries(
      ["roofing", "plumbing", "electricians", "dentists", "restaurants"].map(
        (n) => [n, sites.filter((s) => s.niche === n).length],
      ),
    ),
    checks: {
      hero: {
        badGenericTitles: badHeroHits,
        exactDuplicateTitles: frequencyMap(heroes.map((h) => h.text)),
        nearDuplicatePairs: duplicates(heroes, 0.88),
        cityMentionedInHero: cityInHero,
        cityMentionRate: sites.length
          ? Number((cityInHero / sites.length).toFixed(3))
          : 0,
      },
      about: {
        exactDuplicates: frequencyMap(abouts.map((a) => a.text)),
        nearDuplicatePairs: duplicates(abouts, 0.9),
      },
      services: {
        nearDuplicatePairs: duplicates(serviceDescs, 0.95).slice(0, 40),
      },
      faq: {
        nicheMismatch: faqChecks.filter((f) => !f.nicheRelevant),
        samples: faqChecks.slice(0, 10),
      },
      seo: {
        duplicateTitles: frequencyMap(seoTitles.map((s) => s.text)),
        duplicateDescriptions: frequencyMap(seoDescs.map((s) => s.text)),
        nearDuplicateTitlePairs: duplicates(seoTitles, 0.92),
      },
      cta: {
        genericCtaCount: genericCtaHits.length,
        genericCtaRate: sites.length
          ? Number((genericCtaHits.length / sites.length).toFixed(3))
          : 0,
        genericHits: genericCtaHits,
        ctaFrequency: frequencyMap(ctas.map((c) => c.text)),
      },
      testimonials: {
        allMarkedDemo: demoOk,
        exactDuplicates: frequencyMap(testimonials.map((t) => t.text)),
        nearDuplicatePairs: duplicates(testimonials, 0.92).slice(0, 30),
      },
      colors: {
        byNiche: Object.fromEntries(
          Object.entries(colorByNiche).map(([k, v]) => [k, [...v]]),
        ),
        roofingSharesDentistPalette: roofVsDentist,
      },
      professionalism: {
        professionalCount: professionalSites.length,
        professionalRate,
        criticalSiteCount: criticalSites.length,
        criticalSites: criticalSites.slice(0, 20),
        unprofessionalSoft: perSite
          .filter((p) => !p.professional && p.critical.length === 0)
          .slice(0, 20),
      },
    },
  };

  const obviousRepeats =
    report.checks.hero.exactDuplicateTitles.length +
      report.checks.hero.nearDuplicatePairs.length +
      report.checks.about.exactDuplicates.length +
      report.checks.about.nearDuplicatePairs.length +
      report.checks.testimonials.exactDuplicates.length +
      report.checks.seo.duplicateTitles.length >
    0;

  const gates = {
    noCriticalErrors: {
      pass: criticalSites.length === 0,
      detail: `${criticalSites.length} site(s) with critical errors`,
    },
    professionalAtLeast90: {
      pass: professionalRate >= 0.9,
      detail: `${(professionalRate * 100).toFixed(0)}% professional (${professionalSites.length}/${sites.length})`,
    },
    noObviousTextRepeats: {
      pass: !obviousRepeats,
      detail: obviousRepeats
        ? "Found exact/near-duplicate hero, about, SEO, or testimonials"
        : "No obvious text repeats across sites",
    },
  };
  report.gates = gates;
  report.gatesPass = Object.values(gates).every((g) => g.pass);

  // Score 0–100
  let score = 100;
  const penalties = [];
  const add = (pts, reason) => {
    score -= pts;
    penalties.push({ pts, reason });
  };

  if (report.checks.hero.exactDuplicateTitles.length)
    add(15, "Exact duplicate hero titles");
  if (report.checks.hero.nearDuplicatePairs.length)
    add(10, "Near-duplicate hero titles");
  if (report.checks.hero.badGenericTitles.length)
    add(20, "Generic bad hero titles");
  if (report.checks.about.exactDuplicates.length)
    add(15, "Exact duplicate about paragraphs");
  if (report.checks.about.nearDuplicatePairs.length)
    add(8, "Near-duplicate about paragraphs");
  if (report.checks.faq.nicheMismatch.length)
    add(
      Math.min(20, report.checks.faq.nicheMismatch.length),
      "FAQ not niche-relevant",
    );
  if (report.checks.seo.duplicateTitles.length)
    add(10, "Duplicate SEO titles");
  if (report.checks.seo.duplicateDescriptions.length)
    add(8, "Duplicate SEO descriptions");
  if (report.checks.cta.genericCtaRate > 0.5)
    add(10, "Over half CTAs are generic Contact Us Today");
  if (!report.checks.testimonials.allMarkedDemo)
    add(10, "Testimonials missing demo:true");
  if (report.checks.testimonials.exactDuplicates.length)
    add(10, "Exact duplicate testimonials");
  if (report.checks.colors.roofingSharesDentistPalette)
    add(10, "Roofing and dentist share same palette");
  if (report.checks.hero.cityMentionRate < 0.4)
    add(5, "Fewer than 40% heroes mention city");
  if (criticalSites.length)
    add(Math.min(30, criticalSites.length * 5), "Critical per-site errors");
  if (professionalRate < 0.9)
    add(15, "Fewer than 90% sites look professional");

  report.score = Math.max(0, score);
  report.verdict = report.gatesPass
    ? "PASS — no critical errors, ≥90% professional, no obvious repeats"
    : report.score >= 70
      ? "WARN — acceptance gates not fully met"
      : "FAIL — quality below ship bar";
  report.penalties = penalties;

  return report;
}

function toMarkdown(report) {
  const g = report.gates ?? {};
  const mark = (ok) => (ok ? "✅" : "❌");
  const lines = [
    "# AI Quality Report — Phase 1",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `**Score: ${report.score}/100** — ${report.verdict}`,
    "",
    `Sites analyzed: **${report.totalSites}**`,
    "",
    "## Acceptance gates",
    "",
    `${mark(g.noCriticalErrors?.pass)} **No critical errors** — ${g.noCriticalErrors?.detail ?? ""}`,
    `${mark(g.professionalAtLeast90?.pass)} **≥90% sites look professional** — ${g.professionalAtLeast90?.detail ?? ""}`,
    `${mark(g.noObviousTextRepeats?.pass)} **No obvious text repeats** — ${g.noObviousTextRepeats?.detail ?? ""}`,
    "",
    `**Gates overall: ${report.gatesPass ? "PASS" : "FAIL"}**`,
    "",
    "## Coverage",
    "",
    ...Object.entries(report.byNiche).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Penalties",
    "",
  ];

  if (!report.penalties.length) lines.push("- None");
  else
    for (const p of report.penalties)
      lines.push(`- −${p.pts}: ${p.reason}`);

  const crit = report.checks.professionalism?.criticalSites ?? [];
  if (crit.length) {
    lines.push("", "### Critical sites", "");
    for (const c of crit.slice(0, 15))
      lines.push(`- \`${c.id}\`: ${c.critical.join(", ")}`);
  }

  const h = report.checks.hero;
  lines.push(
    "",
    "## 1. Hero",
    "",
    `- City mentioned in hero: ${(h.cityMentionRate * 100).toFixed(0)}% (${h.cityMentionedInHero}/${report.totalSites})`,
    `- Bad generic titles: ${h.badGenericTitles.length}`,
    `- Exact duplicate titles: ${h.exactDuplicateTitles.length}`,
    `- Near-duplicate pairs: ${h.nearDuplicatePairs.length}`,
  );
  if (h.badGenericTitles.length) {
    lines.push("", "Bad heroes:");
    for (const b of h.badGenericTitles.slice(0, 15))
      lines.push(`- \`${b.id}\`: ${b.text}`);
  }

  const a = report.checks.about;
  lines.push(
    "",
    "## 2. About",
    "",
    `- Exact duplicates: ${a.exactDuplicates.length}`,
    `- Near-duplicate pairs: ${a.nearDuplicatePairs.length}`,
  );

  lines.push(
    "",
    "## 3. Services",
    "",
    `- Near-duplicate description pairs (top): ${report.checks.services.nearDuplicatePairs.length}`,
  );

  const f = report.checks.faq;
  lines.push(
    "",
    "## 4. FAQ",
    "",
    `- Niche mismatches: ${f.nicheMismatch.length}`,
  );
  if (f.nicheMismatch.length) {
    for (const m of f.nicheMismatch.slice(0, 15))
      lines.push(
        `- \`${m.id}\` (${m.niche}): ${m.sampleQuestions.join(" | ") || "(empty)"}`,
      );
  }

  const seo = report.checks.seo;
  lines.push(
    "",
    "## 5. SEO",
    "",
    `- Duplicate titles: ${seo.duplicateTitles.length}`,
    `- Duplicate descriptions: ${seo.duplicateDescriptions.length}`,
  );

  const cta = report.checks.cta;
  lines.push(
    "",
    "## 6. CTA",
    "",
    `- Generic CTA rate: ${(cta.genericCtaRate * 100).toFixed(0)}%`,
    `- Top CTAs:`,
  );
  for (const row of cta.ctaFrequency.slice(0, 8))
    lines.push(`  - "${row.text}" ×${row.count}`);

  const t = report.checks.testimonials;
  lines.push(
    "",
    "## 7. Testimonials",
    "",
    `- All marked demo: ${t.allMarkedDemo ? "yes" : "NO"}`,
    `- Exact duplicates: ${t.exactDuplicates.length}`,
    `- Near-duplicate pairs: ${t.nearDuplicatePairs.length}`,
  );

  lines.push(
    "",
    "## 8. Colors",
    "",
    `- Roofing shares dentist palette: ${report.checks.colors.roofingSharesDentistPalette}`,
    "",
  );
  for (const [niche, pals] of Object.entries(report.checks.colors.byNiche)) {
    lines.push(`- **${niche}**: ${pals.join(", ")}`);
  }

  lines.push(
    "",
    "## How to re-run",
    "",
    "```bash",
    "npm run ai:quality:batch -- --limit=50",
    "npm run ai:quality:analyze",
    "```",
    "",
  );

  return lines.join("\n");
}

async function main() {
  const sites = await loadSites();
  if (!sites.length) {
    console.error(
      "No sites in output/. Run: npm run ai:quality:batch -- --limit=10",
    );
    process.exit(1);
  }
  const report = analyze(sites);
  await writeFile(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify(report, null, 2),
  );
  const md = toMarkdown(report);
  await writeFile(path.join(__dirname, "REPORT.md"), md);
  await writeFile(path.join(OUT_DIR, "REPORT.md"), md);
  console.log(md);
  console.log(`\nWrote scripts/ai-quality/REPORT.md (score ${report.score}/100)`);
  if (!report.gatesPass) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
