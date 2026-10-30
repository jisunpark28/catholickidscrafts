// One search across Weekly Sheets and picture Cards, ranked together by relevance (server-only).
import { cardSeasons, PICTURE_CARDS } from "@/lib/resource/cards";
import type { PictureCard } from "@/lib/resource/card-meta";
import { type ResourceSeason, sheetSeason } from "@/lib/resource/sheets";
import { getSundaySheet, listSundaySheetKeys, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export type SearchHit =
  | { type: "sheet"; score: number; sheet: SundaySheetContent }
  | { type: "card"; score: number; card: PictureCard };

function norm(s: string): string {
  return ` ${s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9: ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/** Strings to search, strongest first. */
type Fields = { strong: string; medium: string; weak: string };

function scoreFields(f: Fields, terms: string[], phrase: string): number {
  let total = 0;
  for (const t of terms) {
    // Whole-word hits count double vs. substring ("mary" in "rosary" is not a Mary result).
    const word = ` ${t} `;
    const s = f.strong.includes(word) ? 8 : f.strong.includes(t) ? 3 : 0;
    const m = f.medium.includes(word) ? 3 : f.medium.includes(t) ? 1 : 0;
    const w = f.weak.includes(word) ? 1 : 0;
    if (!s && !m && !w) return 0; // every term must match somewhere
    total += s + m + w;
  }
  if (terms.length > 1 && f.strong.includes(phrase)) total += 10;
  return total;
}

function sheetFields(sheet: SundaySheetContent): Fields {
  const l1 = sheet.levels.level1;
  const l2 = sheet.levels.level2;
  return {
    strong: norm([sheet.liturgicalName, sheet.gospelRef, l1.title, l2.title].join(" | ")),
    medium: norm([l1.keyLine, l2.keyLine, sheet.keyVerseDR, sheet.season].join(" | ")),
    weak: norm(
      [l1.story, l2.story, ...l1.words, ...l2.words, l1.prayer, l2.prayer, l1.activity?.title ?? "", l2.activity?.title ?? ""].join(
        " | ",
      ),
    ),
  };
}

function cardFields(card: PictureCard): Fields {
  return {
    strong: norm([card.title, card.ref ?? ""].join(" | ")),
    medium: norm([card.set, card.cat, card.when ?? ""].join(" | ")),
    weak: norm(card.text),
  };
}

const fieldCache = new Map<string, Fields>();
const cached = (k: string, f: () => Fields) => {
  let v = fieldCache.get(k);
  if (!v) {
    v = f();
    fieldCache.set(k, v);
  }
  return v;
};

export function searchTerms(q: string): string[] {
  return norm(q)
    .trim()
    .split(" ")
    .filter((t) => t.length > 1)
    .slice(0, 8);
}

/** Sheets + cards matching every term (and the season filter), best first. */
export function unifiedSearch(q: string, season: ResourceSeason | null, thisSundayKey: string | null): SearchHit[] {
  const terms = searchTerms(q);
  if (!terms.length) return [];
  const phrase = ` ${terms.join(" ")} `;
  const hits: SearchHit[] = [];

  for (const key of listSundaySheetKeys()) {
    const sheet = getSundaySheet(key);
    if (!sheet) continue;
    if (season && sheetSeason(sheet) !== season) continue;
    let score = scoreFields(cached(`s:${key}`, () => sheetFields(sheet)), terms, phrase);
    if (score > 0) {
      if (key === thisSundayKey) score += 2;
      hits.push({ type: "sheet", score, sheet });
    }
  }
  for (const card of PICTURE_CARDS) {
    if (season && !cardSeasons(card).includes(season)) continue;
    let score = scoreFields(cached(`c:${card.id}`, () => cardFields(card)), terms, phrase);
    if (score > 0) {
      if (thisSundayKey && card.sheetKeys?.includes(thisSundayKey)) score += 2;
      hits.push({ type: "card", score, card });
    }
  }
  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      (a.type === b.type ? 0 : a.type === "sheet" ? -1 : 1) ||
      (a.type === "sheet" && b.type === "sheet"
        ? a.sheet.key.localeCompare(b.sheet.key, "en", { numeric: true })
        : a.type === "card" && b.type === "card"
          ? a.card.prio - b.card.prio || a.card.id.localeCompare(b.card.id)
          : 0),
  );
}
