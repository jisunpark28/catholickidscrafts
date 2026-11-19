// Prayers learned one phrase per slide on /prayers (?prayer=<slug>), with the Little / Growing / Ready
// activities. Client-safe data: src/data/prayers/prayer-phrases.json (also read by the worksheet
// builder, scripts/activities/prayers). Phrase text is the cited official wording, split into lines.
//
// Source pending: "holy-water-prayer", "prayer-after-communion" and "prayer-of-st-francis" keep the
// current site text until an official source is confirmed (sourcePending in the data).
import DATA from "@/data/prayers/prayer-phrases.json";

export type PrayerPhrase = {
  /** 1-based phrase number (also the art file name, 01.webp). */
  n: number;
  text: string;
  /** Title of the phrase picture (alt text and the paper Ready clue). */
  art: string;
  /** Reuse a site card picture (card id). */
  card?: string;
  /** Reuse another phrase's picture ("<prayer-slug>/<NN>"). */
  img?: string;
  /** A line that hands over to another prayer ("Hail Mary…"): no activities. */
  opens?: string;
  little?: { answer: string; options: string[] };
  blanks?: string[];
  prompt?: string;
  words?: number;
  letters?: string;
};

export type CarouselPrayer = {
  slug: string;
  title: string;
  phase: number;
  source: string;
  /** Site card used as the cover (card id), or null. */
  cover: string | null;
  sourcePending?: boolean;
  phrases: PrayerPhrase[];
};

export const CAROUSEL_PRAYERS: readonly CarouselPrayer[] = (DATA as { prayers: CarouselPrayer[] }).prayers;

export function getCarouselPrayer(slug: string | null | undefined): CarouselPrayer | null {
  if (!slug) return null;
  return CAROUSEL_PRAYERS.find((p) => p.slug === slug) ?? null;
}

/** Phrases that have activities (not the "Hail Mary…" hand-over lines). */
export function activityPhrases(p: CarouselPrayer): PrayerPhrase[] {
  return p.phrases.filter((ph) => !ph.opens);
}

export function hasLittle(p: CarouselPrayer): boolean {
  return p.phrases.some((ph) => ph.little);
}

/** "V/. The Angel…" -> { mark: "V", text: "The Angel…" }. */
export function splitVersicle(text: string): { mark: "V" | "R" | null; text: string } {
  const m = /^(V|R)\/\.\s*/.exec(text);
  return m ? { mark: m[1] as "V" | "R", text: text.slice(m[0].length) } : { mark: null, text };
}

/** Line text for the activities: no V./R. marker and no brackets around an optional line. */
export function activityText(text: string): string {
  return splitVersicle(text).text.replace(/[[\]]/g, "");
}

const core = (tok: string) => tok.replace(/^[^A-Za-z0-9\u00C0-\u024F]+|[^A-Za-z0-9\u00C0-\u024F]+$/g, "").toLowerCase();

export type LineToken = { text: string; blank: boolean };

/** Split a line into words and blanks. A blank can span words ("Holy Father"); punctuation stays outside. */
export function blankTokens(text: string, blanks: readonly string[]): LineToken[] {
  const toks = activityText(text).split(/\s+/).filter(Boolean);
  const todo = blanks.map((b) => b.split(/\s+/));
  const out: LineToken[] = [];
  let i = 0;
  while (i < toks.length) {
    const k = todo.findIndex((words) => words.every((w, j) => core(toks[i + j] ?? "") === w.toLowerCase()));
    if (k < 0) {
      out.push({ text: toks[i]!, blank: false });
      i += 1;
      continue;
    }
    const words = todo[k]!;
    const head = /^[^A-Za-z0-9\u00C0-\u024F]*/.exec(toks[i]!)![0];
    const tail = /[^A-Za-z0-9\u00C0-\u024F]*$/.exec(toks[i + words.length - 1]!)![0];
    if (head) out.push({ text: head, blank: false });
    out.push({ text: words.join(" "), blank: true });
    if (tail) out.push({ text: tail, blank: false });
    todo.splice(k, 1);
    i += words.length;
  }
  return out;
}

/** Compare written words, ignoring case, punctuation and extra spaces. */
export function sameWords(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^A-Za-z0-9\u00C0-\u024F' -]+/g, " ")
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .join(" ");
  return norm(a) === norm(b);
}

export const GENERIC_READY_PROMPT = "Look at the picture and write this line.";
