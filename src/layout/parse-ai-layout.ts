import { normalizeLayoutId } from "./registry";
import { parseAiSectionRules } from "./section-rules";
import { parseSectionOrder } from "./reorder";
import type { AiLayoutSelection, LayoutId } from "./types";

const FORBIDDEN_LAYOUT_RESPONSE_KEYS = [
  "html",
  "markup",
  "css",
  "sections",
  "components",
  "structure",
] as const;

/** Reject AI responses that try to invent page markup instead of a preset id. */
export function assertNoHtmlLayoutFields(raw: unknown): void {
  if (!raw || typeof raw !== "object") return;
  const row = raw as Record<string, unknown>;
  for (const key of FORBIDDEN_LAYOUT_RESPONSE_KEYS) {
    if (key in row) {
      throw new Error(
        `Invalid layout AI response — forbidden field "${key}". Return { "layout": "<preset-id>" } only.`,
      );
    }
  }
  if (typeof row.layout === "string" && /<[^>]+>/.test(row.layout)) {
    throw new Error("Invalid layout AI response — HTML is not allowed in layout id.");
  }
}

export function parseAiLayoutSelection(raw: unknown): AiLayoutSelection | null {
  if (!raw || typeof raw !== "object") return null;

  try {
    assertNoHtmlLayoutFields(raw);
  } catch {
    return null;
  }

  const row = raw as { layout?: unknown };
  if (typeof row.layout !== "string") return null;

  const layout = normalizeLayoutId(row.layout);
  if (!layout) return null;

  const sectionRules = parseAiSectionRules(
    (raw as { sectionRules?: unknown }).sectionRules,
  );
  const sectionOrder = parseSectionOrder(
    (raw as { sectionOrder?: unknown }).sectionOrder,
  );

  const selection: AiLayoutSelection = { layout };
  if (sectionRules.length > 0) selection.sectionRules = sectionRules;
  if (sectionOrder.length > 0) selection.sectionOrder = sectionOrder;
  return selection;
}

export function parseAiLayoutSelectionOrThrow(raw: unknown): AiLayoutSelection {
  const parsed = parseAiLayoutSelection(raw);
  if (!parsed) {
    throw new Error('Invalid AI layout selection — expected { "layout": "<preset-id>" }');
  }
  return parsed;
}

export function isAiLayoutSelection(raw: unknown): raw is AiLayoutSelection {
  return parseAiLayoutSelection(raw) != null;
}

export function resolveLayoutId(raw: unknown, fallback: LayoutId): LayoutId {
  return parseAiLayoutSelection(raw)?.layout ?? fallback;
}
