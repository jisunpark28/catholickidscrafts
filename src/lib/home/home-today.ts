// Server-only (romcal via sheet-keys). Do not import from Client Components.
// Data for the home dashboard: liturgical banner, this Sunday's sheet, kid mission word and
// season highlights. Pure and deterministic for a (date, country) pair: no DB, no request data,
// no network, so the home page can stay static / ISR. Never throws; missing data -> null or a
// season-page fallback.
import SEASON_HIGHLIGHTS_JSON from "@/data/home/season-highlights.json";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { currentSeasonHref } from "@/lib/liturgy-season-href";
import { isLiturgyTopic, LITURGY_TOPIC_LABELS, type LiturgyTopic } from "@/lib/liturgy-topics";
import { cardMonthDay, cardSharePath, cardsForSheetKey, cardThumbSrc, PICTURE_CARDS, type PictureCard } from "@/lib/resource/cards";
import { keyToSlug, resourcePrintPath } from "@/lib/resource/sheets";
import { todayIn } from "@/lib/resource/this-sunday";
import { getRomcalCelebration, type RomcalCelebration } from "@/lib/romcal-liturgical";
import { SAINT_SEO_CARDS, SAINTS_HUB } from "@/lib/seo/card-seo";
import { sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { enabledOrFallback, toSheetKey, type RomcalCountry } from "@/lib/sheet-keys";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import type { LiturgicalSeasonInfo } from "@/types/mass";

const DAY = 86_400_000;
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Days after today searched for the banner card when today has none. */
const BANNER_LOOKAHEAD_DAYS = 7;
/** Days after today searched for the two automatic season highlights. */
const HIGHLIGHT_LOOKAHEAD_DAYS = 60;
export const KID_MISSION_WORD_RE = /^[A-Za-z]{3,7}$/;
export const KID_MISSION_FALLBACK = "PRAY";

export type HomeTodayCard = {
  id: string;
  title: string;
  /** Title for buttons: "St. Martin of Tours", "Our Lady of Guadalupe". */
  shortTitle: string;
  thumb: string;
  /** YYYY-MM-DD the card belongs to. */
  date: string;
  /** 0 = today. */
  daysAway: number;
  relation: "today" | "upcoming";
  /** True when the card is for today and names today's romcal celebration (or Sunday/feast). */
  matchesCelebration: boolean;
  /** Public detail page (saint page, Juan Diego for Guadalupe, …), or null when none exists. */
  detailUrl: string | null;
  /** Where the banner button goes: detailUrl, else the card in the Resource library. */
  href: string;
};

export type HomeTodayBanner = {
  /** Button text. "Read Card →" only when the card is today's celebration; else it names the card. */
  label: string;
  href: string;
  /** Null when no card falls within 7 days: the button then opens the season page. */
  card: HomeTodayCard | null;
};

export type HomeTodaySunday = {
  key: string;
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  /** e.g. "November 15, 2026" */
  label: string;
  title: string;
  liturgicalName: string;
  gospelRef: string;
  /** Public SEO page for this sheet. */
  worksheetUrl: string;
  print: { level1: string; level2: string };
};

export type HomeHighlight = {
  kind: "card" | "curated" | "season";
  title: string;
  href: string;
  /** kind "card" only. */
  cardId?: string;
  date?: string;
  thumb?: string;
};

export type HomeToday = {
  /** YYYY-MM-DD the data is for. */
  date: string;
  country: RomcalCountry;
  season: {
    name: LiturgicalSeasonInfo["name"];
    color: LiturgicalSeasonInfo["color"];
    /** Liturgy topic slug, e.g. "ordinary-time". */
    slug: LiturgyTopic;
    label: string;
    href: string;
  };
  /** romcal's winning celebration for the country, names split per saint. Null if romcal fails. */
  celebration: (Pick<RomcalCelebration, "key" | "type" | "name" | "names" | "colorKey"> & { isFeria: boolean }) | null;
  banner: HomeTodayBanner;
  sunday: HomeTodaySunday | null;
  kidMission: { word: string; source: "sheet" | "fallback" };
  /** Always 4: two upcoming cards, then two curated links for the season (season page fills gaps). */
  highlights: HomeHighlight[];
};

type CuratedLink = { title: string; href: string };
const SEASON_HIGHLIGHTS = SEASON_HIGHLIGHTS_JSON as Partial<Record<string, CuratedLink[]>>;

const SAINT_SLUG = new Map(SAINT_SEO_CARDS.map((c) => [c.id, c.slug]));
/** Feast cards with no page of their own, mapped to the closest real page. */
const GUADALUPE_CARD_IDS = new Set(["FEA-035", "MAR-009", "MST-046"]);
const JUAN_DIEGO_CARD_ID = "SNT-036";
const IMMACULATE_CARD_IDS = new Set(["FEA-034", "MST-030"]);
const IMMACULATE_SHEET_KEY = "SOL_IMMACULATE";

const PREFIX_ORDER = ["FEA", "MAR", "SNT", "LIT", "BIB", "SAC", "MAS", "PRY", "VIR", "FUN", "MST"];
const byPrefix = (a: PictureCard, b: PictureCard) =>
  PREFIX_ORDER.indexOf(a.id.slice(0, 3)) - PREFIX_ORDER.indexOf(b.id.slice(0, 3)) || a.prio - b.prio || a.id.localeCompare(b.id);

function addDays(ymd: string, days: number): string {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

function dayOfWeek(ymd: string): number {
  return new Date(`${ymd}T00:00:00Z`).getUTCDay();
}

function resolveDate(date: string | Date | undefined): string {
  if (typeof date === "string" && YMD_RE.test(date) && Number.isFinite(Date.parse(`${date}T00:00:00Z`))) return date;
  const now = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
  return todayIn("canada", now); // America/Toronto
}

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** "Saint Thérèse of Lisieux (The Little Flower)" -> "St. Thérèse of Lisieux"; "Christmas – The Nativity…" -> "Christmas". */
export function cardShortTitle(card: Pick<PictureCard, "title">): string {
  return card.title
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .split(/\s+[–—-]\s+/)[0]!
    .replace(/^Saints\b/, "Sts.")
    .replace(/\bSaint\b/g, "St.")
    .replace(/\s+/g, " ")
    .trim();
}

const NAME_STOPWORDS = new Set(["saint", "saints", "st", "sts", "the", "of", "and", "our", "a", "blessed"]);

/** True when every significant word of the card title appears in today's romcal name. */
function namesCelebration(card: PictureCard, cel: RomcalCelebration | null): boolean {
  if (!cel?.name) return false;
  const hay = fold(cel.name);
  const words = fold(card.title.replace(/\([^)]*\)/g, " ").split(/\s+[–—-]\s+/)[0]!)
    .split(/[^a-z]+/)
    .filter((w) => w.length > 1 && !NAME_STOPWORDS.has(w));
  return words.length > 0 && words.every((w) => hay.includes(w));
}

const ROMCAL_KEY_CARDS = new Map<string, PictureCard[]>();
for (const card of PICTURE_CARDS) {
  for (const k of card.romcalKeys ?? []) ROMCAL_KEY_CARDS.set(k, [...(ROMCAL_KEY_CARDS.get(k) ?? []), card]);
}
for (const list of ROMCAL_KEY_CARDS.values()) list.sort(byPrefix);

function sheetKeyFor(sunday: string, country: RomcalCountry): string | null {
  try {
    return toSheetKey(sunday, country);
  } catch {
    return null;
  }
}

/**
 * Best card for one day, in this order:
 *  1. a movable-feast card whose `romcalKeys` has the day's romcal celebration (Ash Wednesday, Sacred Heart, …);
 *  2. on a Sunday that romcal ranks as a solemnity/feast: the Sunday sheet's own card (Christ the King);
 *  3. the day's fixed-date card (country day from `mdByCountry`, else `md`), the one romcal names first;
 *  4. on any Sunday: the Sunday sheet's card (Advent Sundays, Divine Mercy, Gospel story cards).
 * Rule 3 runs before 4 so a saint whose memorial falls on an ordinary Sunday still shows (Dec 6 Nicholas).
 */
function cardForDay(ymd: string, country: RomcalCountry): { card: PictureCard; matches: boolean } | null {
  const cel = getRomcalCelebration(ymd, country);
  const moveable = cel?.key ? ROMCAL_KEY_CARDS.get(cel.key)?.[0] : undefined;
  if (moveable) return { card: moveable, matches: true };

  const sundayKey = dayOfWeek(ymd) === 0 ? sheetKeyFor(ymd, country) : null;
  const sundayCards = sundayKey ? cardsForSheetKey(sundayKey) : [];
  const sundayCard = sundayCards[0];
  const sundayMatches = (c: PictureCard) => c.cat === "Feast" || c.cat === "Liturgical Year";
  if (sundayCard && (cel?.type === "SOLEMNITY" || cel?.type === "FEAST")) {
    return { card: sundayCard, matches: sundayMatches(sundayCard) };
  }

  const md = ymd.slice(5);
  const dated = PICTURE_CARDS.filter((c) => cardMonthDay(c, country) === md).sort(byPrefix);
  if (dated.length) {
    const named = dated.find((c) => namesCelebration(c, cel));
    return named ? { card: named, matches: true } : { card: dated[0]!, matches: false };
  }

  if (sundayCard) return { card: sundayCard, matches: sundayMatches(sundayCard) };
  return null;
}

/** Public page for a card, or null. Feast cards have none except the two mapped below. */
export function cardDetailUrl(card: Pick<PictureCard, "id">): string | null {
  const saint = SAINT_SLUG.get(card.id);
  if (saint) return `${SAINTS_HUB}/${saint}`;
  if (GUADALUPE_CARD_IDS.has(card.id)) {
    const juan = SAINT_SLUG.get(JUAN_DIEGO_CARD_ID);
    return juan ? `${SAINTS_HUB}/${juan}` : null;
  }
  if (IMMACULATE_CARD_IDS.has(card.id)) {
    try {
      return getSundaySheet(IMMACULATE_SHEET_KEY) ? sundayMassWorksheetPath(IMMACULATE_SHEET_KEY) : "/liturgy/advent";
    } catch {
      return "/liturgy/advent";
    }
  }
  return null;
}

function toHomeCard(card: PictureCard, date: string, daysAway: number, matches: boolean): HomeTodayCard {
  const detailUrl = cardDetailUrl(card);
  return {
    id: card.id,
    title: card.title,
    shortTitle: cardShortTitle(card),
    thumb: cardThumbSrc(card.id),
    date,
    daysAway,
    relation: daysAway === 0 ? "today" : "upcoming",
    matchesCelebration: daysAway === 0 && matches,
    detailUrl,
    href: detailUrl ?? cardSharePath(card.id),
  };
}

function seasonOf(ymd: string): HomeToday["season"] {
  const at = new Date(`${ymd}T00:00:00Z`);
  const info = getLiturgicalSeason(at);
  const href = currentSeasonHref(at);
  const raw = href.replace(/^\/liturgy\//, "");
  const slug: LiturgyTopic = isLiturgyTopic(raw) ? raw : "ordinary-time";
  return { name: info.name, color: info.color, slug, label: LITURGY_TOPIC_LABELS[slug], href: `/liturgy/${slug}` };
}

function bannerFor(ymd: string, country: RomcalCountry, season: HomeToday["season"]): HomeTodayBanner {
  for (let i = 0; i <= BANNER_LOOKAHEAD_DAYS; i++) {
    const day = addDays(ymd, i);
    const hit = cardForDay(day, country);
    if (!hit) continue;
    const card = toHomeCard(hit.card, day, i, hit.matches);
    return { label: card.matchesCelebration ? "Read Card →" : `${card.shortTitle} Card →`, href: card.href, card };
  }
  return { label: `${season.label} →`, href: season.href, card: null };
}

function sundayFor(ymd: string, country: RomcalCountry): HomeTodaySunday | null {
  const date = addDays(ymd, (7 - dayOfWeek(ymd)) % 7);
  const key = sheetKeyFor(date, country);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) return null;
  try {
    return {
      key,
      slug: keyToSlug(key),
      date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-CA", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      title: sheet.levels.level1.title || sheet.liturgicalName,
      liturgicalName: sheet.liturgicalName,
      gospelRef: sheet.gospelRef,
      worksheetUrl: sundayMassWorksheetPath(key),
      print: { level1: resourcePrintPath(key, 1), level2: resourcePrintPath(key, 2) },
    };
  } catch {
    return null;
  }
}

/** First Level 1 word of 3–7 plain letters ("say no", "40", "children of God" are skipped). */
export function kidMissionWord(words: readonly string[] | null | undefined): HomeToday["kidMission"] {
  const word = (words ?? []).map((w) => (typeof w === "string" ? w.trim() : "")).find((w) => KID_MISSION_WORD_RE.test(w));
  return word ? { word: word.toUpperCase(), source: "sheet" } : { word: KID_MISSION_FALLBACK, source: "fallback" };
}

function highlightsFor(ymd: string, country: RomcalCountry, season: HomeToday["season"], skipId: string | null): HomeHighlight[] {
  const seasonItem: HomeHighlight = { kind: "season", title: season.label, href: season.href };
  const auto: HomeHighlight[] = [];
  const seen = new Set(skipId ? [skipId] : []);
  for (let i = 1; i <= HIGHLIGHT_LOOKAHEAD_DAYS && auto.length < 2; i++) {
    const day = addDays(ymd, i);
    const hit = cardForDay(day, country);
    if (!hit || seen.has(hit.card.id)) continue;
    seen.add(hit.card.id);
    const card = toHomeCard(hit.card, day, i, false);
    auto.push({ kind: "card", title: card.title, href: card.href, cardId: card.id, date: day, thumb: card.thumb });
  }
  const curated: HomeHighlight[] = (SEASON_HIGHLIGHTS[season.slug] ?? [])
    .filter((l) => typeof l?.title === "string" && l.title.trim() && typeof l.href === "string" && /^\/(?!\/)/.test(l.href))
    .slice(0, 2)
    .map((l) => ({ kind: "curated", title: l.title.trim(), href: l.href }));
  const fill = (list: HomeHighlight[]) => [...list, seasonItem, seasonItem].slice(0, 2);
  return [...fill(auto), ...fill(curated)];
}

/**
 * Everything the home dashboard needs for one day, for one calendar country
 * (`canada`, `unitedStates`; anything else uses the General Roman Calendar).
 * `date` is YYYY-MM-DD, or a Date read in America/Toronto; default: today in Toronto.
 */
export function getHomeToday(date?: string | Date, country: RomcalCountry = "general"): HomeToday {
  const ymd = resolveDate(date);
  const c = enabledOrFallback(country);
  let season: HomeToday["season"];
  try {
    season = seasonOf(ymd);
  } catch {
    season = { name: "Ordinary Time", color: "green", slug: "ordinary-time", label: LITURGY_TOPIC_LABELS["ordinary-time"], href: "/liturgy/ordinary-time" };
  }

  const cel = getRomcalCelebration(ymd, c);
  const celebration = cel
    ? { key: cel.key, type: cel.type, name: cel.name, names: cel.names, colorKey: cel.colorKey, isFeria: cel.type === "FERIA" }
    : null;

  let banner: HomeTodayBanner;
  try {
    banner = bannerFor(ymd, c, season);
  } catch {
    banner = { label: `${season.label} →`, href: season.href, card: null };
  }

  let sunday: HomeTodaySunday | null = null;
  try {
    sunday = sundayFor(ymd, c);
  } catch {
    sunday = null;
  }
  const words = sunday ? getSundaySheet(sunday.key)?.levels.level1.words : undefined;

  let highlights: HomeHighlight[];
  try {
    highlights = highlightsFor(ymd, c, season, banner.card?.id ?? null);
  } catch {
    const s: HomeHighlight = { kind: "season", title: season.label, href: season.href };
    highlights = [s, s, s, s];
  }

  return { date: ymd, country: c, season, celebration, banner, sunday, kidMission: kidMissionWord(words), highlights };
}
