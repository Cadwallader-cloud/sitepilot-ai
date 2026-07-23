# Sprint D.1 — Latency Investigation Report

**Run analyzed:** `roofing-london` (latest alpha, 2026-07-22)  
**Wall-clock:** **89.0 s** (target: <40 s, acceptable band: ~42 s)  
**Gap to target:** **49.0 s**  
**Mode:** `balanced` (default)  
**Source:** `scripts/internal-alpha/output/roofing-london.json` → `site.website.crestis.usage.{steps,telemetry}`

---

## Executive summary

The 89 seconds are **fully accounted for** by the orchestrator critical path:

```
business (6.7s) → brand (5.5s) → planner (12.6s)
  → parallel wave max(services, faq, about, hero) = services (41.1s)
  → seo (11.3s) → qa (11.7s)
= 88.9 s ≈ 89 s wall-clock
```

**No mystery overhead:** telemetry sums to ~121 s of *step-attributed* time, but **~32 s are hidden** because hero/about/faq run in parallel with services and do not extend wall-clock (except services, which dominates the wave).

**Root cause:** latency is dominated by **sequential LLM chains inside the Services step** (46% of total wall time), plus **suffix SEO + QA self-healing** (25% combined). Retries were **0** — slowness is not retry-driven.

---

## Where the 89 seconds go (critical-path view)

| Rank | Pipeline step | Wall time | % of 89s | On critical path? |
| ---: | --- | ---: | ---: | --- |
| 1 | **services** | **41.1 s** | **46%** | ✅ Yes (parallel wave bottleneck) |
| 2 | **planner** | **12.6 s** | **14%** | ✅ Yes |
| 3 | **qa** | **11.7 s** | **13%** | ✅ Yes |
| 4 | **seo** | **11.3 s** | **13%** | ✅ Yes |
| 5 | business | 6.7 s | 8% | ✅ Yes |
| 6 | brand | 5.5 s | 6% | ✅ Yes |
| — | faq | 23.7 s | — | ❌ Hidden (parallel, shorter than services) |
| — | about | 5.7 s | — | ❌ Hidden |
| — | hero | 2.8 s | — | ❌ Hidden |

**Parallel wave span:** 41.1 s (starts when hero/about/services/faq fork; ends when **services** finishes).

---

## All stages ranked by attributed duration

Top-level pipeline steps (from `usage.steps`):

| Rank | Stage | Duration | Cost | Retries |
| ---: | --- | ---: | ---: | ---: |
| 1 | services | 41,086 ms | $0.0035 | 0 |
| 2 | faq | 23,678 ms | $0.0019 | 0 |
| 3 | planner | 12,625 ms | $0.0036 | 0 |
| 4 | qa | 11,676 ms | $0.0028 | 0 |
| 5 | seo | 11,341 ms | $0.0023 | 0 |
| 6 | business | 6,694 ms | $0.0017 | 0 |
| 7 | about | 5,733 ms | $0.0014 | 0 |
| 8 | brand | 5,487 ms | $0.0014 | 0 |
| 9 | hero | 2,778 ms | $0.0013 | 0 |

Sub-stage LLM calls (slowest telemetry rows):

| Rank | Telemetry stage | Parent | Duration | Why it matters |
| ---: | --- | --- | ---: | --- |
| 1 | `copy_service_ai` | services | 23,820 ms | Main services body generation |
| 2 | `copy_faq_ai` | faq | 23,610 ms | Full FAQ generation (parallel, not on CP*) |
| 3 | `copy_service_ai` | services | 11,765 ms | **Service Prioritizer** (same stage name) |
| 4 | `seo_ai` | planner | 12,576 ms | SEO *strategy* during planner |
| 5 | `seo_ai` | seo | 11,314 ms | SEO *final* after content merge |
| 6 | `copy_service_ai` | qa | 8,211 ms | Content-review self-healing regen |
| 7 | `copy_service_ai` | services | 11,765 ms | (prioritizer — see above) |
| 8 | `layout_selector_ai` | planner | 5,798 ms | Parallel within planner |
| 9 | `about_single` | about | 5,701 ms | Single-pass about (parallel) |
| 10 | `copy_cta_ai` | services | 5,418 ms | CTA band (parallel with testimonials) |

\*CP = critical path

---

## Top 3 slowest stages — diagnosis

### 1. Services — 41.1 s (46% of wall time)

**What happens (sequential inside one pipeline step):**

| Sub-call | Duration | Type |
| --- | ---: | --- |
| Service Prioritizer (`copy_service_ai`) | 11.8 s | LLM — **extra call because input has 4 services** |
| Services generator (`copy_service_ai`) | 23.8 s | LLM — large prompt, `maxCompletionTokens: 4096` |
| Testimonials + CTA (`Promise.all`) | ~5.4 s wall | 2× LLM in parallel |

