import type { MassReading, ReadingKind } from "@/types/mass";

export const UNIVERSALIS_ORIGIN = "https://universalis.com";
export const UNIVERSALIS_READINGS_SOURCE = "Universalis (universalis.com)";

export type UniversalisReadingBlock = {
  heading?: string;
  source?: string;
  text?: string;
};

export type UniversalisMassPayload = {
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

function codePointToTypingChar(code: number): string {
  if (code === 0xa0) return " ";
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  return String.fromCodePoint(code);
}

function decodeHtmlEntities(text: string): string {
  let out = text.replace(/&#(\d+);/g, (_, digits: string) => {
    const code = Number.parseInt(digits, 10);
    const ch = codePointToTypingChar(code);
    return ch || `&#${digits};`;
  });
  out = out.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex: string) => {
    const code = Number.parseInt(hex, 16);
    const ch = codePointToTypingChar(code);
    return ch || `&#x${hex};`;
  });
  return out
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
    .replace(/\u00AD/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function htmlFragmentToPlainText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00A0/g, " ")
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

export function parseUniversalisJsonpBody(body: string): UniversalisMassPayload {
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

export function massDayFromUniversalisPayload(
  payload: UniversalisMassPayload,
  calendarPath: string,
): UniversalisMassDay {
  const pageUrl = `${UNIVERSALIS_ORIGIN}/${calendarPath}/mass.htm`;
  const dateKey = numberToDateKey(payload.number);

  if (!dateKey) {
    throw new Error("Universalis returned an invalid date.");
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
