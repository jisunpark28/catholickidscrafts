/**
 * Evergreen worksheets (not tied to a Sunday): Order of Mass + Family Virtue Challenge.
 * Separate from the Sunday 188-key catalog and /resource keys. Print is free (no Plus gate).
 */
import { EVERGREEN_SHEETS } from "@/data/evergreen-sheets";
import { FAITH_HUB, FAITH_SEO_CARDS, type SeoCard } from "@/lib/seo/card-seo";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";

export const MASS_FOR_KIDS_HUB = "/catholic-mass-for-kids";
export const VIRTUE_CHALLENGE_HUB = "/catholic-virtue-challenge";

export type EvergreenKind = "mass" | "virtue";
export type VirtueFamily = "Wisdom" | "Courage" | "Humanity" | "Justice" | "Temperance" | "Transcendence";

export type EvergreenPage = {
  key: string;
  slug: string;
  kind: EvergreenKind;
  /** Display name, e.g. "Gratitude" or "Introductory Rites". */
  name: string;
  virtueFamily?: VirtueFamily;
  relatedCardIds: string[];
};

export const VIRTUE_FAMILIES: { id: VirtueFamily; blurb: string }[] = [
  { id: "Wisdom", blurb: "Strengths of the mind that help us learn and choose well." },
  { id: "Courage", blurb: "Strengths that help us do what is right, even when it is hard." },
  { id: "Humanity", blurb: "Strengths of the heart that help us love and care for others." },
  { id: "Justice", blurb: "Strengths that help us live well together as a community." },
  { id: "Temperance", blurb: "Strengths that guard us from too much and help us forgive." },
  { id: "Transcendence", blurb: "Strengths that connect us to God, beauty, and meaning." },
];

export const EVERGREEN_PAGES: readonly EvergreenPage[] = [
  { key: "MASS_INTRO", slug: "introductory-rites", kind: "mass", name: "Introductory Rites", relatedCardIds: ["MAS-066", "MAS-001"] },
  { key: "MASS_WORD", slug: "liturgy-of-the-word", kind: "mass", name: "Liturgy of the Word", relatedCardIds: ["MAS-067", "MAS-001"] },
  { key: "MASS_EUCHARIST", slug: "liturgy-of-the-eucharist", kind: "mass", name: "Liturgy of the Eucharist", relatedCardIds: ["MAS-068", "MAS-001"] },
  { key: "MASS_PARTS", slug: "four-parts-of-the-mass", kind: "mass", name: "Four Parts of the Mass", relatedCardIds: ["MAS-069", "MAS-001"] },
  { key: "VIR_CREATIVITY", slug: "creativity", kind: "virtue", name: "Creativity", virtueFamily: "Wisdom", relatedCardIds: ["VIR-054"] },
  { key: "VIR_CURIOSITY", slug: "curiosity", kind: "virtue", name: "Curiosity", virtueFamily: "Wisdom", relatedCardIds: ["VIR-055"] },
  { key: "VIR_OPEN_MINDEDNESS", slug: "open-mindedness", kind: "virtue", name: "Open-Mindedness", virtueFamily: "Wisdom", relatedCardIds: ["VIR-056"] },
  { key: "VIR_LOVE_OF_LEARNING", slug: "love-of-learning", kind: "virtue", name: "Love of Learning", virtueFamily: "Wisdom", relatedCardIds: ["VIR-057"] },
  { key: "VIR_PERSPECTIVE", slug: "perspective", kind: "virtue", name: "Perspective", virtueFamily: "Wisdom", relatedCardIds: ["VIR-058"] },
  { key: "VIR_COURAGE", slug: "courage", kind: "virtue", name: "Courage", virtueFamily: "Courage", relatedCardIds: ["VIR-059"] },
  { key: "VIR_PERSEVERANCE", slug: "perseverance", kind: "virtue", name: "Perseverance", virtueFamily: "Courage", relatedCardIds: ["VIR-060"] },
  { key: "VIR_HONESTY", slug: "honesty", kind: "virtue", name: "Honesty", virtueFamily: "Courage", relatedCardIds: ["VIR-061"] },
  { key: "VIR_ZEST", slug: "zest", kind: "virtue", name: "Zest", virtueFamily: "Courage", relatedCardIds: ["VIR-062"] },
  { key: "VIR_LOVE", slug: "love", kind: "virtue", name: "Love", virtueFamily: "Humanity", relatedCardIds: ["VIR-063"] },
  { key: "VIR_KINDNESS", slug: "kindness", kind: "virtue", name: "Kindness", virtueFamily: "Humanity", relatedCardIds: ["VIR-064"] },
  { key: "VIR_SOCIAL_INTELLIGENCE", slug: "social-intelligence", kind: "virtue", name: "Social Intelligence", virtueFamily: "Humanity", relatedCardIds: ["VIR-065"] },
  { key: "VIR_CITIZENSHIP", slug: "citizenship", kind: "virtue", name: "Citizenship", virtueFamily: "Justice", relatedCardIds: ["VIR-066"] },
  { key: "VIR_FAIRNESS", slug: "fairness", kind: "virtue", name: "Fairness", virtueFamily: "Justice", relatedCardIds: ["VIR-067"] },
  { key: "VIR_LEADERSHIP", slug: "leadership", kind: "virtue", name: "Leadership", virtueFamily: "Justice", relatedCardIds: ["VIR-068"] },
  { key: "VIR_FORGIVENESS", slug: "forgiveness", kind: "virtue", name: "Forgiveness", virtueFamily: "Temperance", relatedCardIds: ["VIR-069"] },
  { key: "VIR_HUMILITY", slug: "humility", kind: "virtue", name: "Humility", virtueFamily: "Temperance", relatedCardIds: ["VIR-070"] },
  { key: "VIR_PRUDENCE", slug: "prudence", kind: "virtue", name: "Prudence", virtueFamily: "Temperance", relatedCardIds: ["VIR-071"] },
  { key: "VIR_SELF_CONTROL", slug: "self-control", kind: "virtue", name: "Self-Control", virtueFamily: "Temperance", relatedCardIds: ["VIR-072"] },
  { key: "VIR_APPRECIATION_OF_BEAUTY", slug: "appreciation-of-beauty", kind: "virtue", name: "Appreciation of Beauty", virtueFamily: "Transcendence", relatedCardIds: ["VIR-073"] },
  { key: "VIR_GRATITUDE", slug: "gratitude", kind: "virtue", name: "Gratitude", virtueFamily: "Transcendence", relatedCardIds: ["VIR-074"] },
  { key: "VIR_HOPE", slug: "hope", kind: "virtue", name: "Hope", virtueFamily: "Transcendence", relatedCardIds: ["VIR-075"] },
  { key: "VIR_HUMOR", slug: "humor", kind: "virtue", name: "Humor", virtueFamily: "Transcendence", relatedCardIds: ["VIR-076"] },
  { key: "VIR_SPIRITUALITY", slug: "spirituality", kind: "virtue", name: "Spirituality", virtueFamily: "Transcendence", relatedCardIds: ["VIR-077"] },
];

