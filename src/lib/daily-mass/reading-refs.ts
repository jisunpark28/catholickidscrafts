import type { ReadingKind } from "@/types/mass";

const ORDER: readonly string[] = ["first_reading", "psalm", "second_reading", "gospel"];

export type ReadingRef = {
  kind: ReadingKind | string;
  label: string;
  citation: string;
};

/** "Holy Gospel ... according to Saint Matthew 22,34-40." -> "Matthew 22:34-40". */
export function tidyCitation(raw: string): string {
  return raw
    .trim()
    .replace(/^.*?according to (?:Saint |St\. )?/i, "")
    .replace(
      /^(?:A reading from )?(?:the )?(?:Book of (?:the Prophet )?|(?:First |Second )?Letter of (?:Saint )?Paul to the |Letter of Saint )/i,
      "",
    )
    .replace(/(\d+),(\d+)/g, "$1:$2")
    .replace(/\.$/, "");
}

/**
 * Every citation the feed actually returned, in liturgical order.
 * Same-kind options (for example two Gospel choices) are kept. Empty titles are not invented.
 */
export function readingRefs(
  readings: Array<{ kind: ReadingKind | string; label: string; title: string }>,
): ReadingRef[] {
  return readings
    .map((reading, index) => ({ reading, index }))
    .filter(({ reading }) => reading.title.trim().length > 0 && reading.label.trim().length > 0)
    .sort((a, b) => {
      const aRank = ORDER.indexOf(a.reading.kind);
      const bRank = ORDER.indexOf(b.reading.kind);
      const rank = (aRank === -1 ? ORDER.length : aRank) - (bRank === -1 ? ORDER.length : bRank);
      return rank || a.index - b.index;
    })
    .map(({ reading }) => ({
      kind: reading.kind,
      label: reading.label.trim(),
      citation: tidyCitation(reading.title),
    }))
    .filter((reading) => reading.citation.length > 0);
}
