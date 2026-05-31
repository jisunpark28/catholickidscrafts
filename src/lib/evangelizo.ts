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

export function rankFromTitle(title: string): MassDaySummary["rank"] {
  const t = title.toLowerCase();
  if (t.includes("solemnity")) return "solemnity";
  if (t.includes("feast")) return "feast";
  if (t.includes("memorial")) return "memorial";
  if (t.includes("sunday")) return "sunday";
  return "ferial";
}

export async function fetchLiturgicalTitle(date: Date): Promise<string> {
  const raw = await fetchEvangelizo({
    date: toEvangelizoDate(date),
    type: "liturgic_t",
    lang: "AM",
  });
  return stripHtml(raw);
}

async function fetchOptionalField(
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

async function fetchReading(
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

export async function fetchMassDaySummary(date: Date): Promise<MassDaySummary> {
  if (!isWithinEvangelizoWindow(date)) {
    const key = toDateKey(date);
    return {
      date: key,
      liturgicalTitle: "Readings unavailable (outside feed window)",
      rank: "ferial",
    };
  }

  const liturgicalTitle = await fetchLiturgicalTitle(date);
  return {
    date: toDateKey(date),
    liturgicalTitle,
    rank: rankFromTitle(liturgicalTitle),
  };
}

export async function fetchMonthCalendar(
  year: number,
  month: number,
): Promise<MonthCalendar> {
  const days = daysInMonth(year, month);
  const midMonth = new Date(Date.UTC(year, month - 1, 15));
  const season = getLiturgicalSeason(midMonth);

  const summaries = await Promise.all(
    days.map((day) => fetchMassDaySummary(day)),
  );

  return {
    year,
    month,
    season,
    days: summaries,
    source: MASS_DATA_SOURCE,
  };
}
