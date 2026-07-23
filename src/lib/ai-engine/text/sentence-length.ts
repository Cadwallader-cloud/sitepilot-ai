function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function ensureTerminalPunctuation(sentence: string): string {
  const trimmed = sentence.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Split one sentence that exceeds maxWords into shorter sentences. */
export function splitLongSentence(sentence: string, maxWords = 25): string[] {
  const trimmed = sentence.trim();
  if (!trimmed) return [];
  if (countWords(trimmed) <= maxWords) return [ensureTerminalPunctuation(trimmed)];

  const clauseParts = trimmed
    .split(/(?<=[,;])\s+(?=[A-Za-z0-9"'])|\s+—\s+|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (clauseParts.length > 1) {
    const out: string[] = [];
    let buffer = "";

    for (const part of clauseParts) {
      const candidate = buffer ? `${buffer} ${part}` : part;
      if (countWords(candidate) <= maxWords) {
        buffer = candidate;
        continue;
      }
      if (buffer) out.push(...splitLongSentence(buffer, maxWords));
      buffer = part;
    }

    if (buffer) out.push(...splitLongSentence(buffer, maxWords));
    return out.flat().filter(Boolean);
  }

  const words = trimmed.replace(/[.!?]+$/, "").split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks.map(ensureTerminalPunctuation);
}

/** Split sentences longer than maxWords inside a paragraph. */
export function splitLongSentencesInParagraph(
  paragraph: string,
  maxWords = 25,
): string {
  let current = paragraph.trim();
  if (!current) return current;

  for (let pass = 0; pass < 6; pass++) {
    const parts = current.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [current];
    const next = parts
      .flatMap((part) => splitLongSentence(part.trim(), maxWords))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const stillLong = (next.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [next]).some(
      (part) => countWords(part.replace(/[.!?]+$/, "")) > maxWords,
    );
    if (!stillLong || next === current) return next;
    current = next;
  }

  return current;
}

export function splitLongSentencesInParagraphs(
  paragraphs: string[],
  maxWords = 25,
): string[] {
  return paragraphs.map((paragraph) =>
    splitLongSentencesInParagraph(paragraph, maxWords),
  );
}
