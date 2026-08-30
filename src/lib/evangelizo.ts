import {
  daysInMonth,
  isWithinEvangelizoWindow,
  toDateKey,
  toEvangelizoDate,
} from "@/lib/dates";
import type {
  MassDay,
  MassDaySummary,
  MassReading,
  MonthCalendar,
  ReadingKind,
} from "@/types/mass";
import { getLiturgicalSeason } from "@/lib/liturgical-season";
import { rankFromTitle } from "@/lib/liturgical-calendar";
import { getRomcalDaySummary, preloadRomcalYear } from "@/lib/romcal-liturgical";
import { fetchUsccbReadingsForDate, loadUsccbLiturgicalTitleIndex } from "@/lib/usccb-rss";

const EVANGELIZO_BASE = "http://feed.evangelizo.org/v2/reader.php";
export const MASS_DATA_SOURCE =
  "Evangelizo.org Reader API (English, Roman calendar — lang=AM)";

type ContentCode = "FR" | "PS" | "SR" | "GSP";

const READING_META: Record<
  ContentCode,
  { kind: ReadingKind; label: string }
> = {
  FR: { kind: "first_reading", label: "First Reading" },
  PS: { kind: "psalm", label: "Responsorial Psalm" },
  SR: { kind: "second_reading", label: "Second Reading" },
  GSP: { kind: "gospel", label: "Gospel" },
};

export { rankFromTitle } from "@/lib/liturgical-calendar";

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#171;/g, "")
    .replace(/&#187;/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Copyright ©[\s\S]*$/i, "")
    .trim();
}

async function fetchEvangelizo(params: Record<string, string>): Promise<string> {
  const url = new URL(EVANGELIZO_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: { Accept: "text/html, */*" },
    signal: AbortSignal.timeout(15_000),
  });

  const text = await response.text();
  if (
    text.includes("wrong param") ||
    text.includes("<h3>NAME</h3>") ||
    text.includes("Error :")
  ) {
    throw new Error(`Evangelizo API error for ${url.searchParams.get("date")}`);
  }

  return text;
}

export async function fetchLiturgicalTitle(date: Date): Promise<string> {
  const raw = await fetchEvangelizo({
    date: toEvangelizoDate(date),
    type: "liturgic_t",
    lang: "AM",
  });
  return stripHtml(raw);
}

export async function fetchOptionalField(
  date: Date,
  type: "saint" | "feast",
): Promise<string | undefined> {
  try {
    const raw = await fetchEvangelizo({
      date: toEvangelizoDate(date),
      type,
      lang: "AM",
    });
    const text = stripHtml(raw);
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchReading(
  date: Date,
  content: ContentCode,
): Promise<MassReading | null> {
  const meta = READING_META[content];
  try {
    const [titleRaw, textRaw] = await Promise.all([
      fetchEvangelizo({
        date: toEvangelizoDate(date),
        type: "reading_lt",
        lang: "AM",
        content,
      }),
      fetchEvangelizo({
        date: toEvangelizoDate(date),
        type: "reading",
        lang: "AM",
        content,
      }),
    ]);

    const title = stripHtml(titleRaw);
    const text = stripHtml(textRaw);
    if (!text) return null;

    return {
      kind: meta.kind,
      label: meta.label,
      title,
      text,
    };
  } catch {
    return null;
  }
}

export async function fetchMassDay(date: Date): Promise<MassDay> {
  if (!isWithinEvangelizoWindow(date)) {
    throw new Error(
      "Date is outside the Evangelizo feed window (about 30 days from today).",
    );
  }

  const liturgicalTitle = await fetchLiturgicalTitle(date);
  const [saint, feast, fr, ps, sr, gsp] = await Promise.all([
    fetchOptionalField(date, "saint"),
    fetchOptionalField(date, "feast"),
    fetchReading(date, "FR"),
    fetchReading(date, "PS"),
    fetchReading(date, "SR"),
    fetchReading(date, "GSP"),
  ]);

  const readings = [fr, ps, sr, gsp].filter((r): r is MassReading => r !== null);

  return {
    date: toDateKey(date),
    liturgicalTitle,
    rank: rankFromTitle(liturgicalTitle),
    saint,
    feast,
    readings,
    source: MASS_DATA_SOURCE,
  };
}

export async function fetchMassDaySummary(
  date: Date,
  usccbTitlesByDate?: Map<string, string>,
): Promise<MassDaySummary> {
  return resolveMassDaySummary(date, usccbTitlesByDate);
}

/** Like {@link fetchMassDaySummary} plus General Roman Calendar saint/feast (for today banner). */
export async function fetchMassDaySummaryWithCalendar(
  date: Date,
  usccbTitlesByDate?: Map<string, string>,
): Promise<MassDaySummary> {
  const summary = await resolveMassDaySummary(date, usccbTitlesByDate);

  if (!summary.liturgicalTitle || !isWithinEvangelizoWindow(date)) {
    return summary;
  }

  const [saint, feast] = await Promise.all([
    fetchOptionalField(date, "saint"),
    fetchOptionalField(date, "feast"),
  ]);
  return {
    ...summary,
    saint,
    feast,
  };
}

async function resolveMassDaySummary(
  date: Date,
  usccbTitlesByDate?: Map<string, string>,
): Promise<MassDaySummary> {
  const key = toDateKey(date);

  if (isWithinEvangelizoWindow(date)) {
    try {
      const liturgicalTitle = await fetchLiturgicalTitle(date);
      return {
        date: key,
        liturgicalTitle,
        rank: rankFromTitle(liturgicalTitle),
      };
    } catch {
      /* fall through to USCCB / Romcal */
    }
  }

  const fromIndex = usccbTitlesByDate?.get(key);
  if (fromIndex) {
    return {
      date: key,
      liturgicalTitle: fromIndex,
      rank: rankFromTitle(fromIndex),
    };
  }

  const usccb = await fetchUsccbReadingsForDate(date).catch(() => null);
  if (usccb?.liturgicalTitle) {
    return {
      date: key,
      liturgicalTitle: usccb.liturgicalTitle,
      rank: rankFromTitle(usccb.liturgicalTitle),
    };
  }

  const romcal = getRomcalDaySummary(date);
  if (romcal) return romcal;

  return { date: key, liturgicalTitle: "", rank: "ferial" };
}

export async function fetchMonthCalendar(
  year: number,
  month: number,
): Promise<MonthCalendar> {
  const days = daysInMonth(year, month);
  const midMonth = new Date(Date.UTC(year, month - 1, 15));
  const season = getLiturgicalSeason(midMonth);
  preloadRomcalYear(year);
  const usccbTitles = await loadUsccbLiturgicalTitleIndex();

  const summaries = await Promise.all(
    days.map((day) => fetchMassDaySummary(day, usccbTitles)),
  );

  return {
    year,
    month,
    season,
    days: summaries,
    source: MASS_DATA_SOURCE,
  };
}
