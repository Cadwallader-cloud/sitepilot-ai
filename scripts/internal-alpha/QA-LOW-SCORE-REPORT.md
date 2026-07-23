# QA Low-Score Analysis — Internal Alpha Output

**Generated:** 2026-07-23  
**Data source:** `scripts/internal-alpha/output/roofing-*.json` (10 sites)  
**Scoring engine:** `auditWebsiteWithRules()` in `src/lib/quality-audit.ts` (`source: "rules"`)  
**Analysis only — no code changes**

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total sites analyzed | 10 |
| Sites with QA score **&lt; 90** | **3** (30%) |
| Score range (low cohort) | **80–87** |
| Score range (all sites) | 80–95 |
| Batch A (≈09:51–09:54 UTC) | 5 sites — berlin, bristol, glasgow, miami, sydney |
| Batch B (≈10:09–10:11 UTC) | 5 sites — austin, dallas, london, manchester, toronto |

**Headline:** Only 3 of 10 alpha sites miss the Sprint D QA target (&gt; 90). All three fail on **content-quality checks** (readability, word repetition, and/or about-localization) — not on structural gates (hero, services, FAQ, SEO, contact, images). **Readability (paragraph length)** appears on every site in the dataset and is the dominant score drag; among sub-90 sites it is universal and drives the only **fail**-level penalty.

Note: `_alpha-summary.json` reflects the **5-site Batch B** run (`avgScore: 90`). `report.json` aggregates **all 10 sites** from both batches.

---

## How QA Scoring Works

Final QA score starts at **100** and subtracts per-check penalties (`src/lib/quality-audit.ts`).

### Structural checks (built into `auditWebsiteWithRules`)

| Check ID | Label | Typical penalties |
|----------|-------|-------------------|
| `hero` | Hero | fail −15/−20, warn −4/−6 |
| `cta` | CTA | fail −12, warn −8 |
| `about` | About | fail −10, **warn −4** (city not in body text) |
| `services` | Services | fail −10, warn −5/−8 |
| `faq` | FAQ | fail −10, warn −4 |
| `seo` | SEO | fail −12, warn −4 |
| `contact` | Contact | fail −12, warn −3 |
| `local` | Local | fail −10, warn −3 |
| `images` | Images | fail −10 |
| `mobile` | Mobile | always pass |
| `testimonials` | Reviews | warn −6 (duplicates) |

### Content-review enrichment (`enrichAuditWithContentReview`)

Maps content reviewers from `src/lib/review/content/reviewers/` into QA checks:

| QA check ID | Source reviewer | Penalties (fail / warn) |
|-------------|-----------------|-------------------------|
| `readability` | `reviewReadability()` — worst of paragraph_lines, passive_voice, simple_english | **−12 / −5** |
| `long_sentences` | `reviewReadability()` → `short_sentences` check | −8 / **−4** |
| `word_repetition` | `reviewUniqueness()` → `word_repetition` check | −10 / **−4** |
| `generic_phrases` | `reviewUniqueness()` → AI cliché checks | −14 / −6 |
| `local_specificity` | `reviewHero()` → geo/headline checks | −10 / −5 |
| `hero` (content) | `reviewHero()` → headline/value checks | −8 / −4 |
| `cta` (content) | `reviewCta()` → strength checks | −8 / −5 |

**Key rule:** For enrichment checks, upgrading warn → fail only deducts the **delta** (e.g. readability warn −5 → fail adds −7 more).

---

## Per-Site Breakdown (QA &lt; 90)

### 1. `roofing-austin` — **80** (Batch B)

| Check | Status | Penalty | Reviewer / source | Message |
|-------|--------|---------|-------------------|---------|
| **readability** | **fail** | **−12** | `reviewReadability` → `paragraph_lines` | Paragraphs are too long — keep blocks to three lines or fewer |
| long_sentences | warn | −4 | `reviewReadability` → `short_sentences` | Some sentences run long — trim toward short, direct phrasing |
| word_repetition | warn | −4 | `reviewUniqueness` → `word_repetition` | Repeated words: **solar** |
| *All other checks* | pass | — | structural | hero, cta, about, services, faq, seo, contact, local, images, mobile, testimonials |

**Penalty math:** 100 − 12 − 4 − 4 = **80** ✓  
**Summary:** `"Fix 1 issue before publishing"` (1 fail, 2 warns)

