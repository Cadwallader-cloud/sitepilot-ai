/**
 * Industry FAQ knowledge bank — questions Crestis adapts, not invents.
 */

export type IndustryFaqKnowledge = {
  common_questions: string[];
  common_objections: string[];
};

export function normalizeIndustryFaqKnowledge(
  raw: unknown,
): IndustryFaqKnowledge {
  const row =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const common_questions = (Array.isArray(row.common_questions)
    ? row.common_questions
    : []
  )
    .map((q) => String(q ?? "").trim())
    .filter(Boolean)
    .slice(0, 16);

  const common_objections = (Array.isArray(row.common_objections)
    ? row.common_objections
    : []
  )
    .map((o) => String(o ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);

  return {
    common_questions:
      common_questions.length >= 6
        ? common_questions
        : [
            ...common_questions,
            "How do I get started?",
            "Which areas do you serve?",
            "What happens after I contact you?",
            "How are quotes handled?",
            "How long does a typical job take?",
            "What should I prepare before you arrive?",
          ].slice(0, 6),
    common_objections: common_objections.length
      ? common_objections
      : ["Price", "Trust", "Response time", "Process", "Location"],
  };
}