**Why it's slow:**

1. **Sequential dependency:** prioritizer → generator → testimonials/CTA. Cannot start generator until prioritizer returns.
2. **Service Prioritizer not skipped:** input lists **4 services** (`Roof repair, roof replacement, gutter cleaning, storm damage`). Sprint C skip applies only to **1–3** services; planner already outputs `serviceFocus`.
3. **LLM latency, not validation/I/O:** zero retries; each sub-call is a full `gpt-5-mini` round-trip.
4. **Heavy generation:** services prompt includes brand profile, plan JSON, priority JSON, industry brief — ~7.8k input tokens for the main call.

**Not the cause:** retries, cache misses (prompt cache hits are fine), Supabase/disk I/O.

---

### 2. FAQ — 23.7 s (parallel — latent bottleneck)

**What happens:** one `copy_faq_ai` call (~23.6 s).

**Why it's slow:**

1. **Single monolithic LLM call** for all FAQ items.
2. **Large context** (~990–3.1k tokens in FAQ context slice; full prompt larger with cached business/planner blobs).
3. Runs **in parallel** with services, so it does **not** add to wall-clock *today* — but would become the **#1 bottleneck** if services drops below ~24 s.

**Not the cause:** retries (0), sequential pipeline blocking.

---

### 3. Planner — 12.6 s (critical path)

**What happens (already parallelized via `Promise.all`):**

| Sub-call | Duration | Notes |
| --- | ---: | --- |
| `seo_ai` (SEO Planner strategy) | 12.6 s | **Slowest fork** — sets planner wall time |
| `layout_selector_ai` | 5.8 s | Parallel |
| `website_planner` | 4.6 s | Parallel |

**Why it's slow:**

1. **LLM latency** on three parallel planner forks; wall time = max fork ≈ SEO planner.
2. **Duplicate SEO work later:** same telemetry stage name `seo_ai` runs again in the **SEO step** (11.3 s) after content merge — strategy vs final copy, but two full SEO-class calls per site.

**Not the cause:** sequential planner internals (website → layout → seo is already parallel).

---

## Secondary contributors (on critical path)

### QA — 11.7 s

| Component | Duration | Type |
| --- | ---: | --- |
| Content Review self-healing | ~11.3 s | 2× sequential LLM regens |
| — `copy_about_ai` | 3.1 s | Healing task |
| — `copy_service_ai` | 8.2 s | Healing task |
| Theme/template selectors | (included in step) | Mostly rules + small AI |

**Why:** `balanced` mode runs self-healing with `maxContentReviewHealingTasks: 2`. Content review flagged issues → regenerated about + services **sequentially** during QA.

### SEO step — 11.3 s

**Why:** `runFinalSeoReview` after all content merged — full `seo_ai` call with complete hero/about/services/faq context. Overlaps conceptually with planner's SEO strategy call.

### Business + Brand — 12.2 s combined

| Step | Duration | LLM stage |
| --- | ---: | --- |
| business | 6.7 s | `business_intelligence` |
| brand | 5.5 s | `business_intelligence` (brand personality engine) |

**Why:** two sequential DNA/brand intelligence calls before planner; no parallelization between them.

---

## Time budget diagram

```
0s        10s       20s       30s       40s       50s       60s       70s       80s   89s
|---- business ----|-- brand --|----- planner -----|
                              |======== parallel wave (41s) ========|
                              hero ▓
                              about ▓▓
                              faq ▓▓▓▓▓▓▓▓▓▓▓▓  (23s, hidden)
                              services ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (41s, BOTTLENECK)
                                                    |-- seo --|-- qa --|
```

---

## Proposed optimizations (concrete, with estimates)

> Estimates assume same model (`gpt-5-mini`) unless noted. Savings are **wall-clock** (critical-path impact).

### Tier A — High impact, low risk

| # | Optimization | Mechanism | Est. savings | Confidence |
| --- | --- | --- | ---: | --- |
| A1 | **Skip Service Prioritizer when planner has `serviceFocus`** (extend skip to 4+ services) | Remove 11.8 s sequential LLM before services gen | **~10–12 s** | High |
| A2 | **Skip Content Review self-healing when score ≥ threshold** (e.g. no critical issues) | Remove QA `copy_about_ai` + `copy_service_ai` (~11 s) on clean runs | **~8–11 s** | High |
| A3 | **`fast` mode or flag: skip testimonials + CTA AI** in Services step | Remove ~5.4 s parallel tail (wave shrinks if services gen also faster) | **~3–5 s** | High |
| A4 | **Reduce `maxCompletionTokens` on services** (4096 → 2048) | Less generation latency on main services call | **~5–8 s** | Medium |

**Tier A combined (this run profile):** **~26–36 s** → projected wall **~53–63 s**

---

### Tier B — Medium impact, structural

