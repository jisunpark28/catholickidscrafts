/**
 * Shared verse resolution for Mom's Bible situations and public SEO moment pages.
 * Maps an official Catholic (NABRE) ref to the Douay reader href + modernized text.
 */
import type { SituationRef } from "@/data/moms-bible/situations";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { nabreToDouay } from "@/lib/bible/ref-map";

export type ResolvedSituationVerse = {
  ref: SituationRef;
  href: string;
  text: string;
};

/** Reader link for one official ref. Null when the ref is not in the supported Bible map. */
export function situationVerseHref(ref: SituationRef, situationKey: string): string | null {
  const start = nabreToDouay(ref.book, ref.chapter, ref.verse);
  if (!start) return null;
  const [path, hash] = readHrefForDouay(start.slug, start.chapter, start.verse).split("#");
  return `${path}?situation=${encodeURIComponent(situationKey)}${hash ? `#${hash}` : ""}`;
}

export async function resolveSituationVerse(
  ref: SituationRef,
  situationKey: string,
): Promise<ResolvedSituationVerse | null> {
  const href = situationVerseHref(ref, situationKey);
  const start = nabreToDouay(ref.book, ref.chapter, ref.verse);
  if (!href || !start) return null;
  const end = ref.verseEnd ? nabreToDouay(ref.book, ref.chapter, ref.verseEnd) : start;
  let text = "";
  try {
    const data = await fetchBibleChapter(start.slug, start.chapter);
    const last = end && end.chapter === start.chapter ? (end.verseEnd ?? end.verse) : start.verse;
    text = data.verses
      .filter((v) => v.verse >= start.verse && v.verse <= last)
      .map((v) => modernizeVerse(start.slug, start.chapter, v.verse, v.text))
      .join(" ");
  } catch {
    /* the card still links to the verse */
  }
  return { ref, href, text };
}
