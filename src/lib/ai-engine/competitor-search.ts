/**
 * Live competitor discovery via OpenAI Responses API + web_search.
 * Falls back gracefully when search is unavailable.
 */

import { logOpenAiUsage } from "../usage";
import { getEngineOpenAI } from "./openai-json";

export type LiveCompetitorHit = {
  name: string;
  url: string;
  notes: string;
};

export type LiveCompetitorSearchResult = {
  ok: boolean;
  mode: "live_web_search" | "disabled" | "failed";
  marketQuery: string;
  competitors: LiveCompetitorHit[];
  sources: { title: string; url: string }[];
  rawNotes?: string;
  error?: string;
};

function isWebSearchEnabled(): boolean {
  // Default OFF — live web_search is slow/expensive. Opt in with COMPETITOR_WEB_SEARCH=true
  const flag = process.env.COMPETITOR_WEB_SEARCH?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "on" || flag === "yes";
}

function searchModel(): string {
  return (
    process.env.OPENAI_SEARCH_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o"
  );
}

function uniqueSources(
  items: { title: string; url: string }[],
): { title: string; url: string }[] {
  const seen = new Set<string>();
  const out: { title: string; url: string }[] = [];
  for (const item of items) {
    const url = item.url.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      title: item.title.trim() || url,
      url,
    });
  }
  return out.slice(0, 12);
}

function extractSourcesFromResponse(response: {
  output?: unknown[];
  output_text?: string;
}): { title: string; url: string }[] {
  const found: { title: string; url: string }[] = [];
  const output = Array.isArray(response.output) ? response.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;

    // web_search_call actions may include sources
    if (row.type === "web_search_call") {
      const action = row.action as Record<string, unknown> | undefined;
      const sources = Array.isArray(action?.sources) ? action.sources : [];
      for (const s of sources) {
        if (!s || typeof s !== "object") continue;
        const src = s as { url?: string; title?: string };
        if (typeof src.url === "string" && src.url.trim()) {
          found.push({
            url: src.url.trim(),
            title: String(src.title ?? "").trim() || src.url.trim(),
          });
        }
      }
    }

    if (row.type === "message" && Array.isArray(row.content)) {
      for (const part of row.content) {
        if (!part || typeof part !== "object") continue;
        const p = part as { annotations?: unknown[] };
        for (const ann of p.annotations ?? []) {
          if (!ann || typeof ann !== "object") continue;
          const a = ann as { type?: string; url?: string; title?: string };
          if (
            (a.type === "url_citation" || a.type === "citation") &&
            typeof a.url === "string"
          ) {
            found.push({
              url: a.url.trim(),
              title: String(a.title ?? "").trim() || a.url.trim(),
            });
          }
        }
      }
    }
  }

  // Fallback: pull bare URLs from output text
  const text = String(response.output_text ?? "");
  const urlMatches = text.match(/https?:\/\/[^\s)"'\]]+/g) ?? [];
  for (const url of urlMatches) {
    found.push({ url: url.replace(/[.,;]+$/, ""), title: url });
  }

  return uniqueSources(found);
}

function parseLiveJson(raw: string): {
  competitors: LiveCompetitorHit[];
  notes?: string;
} {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return { competitors: [] };

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as {
      competitors?: unknown[];
      notes?: string;
    };
    const competitors = (Array.isArray(parsed.competitors)
      ? parsed.competitors
      : []
    )
      .map((c) => {
        if (!c || typeof c !== "object") return null;
        const row = c as Record<string, unknown>;
        const name = String(row.name ?? row.label ?? "").trim();
        const url = String(row.url ?? "").trim();
        const notes = String(row.notes ?? row.summary ?? "").trim();
        if (!name && !url) return null;
        return {
          name: name || url,
          url,
          notes,
        } satisfies LiveCompetitorHit;
      })
      .filter((c): c is LiveCompetitorHit => Boolean(c))
      .slice(0, 5);

    return {
      competitors,
      notes: String(parsed.notes ?? "").trim() || undefined,
    };
  } catch {
    return { competitors: [] };
  }
}

/**
 * Live web search for local competitors for a market query like "Dallas Roofing".
 */
export async function searchLiveCompetitors(params: {
  marketQuery: string;
  location: string;
  category: string;
  userEmail?: string | null;
}): Promise<LiveCompetitorSearchResult> {
  const marketQuery = params.marketQuery.trim();

  if (!isWebSearchEnabled()) {
    return {
      ok: false,
      mode: "disabled",
      marketQuery,
      competitors: [],
      sources: [],
      error: "COMPETITOR_WEB_SEARCH disabled",
    };
  }

  const openai = getEngineOpenAI();
  if (!openai) {
    return {
      ok: false,
      mode: "failed",
      marketQuery,
      competitors: [],
      sources: [],
      error: "OPENAI_API_KEY missing",
    };
  }

  const model = searchModel();
  const input = [
    `Search the live web for top local business websites matching: "${marketQuery}".`,
    `Focus on ${params.category} companies serving ${params.location}.`,
    "Prefer real company websites (not directories like Yelp-only listings when possible).",
    "Return ONLY JSON:",
    `{
  "competitors": [
    {
      "name": "Company name",
      "url": "https://example.com",
      "notes": "1 short note about what their site emphasizes (structure/CTA/trust) — not full copy"
    }
  ],
  "notes": "optional short market observation"
}`,
    "Rules: 3–5 competitors max. Do not invent URLs. Do not invent licenses or awards. Do not paste long website copy.",
  ].join("\n");

  try {
    const response = await openai.responses.create({
      model,
      tools: [{ type: "web_search" }],
      // Force the model to actually use search for this stage
      tool_choice: "auto",
      instructions:
        "You are Crestis live competitor discovery. Use web search. Return valid JSON only.",
      input,
    });

    void logOpenAiUsage({
      userEmail: params.userEmail,
      model,
      promptTokens: response.usage?.input_tokens ?? 0,
      completionTokens: response.usage?.output_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    });

    const text = String(response.output_text ?? "");
    const parsed = parseLiveJson(text);
    const sources = extractSourcesFromResponse(response);

    // Merge URL-only sources into competitor list when names missing
    const byUrl = new Map<string, LiveCompetitorHit>();
    for (const c of parsed.competitors) {
      if (c.url) byUrl.set(c.url, c);
      else byUrl.set(c.name, c);
    }
    for (const s of sources) {
      if (!byUrl.has(s.url)) {
        byUrl.set(s.url, {
          name: s.title,
          url: s.url,
          notes: "Found via live web search",
        });
      }
    }

    const competitors = [...byUrl.values()].slice(0, 5);
    if (competitors.length === 0) {
      return {
        ok: false,
        mode: "failed",
        marketQuery,
        competitors: [],
        sources,
        rawNotes: parsed.notes || text.slice(0, 400),
        error: "Web search returned no competitor URLs",
      };
    }

    return {
      ok: true,
      mode: "live_web_search",
      marketQuery,
      competitors,
      sources: uniqueSources([
        ...sources,
        ...competitors
          .filter((c) => c.url)
          .map((c) => ({ title: c.name, url: c.url })),
      ]),
      rawNotes: parsed.notes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Live competitor web_search failed:", message);
    return {
      ok: false,
      mode: "failed",
      marketQuery,
      competitors: [],
      sources: [],
      error: message,
    };
  }
}
