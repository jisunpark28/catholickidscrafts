import type { HomeSectionWithItems } from "@/lib/home-sections";

/** Preferred display order on the home hub. */
export const HOME_SECTION_ORDER = [
  "Bible Reading",
  "Play & Learn",
  "Liturgical Catechesis",
] as const;

/** Default home hub blocks (English) — used when DB has no rows and for seeding. */
export const DEFAULT_HOME_SECTIONS: HomeSectionWithItems[] = [
  {
    id: "default-bible-reading",
    title: "Bible Reading",
    sortOrder: 0,
    items: [
      { id: "default-gospel", title: "Today's Gospel", href: "/gospel", sortOrder: 0 },
      { id: "default-ot", title: "Old Testament", href: "/bible/genesis", sortOrder: 1 },
      { id: "default-nt", title: "New Testament", href: "/bible/matthew", sortOrder: 2 },
    ],
  },
  {
    id: "default-play-learn",
    title: "Play & Learn",
    sortOrder: 1,
    items: [
      { id: "default-games", title: "Games", href: "/play", sortOrder: 0 },
      { id: "default-class-lessons", title: "Lesson Kits", href: "/program", sortOrder: 1 },
    ],
  },
  {
    id: "default-liturgical-catechesis",
    title: "Liturgical Catechesis",
    sortOrder: 2,
    items: [
      { id: "default-easter", title: "Easter Season", href: "/resources?period=easter", sortOrder: 0 },
      { id: "default-advent", title: "Advent", href: "/resources?period=advent", sortOrder: 1 },
      { id: "default-lent", title: "Lent", href: "/resources?period=lent", sortOrder: 2 },
      { id: "default-ordinary", title: "Ordinary Time", href: "/resources?period=ordinary", sortOrder: 3 },
    ],
  },
];

export function sortHomeSectionsByTitle<T extends { title: string; sortOrder: number }>(
  sections: T[],
): T[] {
  return [...sections].sort((a, b) => {
    const ai = HOME_SECTION_ORDER.indexOf(a.title as (typeof HOME_SECTION_ORDER)[number]);
    const bi = HOME_SECTION_ORDER.indexOf(b.title as (typeof HOME_SECTION_ORDER)[number]);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.sortOrder - b.sortOrder;
  });
}

export function defaultHomeSectionsForSeed() {
  return DEFAULT_HOME_SECTIONS.map((section) => ({
    title: section.title,
    sortOrder: section.sortOrder,
    items: section.items.map((item) => ({
      title: item.title,
      href: item.href,
      sortOrder: item.sortOrder,
    })),
  }));
}
