/**
 * Programmatic SEO helpers for Little Light picture cards (saints + faith questions).
 * Slugs are title-based; collisions append a short id suffix for stability.
 */
import { PICTURE_CARDS, type PictureCard } from "@/lib/resource/cards";
import type { CardCategory } from "@/lib/resource/card-meta";

export const SAINTS_HUB = "/catholic-saints-for-kids";
export const FAITH_HUB = "/catholic-faith-questions";

const FAITH_CATS = new Set<CardCategory>(["Virtue & Life", "Prayer", "Sacrament", "Mass & Church"]);

export type SeoCard = PictureCard & { slug: string };

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

function shortIdSuffix(id: string): string {
  // "SNT-006" -> "snt006"
  return id.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function assignSlugs(cards: readonly PictureCard[]): SeoCard[] {
  const counts = new Map<string, number>();
  for (const c of cards) {
    const base = slugifyTitle(c.title) || shortIdSuffix(c.id);
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  const used = new Set<string>();
  const out: SeoCard[] = [];
  for (const c of [...cards].sort((a, b) => a.id.localeCompare(b.id))) {
    const base = slugifyTitle(c.title) || shortIdSuffix(c.id);
    let slug = base;
    if ((counts.get(base) ?? 0) > 1 || used.has(slug)) {
      slug = `${base}-${shortIdSuffix(c.id)}`;
    }
    // Extremely defensive: keep appending if still colliding.
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${shortIdSuffix(c.id)}-${n++}`;
    }
    used.add(slug);
    out.push({ ...c, slug });
  }
  return out;
}

export const SAINT_SEO_CARDS: readonly SeoCard[] = assignSlugs(
  PICTURE_CARDS.filter((c) => c.cat === "Saint"),
);

export const FAITH_SEO_CARDS: readonly SeoCard[] = assignSlugs(
  PICTURE_CARDS.filter((c) => FAITH_CATS.has(c.cat)),
);

const SAINT_BY_SLUG = new Map(SAINT_SEO_CARDS.map((c) => [c.slug, c]));
const FAITH_BY_SLUG = new Map(FAITH_SEO_CARDS.map((c) => [c.slug, c]));

export function getSaintSeoCard(slug: string): SeoCard | null {
  return SAINT_BY_SLUG.get(slug) ?? null;
}

export function getFaithSeoCard(slug: string): SeoCard | null {
  return FAITH_BY_SLUG.get(slug) ?? null;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type CardPageSeo = {
  seoTitle: string;
  description: string;
  h1: string;
  intro: readonly [string, string];
  questions: readonly [string, string, string];
};

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > 40 ? cut.slice(0, i) : cut).trimEnd()}…`;
}

export function saintPageSeo(card: SeoCard): CardPageSeo {
  const whenBit = card.when ? ` The Church remembers ${card.title} on ${card.when}.` : "";
  const refBit = card.ref ? ` Scripture on the card: ${card.ref}.` : "";
  const variants: Array<[string, string]> = [
    [
      `${card.title} belongs in the "${card.set}" series of Catholic saint cards for kids. The card reminds little ones: "${card.text}"`,
      `Parents and catechists can use this short story as a doorway into prayer, courage, and friendship with the saints.${whenBit}${refBit}`,
    ],
    [
      `Looking for a simple Catholic intro to ${card.title} for children? This Little Light card from "${card.set}" says: "${card.text}"`,
      `Read it aloud, then linger on the questions below so the saint's witness sticks beyond a craft table.${whenBit}${refBit}`,
    ],
    [
      `Kids meet ${card.title} through a single vivid line: "${card.text}" That spark is why this "${card.set}" card works so well at home and in CCD.`,
      `Pair the card with a candle, a picture book, or a quiet moment after Mass.${whenBit}${refBit}`,
    ],
    [
      `Catholic kids often ask who the saints really were. ${card.title} answers with a child-sized truth: "${card.text}"`,
      `Use this "${card.set}" card when you want holiness to feel close, not distant.${whenBit}${refBit}`,
    ],
  ];
  const intro = variants[hash(card.id) % variants.length]!;
  const qVariants: Array<[string, string, string]> = [
    [
      `What do you notice first when you hear about ${card.title}: "${card.text}"?`,
      `How could our family copy one good habit from ${card.title} this week?`,
      card.when
        ? `On ${card.when}, how might we thank God for ${card.title}?`
        : `Who could we tell about ${card.title} so the story keeps traveling?`,
    ],
    [
      `If ${card.title} sat at our dinner table, what question would you ask?`,
      `Which part of "${card.text}" feels bravest or kindest to you?`,
      card.ref
        ? `Shall we open ${card.ref} together after looking at this card?`
        : `Where do you see God's love in the life of ${card.title}?`,
    ],
    [
      `Why do you think the Church still remembers ${card.title} today?`,
      `How does "${card.text}" sound like something Jesus would smile at?`,
      `What prayer can we say with ${card.title} before bedtime?`,
    ],
  ];
  const questions = qVariants[hash(card.id + "q") % qVariants.length]!;
  return {
    seoTitle: clip(`${card.title} — Catholic Saint for Kids`, 60),
    description: clip(
      `Catholic saint card for kids about ${card.title} (${card.set}). "${card.text}"${whenBit}${refBit} Free family talk questions included.`,
      158,
    ),
    h1: `${card.title}: a Catholic saint story for kids`,
    intro,
    questions,
  };
}

export function faithPageSeo(card: SeoCard): CardPageSeo {
  const whenBit = card.when ? ` Often used ${card.when}.` : "";
  const refBit = card.ref ? ` Scripture cue: ${card.ref}.` : "";
  const catLabel = card.cat;
  const variants: Array<[string, string]> = [
    [
      `"${card.title}" is a ${catLabel} card in the "${card.set}" set. It teaches kids: "${card.text}"`,
      `Use it before Mass, during family prayer, or in a catechism lesson when you need one clear Catholic idea.${whenBit}${refBit}`,
    ],
    [
      `Catholic parents hunting for a plain-language take on "${card.title}" can start here. The card says: "${card.text}"`,
      `That line sits inside "${card.set}" under ${catLabel}, so it fits naturally with the rest of your faith shelf.${whenBit}${refBit}`,
    ],
    [
      `Kids remember faith when it is concrete. "${card.title}" gives them this: "${card.text}"`,
      `Read it twice — once for the words, once for a quiet pause — then try the talk prompts below.${whenBit}${refBit}`,
    ],
    [
      `From our ${catLabel} collection, "${card.title}" belongs to "${card.set}". Its kid-friendly summary: "${card.text}"`,
      `Keep the card nearby when questions about Church life bubble up at the dinner table.${whenBit}${refBit}`,
    ],
  ];
  const intro = variants[hash(card.id) % variants.length]!;
  const qVariants: Array<[string, string, string]> = [
    [
      `In your own words, what does "${card.title}" mean after hearing "${card.text}"?`,
      `Where might we practice this ${catLabel.toLowerCase()} idea at home this week?`,
      card.ref
        ? `How does ${card.ref} shine a light on "${card.title}"?`
        : `What is one question you still have about "${card.title}"?`,
    ],
    [
      `Which word in "${card.text}" feels most important to you?`,
      `How could "${card.title}" help a friend who is new to Mass or prayer?`,
      card.when
        ? `When we see this around ${card.when}, what should we remember?`
        : `Who in our parish lives "${card.title}" well?`,
    ],
    [
      `Why do Catholics care about "${card.title}" enough to put it on a kids' card?`,
      `What is a kind action that matches "${card.text}"?`,
      `Shall we thank God for teaching us through "${card.title}"?`,
    ],
  ];
  const questions = qVariants[hash(card.id + "q") % qVariants.length]!;
  return {
    seoTitle: clip(`${card.title} — Catholic Faith for Kids`, 60),
    description: clip(
      `Catholic faith card for kids: ${card.title} (${card.cat} / ${card.set}). "${card.text}"${whenBit}${refBit}`,
      158,
    ),
    h1: `${card.title}: Catholic faith explained for kids`,
    intro,
    questions,
  };
}

export function groupSaintsBySet(cards: readonly SeoCard[] = SAINT_SEO_CARDS): { set: string; cards: SeoCard[] }[] {
  const map = new Map<string, SeoCard[]>();
  for (const c of cards) {
    const list = map.get(c.set) ?? [];
    list.push(c);
    map.set(c.set, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([set, list]) => ({
      set,
      cards: list.sort((a, b) => a.prio - b.prio || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)),
    }));
}

export function groupFaithByCatThenSet(
  cards: readonly SeoCard[] = FAITH_SEO_CARDS,
): { cat: CardCategory; sets: { set: string; cards: SeoCard[] }[] }[] {
  const byCat = new Map<CardCategory, Map<string, SeoCard[]>>();
  for (const c of cards) {
    const sets = byCat.get(c.cat) ?? new Map<string, SeoCard[]>();
    const list = sets.get(c.set) ?? [];
    list.push(c);
    sets.set(c.set, list);
    byCat.set(c.cat, sets);
  }
  const catOrder: CardCategory[] = ["Mass & Church", "Prayer", "Sacrament", "Virtue & Life"];
  return catOrder
    .filter((cat) => byCat.has(cat))
    .map((cat) => ({
      cat,
      sets: [...byCat.get(cat)!.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([set, list]) => ({
          set,
          cards: list.sort((a, b) => a.prio - b.prio || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)),
        })),
    }));
}
