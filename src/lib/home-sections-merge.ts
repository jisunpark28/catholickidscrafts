import type { HomeSectionWithItems } from "@/lib/home-sections";
import { normalizeHubHref } from "@/lib/hub-href";

function hrefKey(href: string): string {
  return normalizeHubHref(href).toLowerCase();
}

/**
 * Inject code-shipped default hub pills when the DB predates a new link
 * (e.g. Prayers on Play & Learn). Admin rows win when the same href exists.
 */
export function mergeHomeSectionsWithDefaults(
  published: HomeSectionWithItems[],
  defaults: HomeSectionWithItems[],
): HomeSectionWithItems[] {
  return published.map((section) => {
    const def = defaults.find((d) => d.title === section.title);
    if (!def) return section;

    const seen = new Set(section.items.map((i) => hrefKey(i.href)));
    const mergedItems = [...section.items];

    for (const defItem of def.items) {
      const href = normalizeHubHref(defItem.href);
      const key = hrefKey(href);
      if (seen.has(key)) continue;
      seen.add(key);
      mergedItems.push({
        ...defItem,
        href,
      });
    }

    mergedItems.sort((a, b) => a.sortOrder - b.sortOrder);
    return { ...section, items: mergedItems };
  });
}