| # | Optimization | Mechanism | Est. savings | Confidence |
| --- | --- | --- | ---: | --- |
| B1 | **Merge SEO Planner output into final SEO step** (avoid second full `seo_ai`) | Planner produces strategy; SEO step applies/polishes only | **~8–11 s** | Medium |
| B2 | **FAQ: cap items or split model tier** (nano/smaller for FAQ polish) | Shave FAQ from 23.7 s → ~12 s (becomes CP if services fixed) | **~10–12 s** when CP | Medium |
| B3 | **Parallelize business + brand** where brand consumes business DNA | Overlap 5.5 s brand with nothing today — needs dependency refactor | **~3–5 s** | Low |
| B4 | **Run FAQ + Services sub-generators with shared prioritizer in planner** | Move prioritizer to planner phase (parallel with layout/seo) | **~10–12 s** | Medium |

**Tier B + A (aggressive):** additional **~15–25 s** → projected **~38–48 s** (approaches 40 s target)

---

### Tier C — V4 checklist items (from KPI ladder)

| Item | Current state (this run) | Est. savings |
| --- | --- | ---: |
| Context cache | ✅ Working (`CacheHit: true` on content steps) | Already captured |
| Parallel planner | ✅ Working (3 forks) | Already captured |
| Skip service prioritizer | ⚠️ Partial — skipped only for 1–3 services | **~12 s** when extended |
| gpt-5-nano for brand/FAQ/SEO polish | ❌ Not implemented (all stages → `gpt-5-mini`) | **~8–15 s** aggregate |

---

## Scenario: path to ~42 s (your “stop optimizing” band)

Starting from **89 s**, need **~47 s** removed:

| Action | Savings | Running total |
| --- | ---: | ---: |
| A1 Skip prioritizer (use planner order) | 12 s | 77 s |
| A2 Skip self-healing on passing content review | 11 s | 66 s |
| A3 Skip testimonials/CTA AI | 5 s | 61 s |
| A4 Smaller services token budget | 6 s | 55 s |
| B1 Dedupe SEO planner vs final SEO | 10 s | 45 s |
| B2 FAQ faster model / fewer items | 3 s* | 42 s |

\*FAQ savings only affect wall-clock once services < FAQ duration.

This matches your hypothetical **~42 s** without rewriting the pipeline — mostly **removing redundant LLM calls** and ** tightening generation bounds**.

---

## Scenario: path to <40 s (official Sprint D target)

Requires **≥49 s** savings — everything in the ~42 s scenario **plus**:

- Parallelize or cache brand step (**~5 s**)
- Further services prompt slimming / single-pass services (**~5–8 s**)
- Or run alpha in **`fast` generation mode** (1 attempt, no healing, no testimonials)

---

## What is NOT causing the 89 seconds

| Hypothesis | Evidence |
| --- | --- |
| Retries | `retries: 0` on all stages |
| Failed validation loops | All steps `status: success`, QA score 91 |
| Cache miss penalty | Prompt cache hits on hero/about/services/faq/seo/qa |
| Supabase / file I/O | No I/O stages in telemetry |
| Sequential hero→about→services→faq | Pipeline v2 parallel wave confirmed in logs |
| Unknown overhead | Step sum maps to 89 s via critical-path model |

---

## Recommendations for Sprint D.1 → D.2

**Investigate first (measure on n=10 batch before coding):**

1. Count how often Service Prioritizer runs vs skip (service count distribution in matrix).
2. Count how often Content Review self-healing fires and which sections regen.
3. Confirm SEO planner output reuse potential — diff tokens between planner `seo_ai` and final `seo_ai`.

**Implement first (highest ROI, lowest blast radius):**

1. **A1** — extend prioritizer skip when `brief.serviceFocus` is populated.
2. **A2** — gate self-healing on content review score / issue severity.
3. **B1** — SEO dedupe (strategy in planner, light polish in SEO step).

**Do not optimize blindly:**

- Hero/about are already fast (2.8 s / 5.7 s) — not worth touching.
- Planner is already parallel — further gains need dedupe, not more `Promise.all`.
- Model router documents nano routing but **all stages resolve to `gpt-5-mini`** today.

---

## Appendix — raw numbers

**Run metadata**

- Site: `roofing-london` / Summit Roofing London
- `durationMs`: 89,006
- Total cost: **$0.0199**
- QA score: **91**
- Generation mode: **balanced**
- Input services: **4** (prioritizer **not** skipped)

**Critical path arithmetic**

```
6.7 + 5.5 + 12.6 + 41.1 + 11.3 + 11.7 = 88.9 s
```

**Commands to reproduce this report**

```bash
npm run alpha:smoke          # or --limit=1
npm run alpha:analyze
node -e "/* inspect site.website.crestis.usage */"
```

---

*Sprint D.1 — analysis only, no code changes.*
