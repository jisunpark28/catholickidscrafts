import { getEvergreenPage } from "@/lib/evergreen-catalog";
// One search across Weekly Sheets, Activities and picture Cards, ranked together by relevance (server-only).
import { listActivities, type ResourceActivity } from "@/lib/resource/activities";
import { cardSeasons, PICTURE_CARDS } from "@/lib/resource/cards";
import type { PictureCard } from "@/lib/resource/card-meta";
import { type ResourceSeason, sheetSeason, listResourceSheets, searchSheets } from "@/lib/resource/sheets";
import { type SundaySheetContent } from "@/lib/sunday-sheet-content";

export type SearchHit =
  | { type: "sheet"; score: number; sheet: SundaySheetContent }
  | { type: "card"; score: number; card: PictureCard }
  | { type: "activity"; score: number; activity: ResourceActivity };

/** Stable id of any hit (sheet key, card id or activity slug). */
export function searchHitId(hit: SearchHit): string {
  return hit.type === "sheet" ? hit.sheet.key : hit.type === "card" ? hit.card.id : `activity:${hit.activity.slug}`;
}

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

function activityFields(activity: ResourceActivity): Fields {
  return {
    strong: norm([activity.title, activity.kind].join(" | ")),
    medium: norm([activity.summary, ...activity.seasons, ...activity.keywords].join(" | ")),
    weak: norm([activity.description, ...activity.tryThis].join(" | ")),
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

/** A single browse catalog: activities first, then sheets and cards interleaved so cards are visible from the first page. */
export function browseResources(season: ResourceSeason | null): SearchHit[] {
  const sheets = searchSheets({ season });
  const cards = PICTURE_CARDS.filter((card) => !season || cardSeasons(card).includes(season));
  const hits: SearchHit[] = listActivities(season).map((activity) => ({ type: "activity", score: 0, activity }));
  for (let i = 0; i < Math.max(sheets.length, cards.length); i++) {
    if (sheets[i]) hits.push({ type: "sheet", score: 0, sheet: sheets[i]! });
    if (cards[i]) hits.push({ type: "card", score: 0, card: cards[i]! });
  }
  return hits;
}

/** Sheets + cards matching every term (and the season filter), best first. Empty query browses all. */
export function unifiedSearch(q: string, season: ResourceSeason | null, thisSundayKey: string | null): SearchHit[] {
  if (!q.trim()) return browseResources(season);
  const terms = searchTerms(q);
  if (!terms.length) return [];
  const phrase = ` ${terms.join(" ")} `;
  const hits: SearchHit[] = [];

  for (const sheet of listResourceSheets()) {
    const key = sheet.key;
    if (season && (getEvergreenPage(key) || sheetSeason(sheet) !== season)) continue;
    let score = scoreFields(cached(`s:${key}`, () => sheetFields(sheet)), terms, phrase);
    if (score > 0) {
      if (key === thisSundayKey) score += 2;
      hits.push({ type: "sheet", score, sheet });
    }
  }
  for (const activity of listActivities(season)) {
    const score = scoreFields(cached(`a:${activity.slug}`, () => activityFields(activity)), terms, phrase);
    if (score > 0) hits.push({ type: "activity", score, activity });
  }
  for (const card of PICTURE_CARDS) {
    if (season && !cardSeasons(card).includes(season)) continue;
    let score = scoreFields(cached(`c:${card.id}`, () => cardFields(card)), terms, phrase);
    if (score > 0) {
      if (thisSundayKey && card.sheetKeys?.includes(thisSundayKey)) score += 2;
      hits.push({ type: "card", score, card });
    }
  }
  const typeOrder = { sheet: 0, activity: 1, card: 2 } as const;
  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      typeOrder[a.type] - typeOrder[b.type] ||
      (a.type === "sheet" && b.type === "sheet"
        ? a.sheet.key.localeCompare(b.sheet.key, "en", { numeric: true })
        : a.type === "card" && b.type === "card"
          ? a.card.prio - b.card.prio || a.card.id.localeCompare(b.card.id)
          : 0),
  );
}
