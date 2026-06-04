import { toDateKey } from "@/lib/dates";
import type { MassReading, ReadingKind } from "@/types/mass";

const UNIVERSALIS_ORIGIN = "https://universalis.com";

export const UNIVERSALIS_READINGS_SOURCE = "Universalis (universalis.com)";

/** Calendar path segment, e.g. `Europe.England` for ICEL / ESV-CE on Universalis. */
export function universalisCalendarPath(): string {
  const fromEnv = process.env.UNIVERSALIS_CALENDAR_PATH?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "Europe.England";
}

export function universalisMassPageUrl(calendarPath = universalisCalendarPath()): string {
  return `${UNIVERSALIS_ORIGIN}/${calendarPath}/mass.htm`;
}

export function universalisJsonpUrl(calendarPath = universalisCalendarPath()): string {
  return `${UNIVERSALIS_ORIGIN}/${calendarPath}/jsonpmass.js`;
}

type UniversalisReadingBlock = {
  heading?: string;
  source?: string;
  text?: string;
};

type UniversalisMassPayload = {
  number: number;
  date?: string;
  day?: string;
  Mass_R1?: UniversalisReadingBlock;
  Mass_Ps?: UniversalisReadingBlock;
  Mass_R2?: UniversalisReadingBlock;
  Mass_G?: UniversalisReadingBlock;
  copyright?: { text?: string };
};

export type UniversalisMassDay = {
  date: string;
  liturgicalTitle: string;
  readings: MassReading[];
  source: string;
  pageUrl: string;
  /** Plain-text copyright notice — must stay visible when showing reading text (Universalis terms). */
  copyrightNotice: string;
};

const READING_BLOCKS: {
  key: keyof Pick<
    UniversalisMassPayload,
    "Mass_R1" | "Mass_Ps" | "Mass_R2" | "Mass_G"
  >;
  kind: ReadingKind;
  label: string;
}[] = [
  { key: "Mass_R1", kind: "first_reading", label: "First Reading" },
  { key: "Mass_Ps", kind: "psalm", label: "Responsorial Psalm" },
  { key: "Mass_R2", kind: "second_reading", label: "Second Reading" },
  { key: "Mass_G", kind: "gospel", label: "Gospel" },
];

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x2019;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#x2018;/g, "'")
    .replace(/&#x2010;/g, "-")
    .replace(/&#xa0;/g, " ")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function htmlFragmentToPlainText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function numberToDateKey(number: number): string | null {
  const s = String(number);
  if (!/^\d{8}$/.test(s)) return null;
  const y = s.slice(0, 4);
  const m = s.slice(4, 6);
  const d = s.slice(6, 8);
  const key = `${y}-${m}-${d}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
}

function parseUniversalisJsonp(body: string): UniversalisMassPayload {
  const trimmed = body.trim();
  const match = trimmed.match(/^universalisCallback\s*\(\s*([\s\S]*)\s*\)\s*;?\s*$/);
  if (!match) {
    throw new Error("Universalis response was not valid JSONP.");
  }
  try {
    return JSON.parse(match[1]!) as UniversalisMassPayload;
  } catch {
    throw new Error("Universalis JSONP payload could not be parsed.");
  }
}

function blockToReading(
  block: UniversalisReadingBlock,
  kind: ReadingKind,
  label: string,
  pageUrl: string,
): MassReading | null {
  const text = block.text ? htmlFragmentToPlainText(block.text) : "";
  if (!text) return null;

  const sourceLine = block.source
    ? htmlFragmentToPlainText(block.source)
    : "";
  const heading = block.heading
    ? htmlFragmentToPlainText(block.heading)
    : "";
  const title = sourceLine || heading || label;

  return {
    kind,
    label,
    title,
    text,
    externalUrl: pageUrl,
  };
}

export async function fetchUniversalisMassDay(
  date: Date,
): Promise<UniversalisMassDay> {
  const calendarPath = universalisCalendarPath();
  const pageUrl = universalisMassPageUrl(calendarPath);
  const url = universalisJsonpUrl(calendarPath);

  const response = await fetch(url, {
    next: { revalidate: 3600 },
    headers: {
      Accept: "*/*",
      "User-Agent":
        "CatholicKidsCrafts/1.0 (typing practice; +https://www.catholickidscrafts.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Universalis HTTP ${response.status}`);
  }

  const body = await response.text();
  const payload = parseUniversalisJsonp(body);
  const dateKey = numberToDateKey(payload.number);

  if (!dateKey) {
    throw new Error("Universalis returned an invalid date.");
  }

  const requestedKey = toDateKey(date);
  if (dateKey !== requestedKey) {
    throw new Error(
      `Universalis returned readings for ${dateKey}, not ${requestedKey}.`,
    );
  }

  const liturgicalTitle = payload.day
    ? htmlFragmentToPlainText(payload.day)
    : payload.date?.trim() ?? dateKey;

  const readings: MassReading[] = [];
  for (const { key, kind, label } of READING_BLOCKS) {
    const block = payload[key];
    if (!block) continue;
    const reading = blockToReading(block, kind, label, pageUrl);
    if (reading) readings.push(reading);
  }

  if (readings.length === 0) {
    throw new Error("Universalis returned no Mass readings for today.");
  }

  const copyrightNotice = payload.copyright?.text
    ? htmlFragmentToPlainText(payload.copyright.text)
    : "Copyright © Universalis Publishing Limited. See https://universalis.com.";

  return {
    date: dateKey,
    liturgicalTitle,
    readings,
    source: UNIVERSALIS_READINGS_SOURCE,
    pageUrl,
    copyrightNotice,
  };
}
