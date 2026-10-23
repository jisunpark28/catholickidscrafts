import romcal from "romcal";
// Server-only: romcal uses `new Function()` (blocked by our CSP in the browser).
// Never import this module from a Client Component.
import { COUNTRY_CONFIG, enabledOrFallback, type RomcalCountry } from "./countries";
import { type Cycle, SHARED_KEYS } from "./keys";

type RomcalEntry = {
  moment: string;
  key: string;
  type: string;
  data?: { meta?: { cycle?: { value?: string } } };
};

type CalendarOptions = {
  year: number;
  locale: string;
  country?: string;
  ascensionOnSunday?: boolean;
};

const calendarFor = romcal.calendarFor as unknown as (o: CalendarOptions) => RomcalEntry[];

/** romcal celebration key (lower-cased) -> cycle-independent sheet key. */
const SOLEMNITY_KEYS: Record<string, string> = {
  presentationofthelord: "SOL_PRESENTATION",
  birthofjohnthebaptist: "SOL_JOHNBAPTIST",
  peterandpaulapostles: "SOL_PETERPAUL",
  transfiguration: "SOL_TRANSFIGURATION",
  assumption: "SOL_ASSUMPTION",
  theexaltationoftheholycross: "SOL_HOLYCROSS",
  allsaints: "SOL_ALLSAINTS",
  allsouls: "SOL_ALLSOULS",
  dedicationofthelateranbasilica: "SOL_LATERAN",
  // Never on an Advent Sunday (romcal moves it to Monday); kept for safety.
  immaculateconception: "SOL_IMMACULATE",
};

/** romcal celebration key (lower-cased) -> cycle-dependent Sunday key. */
const NAMED_KEYS: Record<string, string> = {
  christmas: "CHRISTMAS",
  holyfamily: "HOLYFAMILY",
  marymotherofgod: "MARYMOTHER",
  epiphany: "EPIPHANY",
  baptismofthelord: "BAPTISM",
  palmsunday: "PALM",
  easter: "EASTER",
  divinemercysunday: "EAS02",
  ascension: "ASCENSION",
  pentecostsunday: "PENTECOST",
  trinitysunday: "TRINITY",
  corpuschristi: "CORPUSCHRISTI",
  christtheking: "OT34",
};

const SEASON_ABBR: Record<string, string> = {
  advent: "ADV",
  lent: "LNT",
  easter: "EAS",
  ordinarytime: "OT",
};

// romcal casing is inconsistent ("11ThSundayOfOrdinaryTime").
const SEASON_SUNDAY = /^(\d+)(?:st|nd|rd|th)sundayof(advent|lent|easter|ordinarytime)$/i;

const DAY = 86_400_000;

function utcDate(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d);
}

