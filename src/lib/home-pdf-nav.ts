import type { HomeSectionWithItems } from "@/lib/home-sections";

export type HomePdfLink = {
  id: string;
  label: string;
  href: string;
};

export type HomePdfGroup = {
  id: string;
  title: string;
  items: HomePdfLink[];
};

type ExtraLabels = {
  gallery: string;
  curriculum: string;
  resources: string;
  play: string;
};

type PdfItem = {
  id: string;
  label: string;
  match: RegExp;
  fallback: string;
  /** Keep this href even when a home-section item matches the label. */
  lockHref?: boolean;
};

const PDF_GROUPS: { id: string; title: string; items: PdfItem[] }[] = [
  {
    id: "bible",
    title: "Bible",
    items: [
      {
        id: "gospel",
        label: "Today's Gospel",
        match: /gospel/i,
        fallback: "/gospel",
      },
      {
        id: "old-testament",
        label: "Old Testament",
        match: /old testament/i,
        fallback: "/bible/genesis",
      },
      {
        id: "new-testament",
        label: "New Testament",
        match: /new testament/i,
        fallback: "/bible/matthew",
      },
    ],
  },
  {
    id: "liturgy",
    title: "Liturgy",
    items: [
      { id: "prayers", label: "Prayers", match: /^prayers$/i, fallback: "/prayers" },
      { id: "mass", label: "Mass", match: /^mass$/i, fallback: "/liturgy/mass", lockHref: true },
      {
        id: "sacraments",
        label: "Sacraments",
        match: /^sacraments$/i,
        fallback: "/liturgy/sacraments",
        lockHref: true,
      },
      {
        id: "saints",
        label: "Saints",
        match: /^saints$/i,
        fallback: "/liturgy/saints",
        lockHref: true,
      },
      {
        id: "devotions",
        label: "Devotions",
        match: /^devotions$/i,
        fallback: "/liturgy/devotions",
        lockHref: true,
      },
      {
        id: "ordinary",
        label: "Ordinary Time",
        match: /ordinary/i,
        fallback: "/resources?period=ordinary",
      },
      { id: "advent", label: "Advent", match: /^advent$/i, fallback: "/resources?period=advent" },
      {
        id: "christmas",
        label: "Christmas Time",
        match: /christmas/i,
        fallback: "/resources?period=christmas",
      },
      { id: "lent", label: "Lent", match: /^lent$/i, fallback: "/resources?period=lent" },
      {
        id: "triduum",
        label: "Paschal Triduum",
        match: /triduum|holy week/i,
        fallback: "/resources?period=holy-week",
      },
      {
        id: "easter",
        label: "Easter Time",
        match: /easter/i,
        fallback: "/resources?period=easter",
      },
    ],
  },
];

function pathOf(href: string): string {
  return href.split("?")[0] ?? href;
}

/**
 * PDF sidebar (Bible, Liturgy) with hrefs taken from published home sections
 * when the title matches. Items the PDF does not show stay in `extra`.
 */
export function buildHomePdfNav(
  sections: HomeSectionWithItems[],
  extraLabels: ExtraLabels,
): { groups: HomePdfGroup[]; extra: HomePdfLink[] } {
  const pool = sections.flatMap((section) => section.items);
  const used = new Set<string>();

  const groups: HomePdfGroup[] = PDF_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => {
      const found = pool.find((entry) => !used.has(entry.id) && item.match.test(entry.title));
      if (found) used.add(found.id);
      if (found && !item.lockHref) {
        return { id: found.id, label: item.label, href: found.href };
      }
      return { id: item.id, label: item.label, href: item.fallback };
    }),
  }));

  const extra: HomePdfLink[] = pool
    .filter((entry) => !used.has(entry.id))
    .map((entry) => ({ id: entry.id, label: entry.title, href: entry.href }));

  const hrefs = new Set(
    [...groups.flatMap((group) => group.items), ...extra].map((item) => item.href),
  );
  const paths = new Set([...hrefs].map(pathOf));

  if (!paths.has("/play")) {
    extra.push({ id: "play", label: extraLabels.play, href: "/play" });
  }
  if (!paths.has("/gallery")) {
    extra.push({ id: "gallery", label: extraLabels.gallery, href: "/gallery" });
  }
  if (!paths.has("/curriculum")) {
    extra.push({ id: "curriculum", label: extraLabels.curriculum, href: "/curriculum" });
  }
  if (!hrefs.has("/resources")) {
    extra.push({ id: "resources", label: extraLabels.resources, href: "/resources" });
  }

  return { groups, extra };
}
