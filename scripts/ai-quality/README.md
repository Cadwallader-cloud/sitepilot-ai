# Phase 1 — AI Quality Testing

Verifies Crestis does **not** generate the same website 50 times.

## Matrix

| Niche | Count | Cities |
|-------|-------|--------|
| Roofing | 10 | London → Bristol |
| Plumbing | 10 | same 10 cities |
| Electricians | 10 | same |
| Dentists | 10 | same |
| Restaurants | 10 | same |

Cities: London, Manchester, Dallas, Austin, Toronto, Sydney, Berlin, Miami, Glasgow, Bristol.

## What we check

1. **Hero** — no generic “Professional … Services”; city/outcome-specific
2. **About** — no identical paragraphs
3. **Services** — distinct descriptions
4. **FAQ** — niche-aware (dentist emergencies ≠ roof emergencies)
5. **SEO** — unique title / description / keywords
6. **Images** — seed-rotated stock pools (app runtime)
7. **Colors** — niche palettes (roofing ≠ dentist)
8. **CTA** — not always “Contact Us Today”
9. **Testimonials** — unique wording + `demo: true`

## Commands

```bash
# Sample (fast / cheaper)
npm run ai:quality:batch -- --limit=10 --concurrency=2

# One niche
npm run ai:quality:batch -- --niche=roofing

# Full 50
npm run ai:quality:batch -- --limit=50 --concurrency=3

# Score + markdown report
npm run ai:quality:analyze

# Batch + analyze
npm run ai:quality
```

Requires `OPENAI_API_KEY` in `.env.local`. Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).

## Output

- `output/<id>.json` — each generated site
- `output/report.json` — machine-readable scores
- `REPORT.md` — human summary + pass/warn/fail

## Acceptance gates (ship bar)

| Gate | Requirement |
|------|-------------|
| Critical errors | **0** sites with broken hero/CTA/SEO/contact/about |
| Professional | **≥ 90%** of sites look publishable |
| Text repeats | **No** exact/near-duplicate hero, about, SEO, or testimonials |

Analyzer exits `2` if any gate fails.

## Score bands

| Score | Verdict |
|------:|---------|
| ≥ 85 + gates | PASS |
| 70–84 | WARN |
| < 70 | FAIL |
