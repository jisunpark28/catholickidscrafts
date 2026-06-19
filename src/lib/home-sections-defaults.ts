import type { HomeSectionWithItems } from "@/lib/home-sections";

/** Default home hub blocks (English) — used when DB has no rows and for seeding. */
export const DEFAULT_HOME_SECTIONS: HomeSectionWithItems[] = [
  {
    id: "default-bible-reading",
    title: "Bible Reading",
    sortOrder: 0,
    items: [
      { id: "default-gospel", title: "Today's Gospel", href: "/bible/gospel", sortOrder: 0 },
      { id: "default-ot", title: "Old Testament", href: "/bible/old-testament", sortOrder: 1 },
      { id: "default-nt", title: "New Testament", href: "/bible/new-testament", sortOrder: 2 },
    ],
  },
  {
    id: "default-liturgical-catechesis",
    title: "Liturgical Catechesis",
    sortOrder: 1,
    items: [
      { id: "default-easter", title: "Easter Season", href: "/resources?period=easter", sortOrder: 0 },
      { id: "default-advent", title: "Advent", href: "/resources?period=advent", sortOrder: 1 },
      { id: "default-lent", title: "Lent", href: "/resources?period=lent", sortOrder: 2 },
      { id: "default-ordinary", title: "Ordinary Time", href: "/resources?period=ordinary", sortOrder: 3 },
    ],
  },
  {
    id: "default-play-learn",
    title: "Play & Learn",
    sortOrder: 2,
    items: [{ id: "default-games", title: "Games", href: "/play", sortOrder: 0 }],
  },
];

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