**Root cause:** About paragraphs are dense single blocks (~40+ words each) discussing solar-ready roofing; “solar” repeats across hero, about, services, and FAQ. Austin mentions the city in about body text (passes structural `about`), but paragraph line count exceeds 4 rendered lines → readability **fail**.

---

### 2. `roofing-berlin` — **87** (Batch A)

| Check | Status | Penalty | Reviewer / source | Message |
|-------|--------|---------|-------------------|---------|
| about | warn | −4 | structural `about` gate | About should mention the city |
| readability | warn | −5 | `reviewReadability` → `paragraph_lines` | Some paragraphs exceed three lines — break them up for mobile reading |
| word_repetition | warn | −4 | `reviewUniqueness` → `word_repetition` | Repeated words: **repair** |
| *All other checks* | pass | — | | |

**Penalty math:** 100 − 4 − 5 − 4 = **87** ✓  
**Summary:** `"3 improvements suggested"`

**Root cause:** About **title** says “Berlin” but **`about.text` body never contains “Berlin”** (city appears in hero and service descriptions only). German/English mixed copy repeats “repair/tarp/estimate” vocabulary. Paragraphs are 3-line warn tier, not fail tier.

---

### 3. `roofing-toronto` — **87** (Batch B)

| Check | Status | Penalty | Reviewer / source | Message |
|-------|--------|---------|-------------------|---------|
| about | warn | −4 | structural `about` gate | About should mention the city |
| readability | warn | −5 | `reviewReadability` → `paragraph_lines` | Some paragraphs exceed three lines — break them up for mobile reading |
| word_repetition | warn | −4 | `reviewUniqueness` → `word_repetition` | Repeated words: **estimate** |
| *All other checks* | pass | — | | |

**Penalty math:** 100 − 4 − 5 − 4 = **87** ✓  
**Summary:** `"3 improvements suggested"`

**Root cause:** About mentions neighbourhoods (Harbourfront, Etobicoke, etc.) but **`about.text` never contains “Toronto”** — `mentionsCity()` only matches the configured location string. “Estimate” repeats across about and services.

---

## Sites at or above 90 (context)

| Site | Score | Non-pass checks | Notes |
|------|-------|-----------------|-------|
| roofing-glasgow | 91 | hero (warn), readability (warn) | Headline only 5 words |
| roofing-london | 91 | readability, word_repetition | Would be 87 with same pattern as berlin if about failed |
| roofing-sydney | 91 | readability, long_sentences | |
| roofing-bristol | 95 | readability only | |
| roofing-dallas | 95 | readability only | |
| roofing-manchester | 95 | readability only | |
| roofing-miami | 95 | readability only | |

**Pattern:** Sites scoring 95 have **only** the readability warn (−5). Sites at 91 stack readability with one additional warn (−4). Sub-90 sites stack **three** warns or a readability **fail**.

---

## Recurring Issues (sub-90 cohort)

| Issue | Check ID | Reviewer | Count | Sites affected | Worst status | Penalty range |
|-------|----------|----------|-------|----------------|--------------|---------------|
| Paragraph too long / not mobile-scannable | `readability` | `reviewReadability` | **3/3** | austin, berlin, toronto | fail (austin) | −5 to −12 |
| Overused niche vocabulary | `word_repetition` | `reviewUniqueness` | **3/3** | austin, berlin, toronto | warn | −4 |
| City missing from about body | `about` | structural gate | **2/3** | berlin, toronto | warn | −4 |
| Long sentences | `long_sentences` | `reviewReadability` | **1/3** | austin | warn | −4 |

## Recurring Issues (all 10 sites)

| Issue | Count | Sites | In sub-90? |
|-------|-------|-------|------------|
| Paragraph length (readability) | **10/10** | all | yes — universal |
| Word repetition | 4/10 | austin, berlin, london, toronto | 3/4 sub-90 |
| About city in body | 2/10 | berlin, toronto | both sub-90 |
| Long sentences | 2/10 | austin, sydney | 1 sub-90 |
| Hero headline word count | 1/10 | glasgow (score 91) | no |

---

## Top 5 Quality Problems (ranked)

Ranked by **frequency among sub-90 sites × penalty severity × fleet-wide prevalence**.

### 1. About paragraph length exceeds mobile limit

