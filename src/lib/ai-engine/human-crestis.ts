import type { HumanDetectorReport } from "../human-detector";
import type { ContentDraft } from "./types";

const AI_SMELL =
  /\b(professional services|welcome to|quality you can trust|we('re| are) passionate|dedicated to excellence|your trusted partner|one[- ]stop shop)\b/i;

/**
 * Instant human-smell check — no GPT (fast path).
 * Flags obvious clichés; deep path still uses Human Detector AI.
 */
export function detectHumanCrestis(content: ContentDraft): HumanDetectorReport {
  const blob = [
    content.hero.headline,
    content.hero.subheadline,
    content.hero.primaryCTA,
    content.about.text.slice(0, 280),
    content.cta?.headline ?? "",
  ].join("\n");

  const smells = AI_SMELL.test(blob);
  const tells: string[] = [];
  if (smells) tells.push("Generic AI-style phrase detected in hero/about/CTA");

  return {
    looksAiGenerated: smells ? "YES" : "NO",
    aiLikelihood: smells ? 62 : 28,
    tells,
    verdict: smells
      ? "Crestis heuristic flagged AI-sounding phrases"
      : "No obvious AI sludge in primary copy",
    rewritten: [],
    finalLooksAiGenerated: smells ? "YES" : "NO",
  };
}
