/** Evergreen worksheet SEO; catalog is shared with Resource, separate from Sunday keys. */
import { FAITH_SEO_CARDS, type SeoCard } from "@/lib/seo/card-seo";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import type { EvergreenPage } from "@/lib/evergreen-catalog";
export * from "@/lib/evergreen-catalog";

/** Visible H1 for the four-parts guide. The HTML title is FOUR_PARTS_SEO_TITLE. */
export const FOUR_PARTS_H1 = "Parts of the Mass for Kids: Order of the Mass & Worksheet";

/** Absolute <title> / og:title. Does not repeat the word Mass. */
export const FOUR_PARTS_SEO_TITLE = "Parts of the Mass for Kids: 4-Part Guide & Printable Worksheet";

export const FOUR_PARTS_DESCRIPTION =
  "Teach the four parts of the Catholic Mass for kids in order — ideal for First Communion prep, family Mass prep, parish CCD, and homeschool. Includes church layout, sacred vessels, liturgical colors, reconciliation, lesson guide, and Level 1 & 2 worksheets.";

export function evergreenSeoTitle(page: EvergreenPage): string {
  if (page.slug === "four-parts-of-the-mass") return FOUR_PARTS_SEO_TITLE;
  if (page.kind !== "mass") return `${page.name} Virtue Challenge Worksheet for Kids`;
  // Names that already end in "Mass" must not gain a second "Mass".
  const base = page.name.replace(/\s+Mass$/i, "");
  return `${base} Mass Worksheet for Kids`;
}

export function evergreenH1(page: EvergreenPage): string {
  return page.slug === "four-parts-of-the-mass" ? FOUR_PARTS_H1 : evergreenSeoTitle(page);
}

export function evergreenDescription(page: EvergreenPage, sheet: SundaySheetContent): string {
  const lead = sheet.levels.level1.story.trim();
  const tail =
    page.kind === "mass"
      ? "Printable Catholic Mass worksheet for kids, with two levels. Preview and print with Plus."
      : "Printable take-home family virtue challenge: Mon-Sat checklist, Family Talk, and parent signature. Preview and print with Plus.";
  const text = `${lead} ${tail}`;
  return text.length > 300 ? `${text.slice(0, 297)}...` : text;
}

const CARD_BY_ID = new Map(FAITH_SEO_CARDS.map((c) => [c.id, c]));

export function relatedCards(page: EvergreenPage): SeoCard[] {
  return page.relatedCardIds.map((id) => CARD_BY_ID.get(id)).filter((c): c is SeoCard => Boolean(c));
}