const BY_KEY = new Map(EVERGREEN_PAGES.map((p) => [p.key, p]));
const BY_SLUG = new Map(EVERGREEN_PAGES.map((p) => [p.slug, p]));

export function getEvergreenSheet(key: string): SundaySheetContent | null {
  return EVERGREEN_SHEETS[key] ?? null;
}

export function getEvergreenPage(key: string): EvergreenPage | null {
  return BY_KEY.get(key) ?? null;
}

export function getEvergreenPageBySlug(slug: string): EvergreenPage | null {
  return BY_SLUG.get(slug) ?? null;
}

export function evergreenPages(kind: EvergreenKind): EvergreenPage[] {
  return EVERGREEN_PAGES.filter((p) => p.kind === kind);
}

export function hubPath(kind: EvergreenKind): string {
  return kind === "mass" ? MASS_FOR_KIDS_HUB : VIRTUE_CHALLENGE_HUB;
}

/** Public SEO page, e.g. /catholic-virtue-challenge/gratitude. */
export function publicPath(page: EvergreenPage): string {
  return `${hubPath(page.kind)}/${page.slug}`;
}

/** Free print view (not sitemap-listed). */
export function printPath(page: EvergreenPage, level: 1 | 2 = 1, autoprint = false): string {
  return `/print/evergreen/${page.slug}?level=${level}${autoprint ? "&autoprint=1" : ""}`;
}

export function evergreenSeoTitle(page: EvergreenPage): string {
  return page.kind === "mass"
    ? `${page.name} Mass Worksheet for Kids`
    : `${page.name} Virtue Challenge Worksheet for Kids`;
}

export function evergreenDescription(page: EvergreenPage, sheet: SundaySheetContent): string {
  const lead = sheet.levels.level1.story.trim();
  const tail =
    page.kind === "mass"
      ? "Free printable Catholic Mass worksheet for kids, with two levels."
      : "Free printable take-home family virtue challenge: Mon-Sat checklist, Family Talk, and parent signature.";
  const text = `${lead} ${tail}`;
  return text.length > 300 ? `${text.slice(0, 297)}...` : text;
}

const CARD_BY_ID = new Map(FAITH_SEO_CARDS.map((c) => [c.id, c]));

export function relatedCards(page: EvergreenPage): SeoCard[] {
  return page.relatedCardIds.map((id) => CARD_BY_ID.get(id)).filter((c): c is SeoCard => Boolean(c));
}

export function faithCardPath(card: SeoCard): string {
  return `${FAITH_HUB}/${card.slug}`;
}
