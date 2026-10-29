// Little Light picture cards: types + URL helpers. Client-safe and data-free
// (the 626-card catalog lives in ./cards.ts so it never lands in a client bundle).

export type CardCategory =
  | "Feast"
  | "Prayer"
  | "Saint"
  | "Mary"
  | "Sacrament"
  | "Mass & Church"
  | "Liturgical Year"
  | "Bible"
  | "Virtue & Life"
  | "Fun & Collectible"
  | "Masterpiece";

export type PictureCard = {
  /** e.g. "FEA-030" — also the image file name. */
  id: string;
  cat: CardCategory;
  /** Series within the category, e.g. "Solemnities that can replace a Sunday". */
  set: string;
  title: string;
  /** Caption printed on the card. */
  text: string;
  /** 1 = core, 2, 3 (plan priority). */
  prio: number;
  /** Short Scripture reference printed on the card, e.g. "Rev 7:9". */
  ref?: string;
  /** Human "when" label (date or season), e.g. "Nov 1", "Lent (Fridays)". */
  when?: string;
  /** Fixed calendar day "MM-DD" when the card belongs to one. */
  md?: string;
  /** Sunday sheet keys this card belongs to (e.g. "SOL_ALLSAINTS", "A_OT04"). */
  sheetKeys?: string[];
};

/** Slim shape sent to the client grid. */
export type CardListItem = Pick<PictureCard, "id" | "cat" | "set" | "title" | "ref" | "when"> & {
  /** Next date (YYYY-MM-DD) this card is used, when known. */
  date?: string;
  /** True when the date comes from a Sunday sheet. */
  sunday?: boolean;
  /** Liturgical season ids (same ids as the Weekly Sheet "Season" filter). */
  seasons?: CardSeason[];
};

/** Same ids as RESOURCE_SEASONS in lib/resource/sheets. */
export type CardSeason = "advent" | "christmas" | "lent" | "easter" | "ordinary-time" | "feasts";

/** Strict ID shape: three-letter prefix + three digits. */
export const CARD_ID_RE = /^(FEA|PRY|SNT|MAR|SAC|MAS|LIT|BIB|VIR|FUN|MST)-\d{3}$/;

/** Filter chips, in mockup order. `slug` is used in the URL (?cat=). */
export const CARD_CATEGORIES: readonly { slug: string; label: string; cat: CardCategory }[] = [
  { slug: "feast", label: "Feast", cat: "Feast" },
  { slug: "liturgical-year", label: "Liturgical Year", cat: "Liturgical Year" },
  { slug: "prayer", label: "Prayer", cat: "Prayer" },
  { slug: "saint", label: "Saint", cat: "Saint" },
  { slug: "mary", label: "Mary", cat: "Mary" },
  { slug: "sacrament", label: "Sacrament", cat: "Sacrament" },
  { slug: "mass-church", label: "Mass & Church", cat: "Mass & Church" },
  { slug: "bible", label: "Bible", cat: "Bible" },
  { slug: "virtue-life", label: "Virtue & Life", cat: "Virtue & Life" },
  { slug: "fun", label: "Fun & Collectible", cat: "Fun & Collectible" },
  { slug: "masterpiece", label: "Masterpiece", cat: "Masterpiece" },
];

export function parseCardCategory(raw: string | undefined | null): string {
  return CARD_CATEGORIES.some((c) => c.slug === raw) ? (raw as string) : "";
}

/** Public preview (432×540 WebP in /public). Full-res PNGs are Plus-only via the API. */
export function cardThumbSrc(id: string): string {
  return `/cards/thumbs/${id}.webp`;
}

/** Plus-only full-resolution 1080×1350 PNG (server checks session + Plus). */
export function cardDownloadPath(id: string): string {
  return `/api/resource/cards/${id}/download`;
}

/** Shareable page link (the Resource Cards tab opened on this card). */
export function cardSharePath(id: string): string {
  return `/resource?view=cards&card=${encodeURIComponent(id)}`;
}

export function cardFileName(card: Pick<PictureCard, "id" | "title">): string {
  const slug = card.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `catholickidscrafts-${card.id}${slug ? `-${slug}` : ""}.png`;
}

/** "Feast card", "Saint card" … */
export function cardKindLabel(cat: CardCategory): string {
  return `${cat} card`;
}

/** Plus-only print page: just the full-size 4:5 card fitted to one Letter/A4 page. */
export function cardPrintPath(id: string): string {
  return `/print/resource/card/${id}`;
}

/** Share targets for a card link (same list as the detail panel). */
export function cardShareTargets(card: Pick<PictureCard, "id" | "title">, siteUrl: string) {
  const url = `${siteUrl.replace(/\/$/, "")}${cardSharePath(card.id)}`;
  const text = `${card.title} — a Little Light picture card from Catholic Kids Crafts`;
  const enc = encodeURIComponent;
  return {
    url,
    text,
    links: [
      { label: "Messages", href: `sms:?&body=${enc(`${text} ${url}`)}` },
      { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
      { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
      { label: "Email", href: `mailto:?subject=${enc(card.title)}&body=${enc(`${text}\n${url}`)}` },
    ],
  };
}
