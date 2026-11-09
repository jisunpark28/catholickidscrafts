/** Evergreen worksheet SEO; catalog is shared with Resource, separate from Sunday keys. */
import { FAITH_SEO_CARDS, type SeoCard } from "@/lib/seo/card-seo";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import type { EvergreenPage } from "@/lib/evergreen-catalog";
export * from "@/lib/evergreen-catalog";

export function evergreenSeoTitle(page: EvergreenPage): string {
  return page.kind === "mass"
    ? `${page.name} Mass Worksheet for Kids`
    : `${page.name} Virtue Challenge Worksheet for Kids`;
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
