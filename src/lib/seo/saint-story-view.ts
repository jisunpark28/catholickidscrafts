import type { CardSource } from "@/lib/resource/card-meta";
import {
  SAINT_SEO_CARDS,
  saintFactBox,
  saintPageSeo,
  type SeoCard,
} from "@/lib/seo/card-seo";

/** Compare a Fact Box story with the card caption, ignoring quotes, punctuation and case. */
export function sameSaintStoryText(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return norm(a) === norm(b);
}

/** Client-safe saint detail payload (no cards.json import on the client module graph). */
export type SaintStoryViewData = {
  id: string;
  title: string;
  set: string;
  when?: string | null;
  text: string;
  ref?: string | null;
  h1: string;
  questions: readonly string[];
  factBox: {
    feast?: string;
    patron: string[];
    symbols: string[];
    story?: string;
    sources: CardSource[];
  } | null;
  showStory: boolean;
  slug: string;
};

export function toSaintStoryView(card: SeoCard): SaintStoryViewData {
  const seo = saintPageSeo(card);
  const factBox = saintFactBox(card);
  const showStory = Boolean(factBox?.story && !sameSaintStoryText(factBox.story, card.text));
  return {
    id: card.id,
    title: card.title,
    set: card.set,
    when: card.when ?? null,
    text: card.text,
    ref: card.ref ?? null,
    h1: seo.h1,
    questions: seo.questions,
    factBox,
    showStory,
    slug: card.slug,
  };
}

/** All saint SEO stories keyed by card id (server → Printables Cards detail). */
export function saintStoryViewsById(): Record<string, SaintStoryViewData> {
  const out: Record<string, SaintStoryViewData> = {};
  for (const card of SAINT_SEO_CARDS) {
    out[card.id] = toSaintStoryView(card);
  }
  return out;
}