- **Evidence:** 3/3 sub-90 sites; **10/10** fleet-wide at least warn; 1/3 at fail level (austin).
- **Reviewer:** `reviewReadability` → `paragraph_lines` → QA `readability`.
- **Impact:** −5 (warn) to **−12 (fail)** — largest single-check penalty in the low cohort.
- **Typical copy pattern:** Two dense about paragraphs, ~35–50 words each, generated as single blocks.

### 2. Niche keyword repetition (templated feel)

- **Evidence:** 3/3 sub-90; 4/10 fleet-wide.
- **Reviewer:** `reviewUniqueness` → `word_repetition` → QA `word_repetition`.
- **Impact:** −4 warn each; words flagged: *solar*, *repair*, *estimate*, *inspect*.
- **Typical copy pattern:** Service-focused sites repeat the primary offer noun across hero, about, services, FAQ.

### 3. City name absent from about body text

- **Evidence:** 2/3 sub-90; 2/10 fleet-wide (both sub-90).
- **Reviewer:** structural `about` check (`mentionsCity(site.about.text, location)`).
- **Impact:** −4 warn.
- **False-negative pattern:** City appears in about **title** or neighbourhood list but not in `about.text` string the auditor reads.

### 4. Long sentences in body copy

- **Evidence:** 1/3 sub-90 (austin); 2/10 fleet-wide.
- **Reviewer:** `reviewReadability` → `short_sentences` → QA `long_sentences`.
- **Impact:** −4 warn; stacks with readability on austin (−16 combined content penalty).

### 5. Readability warn as fleet-wide baseline drag

- **Evidence:** Even **passing** sites (95 score) carry readability warn; 7/10 sites at 91–95 lose exactly 5 points here.
- **Reviewer:** `reviewReadability`.
- **Impact:** −5 on every site unless paragraphs are split to ≤3 lines.
- **Sprint D implication:** Fleet `avgScore` is capped at ~90 because universal −5 warn prevents most sites from reaching 95+ without fixing paragraphs.

---

## Recommendations (analysis only)

1. **About pipeline — paragraph chunking:** Enforce max ~3 visual lines per paragraph in about generation (or post-process split on sentence boundaries). Would address the **#1 fleet-wide issue** and likely lift 7 sites from 95→100 and 3 sites from 87→92+.

2. **About pipeline — city in body:** Prompt/require the city name in `about.text` (not only title/neighbourhoods). Fixes berlin and toronto (−4 each) without touching other sections.

3. **Copy diversity pass:** Add synonym rotation for high-frequency niche terms (solar, repair, estimate, inspect) across sections — targets `word_repetition` on all sub-90 sites.

4. **Sentence length guard in hero/about:** Trim subheadlines and about sentences to avg ≤22 words / max 25 words per sentence — addresses austin’s `long_sentences` warn and reduces readability fail risk.

5. **QA vs content-review alignment:** Content Review Engine weights readability at 10% (`SECTION_SCORE_POINTS.readability`); QA audit penalizes readability up to −12. Consider whether post-generation self-healing should target `paragraph_lines` fails specifically (austin scored 80 despite passing all structural gates).

6. **Batch monitoring:** Sub-90 rate is 1/5 in Batch B (austin, toronto) vs 1/5 in Batch A (berlin) — issue is **not batch-specific**; readability is cross-batch.

---

## Appendix: Full Score Table

| Site | Batch | QA Score | Fails | Warns | Generated at |
|------|-------|----------|-------|-------|--------------|
| roofing-austin | B | **80** | 1 | 2 | 2026-07-23T10:10:46Z |
| roofing-berlin | A | **87** | 0 | 3 | 2026-07-23T09:53:02Z |
| roofing-toronto | B | **87** | 0 | 3 | 2026-07-23T10:11:31Z |
| roofing-glasgow | A | 91 | 0 | 2 | 2026-07-23T09:54:36Z |
| roofing-london | B | 91 | 0 | 2 | 2026-07-23T10:09:13Z |
| roofing-sydney | A | 91 | 0 | 2 | 2026-07-23T09:51:34Z |
| roofing-bristol | A | 95 | 0 | 1 | 2026-07-23T09:54:41Z |
| roofing-dallas | B | 95 | 0 | 1 | 2026-07-23T10:10:42Z |
| roofing-manchester | B | 95 | 0 | 1 | 2026-07-23T10:09:07Z |
| roofing-miami | A | 95 | 0 | 1 | 2026-07-23T09:53:07Z |

**Fleet average QA score:** 90.1 (10 sites)