/** Accepts Date (its UTC calendar day) or "YYYY-MM-DD". Returns UTC midnight ms. */
function toUtcDay(date: Date | string): number {
  if (typeof date === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) throw new Error(`Invalid date "${date}" (expected YYYY-MM-DD)`);
    return utcDate(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return utcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Anonymous Gregorian computus. */
function easterSunday(year: number): number {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

/** 1st Sunday of Advent: the Sunday between Nov 27 and Dec 3. */
function firstAdventSunday(year: number): number {
  const dec3 = utcDate(year, 12, 3);
  return dec3 - new Date(dec3).getUTCDay() * DAY;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The Sunday's own key from date arithmetic alone (no saints/feasts), for
 * countries that keep Epiphany and Ascension on Sunday. Used when romcal puts a
 * celebration we have no sheet for on a Sunday.
 */
export function regularSundayKey(date: Date | string): string {
  const t = toUtcDay(date);
  const d = new Date(t);
  if (d.getUTCDay() !== 0) throw new Error(`${isoDay(t)} is not a Sunday`);
  const y = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const dom = d.getUTCDate();

  const adv1 = firstAdventSunday(y);
  if (t >= adv1) {
    if (month === 12 && dom === 25) return "CHRISTMAS";
    if (month === 12 && dom > 25) return "HOLYFAMILY";
    return `ADV${pad((t - adv1) / (7 * DAY) + 1)}`;
  }
  if (month === 1 && dom === 1) return "MARYMOTHER";
  if (month === 1 && dom <= 8) return "EPIPHANY";

  // Epiphany = Sunday Jan 2-8. If it is Jan 7/8, Baptism is the Monday after and
  // the next Sunday is OT2; otherwise Baptism is the next Sunday.
  const jan8 = utcDate(y, 1, 8);
  const epiphany = jan8 - new Date(jan8).getUTCDay() * DAY;
  const epiphanyDom = new Date(epiphany).getUTCDate();
  const baptismSunday = epiphanyDom <= 6 ? epiphany + 7 * DAY : null;
  if (baptismSunday !== null && t === baptismSunday) return "BAPTISM";
  const ot2 = (baptismSunday ?? epiphany) + 7 * DAY;

  const easter = easterSunday(y);
  const lent1 = easter - 42 * DAY;
  if (t < lent1) return `OT${pad((t - ot2) / (7 * DAY) + 2)}`;
  if (t < easter - 7 * DAY) return `LNT${pad((t - lent1) / (7 * DAY) + 1)}`;
  if (t === easter - 7 * DAY) return "PALM";
  const weeksAfterEaster = (t - easter) / (7 * DAY);
  if (weeksAfterEaster === 0) return "EASTER";
  if (weeksAfterEaster <= 5) return `EAS${pad(weeksAfterEaster + 1)}`;
  if (weeksAfterEaster === 6) return "ASCENSION"; // transferred to the 7th Sunday
  if (weeksAfterEaster === 7) return "PENTECOST";
  if (weeksAfterEaster === 8) return "TRINITY";
  if (weeksAfterEaster === 9) return "CORPUSCHRISTI";
  // Later Ordinary Time counts back from Christ the King (OT34).
  return `OT${pad(34 - (adv1 - 7 * DAY - t) / (7 * DAY))}`;
}

const calendarCache = new Map<string, Map<string, RomcalEntry>>();

/** First (winning) romcal entry per day for a civil year. */
function dayIndex(country: RomcalCountry, year: number): Map<string, RomcalEntry> {
  const cacheKey = `${country}:${year}`;
  let index = calendarCache.get(cacheKey);
  if (!index) {
    const cfg = COUNTRY_CONFIG[country];
    const entries = calendarFor({
      year,
      locale: "en",
      ...(cfg.romcal === "general" ? {} : { country: cfg.romcal }),
      ascensionOnSunday: cfg.ascensionOnSunday,
    });
    index = new Map();
    for (const e of entries) {
      const day = isoDay(new Date(e.moment).getTime());
      if (!index.has(day)) index.set(day, e);
    }
    calendarCache.set(cacheKey, index);
  }
  return index;
}

function cycleOf(entry: RomcalEntry): Cycle {
  const m = /Year ([ABC])/.exec(entry.data?.meta?.cycle?.value ?? "");
  if (!m) throw new Error(`romcal entry ${entry.key} has no cycle`);
  return m[1] as Cycle;
}

/** Cycle-dependent key for a romcal key, or null if we have no sheet for it. */
function sundayKeyFor(romcalKey: string): string | null {
  const m = SEASON_SUNDAY.exec(romcalKey);
  if (m) return `${SEASON_ABBR[m[2].toLowerCase()]}${pad(Number(m[1]))}`;
  return NAMED_KEYS[romcalKey.toLowerCase()] ?? null;
}

export type SheetKeyDetail = {
  key: string;
  date: string;
  country: RomcalCountry;
  romcalKey: string;
  /** How the key was chosen. */
  source: "solemnity" | "sunday" | "fallback" | "override";
};

/**
 * Sheet key for a Sunday. Precedence:
 * 1. All Souls (Nov 2) on a Sunday -> SOL_ALLSOULS (romcal 1.3.0 misses it).
 * 2. romcal winner is one of our solemnities/feasts -> SOL_ key.
 * 3. romcal winner is a season Sunday or named day -> {cycle}_{key}.
 * 4. Anything else (St Joseph, St Patrick, ...) -> the Sunday's regular key.
 */
export function sheetKeyDetail(date: Date | string, country: RomcalCountry): SheetKeyDetail {
  const resolved = enabledOrFallback(country);
  const t = toUtcDay(date);
  const day = isoDay(t);
  if (new Date(t).getUTCDay() !== 0) throw new Error(`${day} is not a Sunday`);
  const entry = dayIndex(resolved, new Date(t).getUTCFullYear()).get(day);
  if (!entry) throw new Error(`romcal has no entry for ${day}`);
  const base = { date: day, country: resolved, romcalKey: entry.key };

  if (day.endsWith("-11-02")) return { ...base, key: "SOL_ALLSOULS", source: "override" };

  const sol = SOLEMNITY_KEYS[entry.key.toLowerCase()];
  // Immaculate Conception never replaces an Advent Sunday.
  if (sol && sol !== "SOL_IMMACULATE" && SHARED_KEYS.includes(sol)) {
    return { ...base, key: sol, source: "solemnity" };
  }

  const cycle = cycleOf(entry);
  const own = sol ? null : sundayKeyFor(entry.key);
  if (own) return { ...base, key: `${cycle}_${own}`, source: "sunday" };
  return { ...base, key: `${cycle}_${regularSundayKey(day)}`, source: "fallback" };
}

export function toSheetKey(date: Date | string, country: RomcalCountry): string {
  return sheetKeyDetail(date, country).key;
}

/** Key for the next Sunday on or after `today` (today itself if it is Sunday). */
export function nextSundayKey(today: Date | string, country: RomcalCountry): string {
  const t = toUtcDay(today);
  const sunday = t + ((7 - new Date(t).getUTCDay()) % 7) * DAY;
  return toSheetKey(isoDay(sunday), country);
}
