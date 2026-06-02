import { toDateKey } from "@/lib/dates";
import type { MassReading, ReadingKind } from "@/types/mass";

const USCCB_RSS_URL = "https://bible.usccb.org/readings.rss";

export const USCCB_COPYRIGHT_NOTICE =
  "Lectionary for Mass for Use in the Dioceses of the United States, second typical edition, Copyright © 2001, 1998, 1997, 1986, 1970 Confraternity of Christian Doctrine; Psalm refrain © 1968, 1981, 1997, International Committee on English in the Liturgy, Inc. All rights reserved.";

export const MASS_READINGS_PRIMARY_SOURCE =
  "USCCB Daily Readings RSS (bible.usccb.org)";

export function usccbReadingsPageUrl(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `https://bible.usccb.org/bible/readings/${mm}${dd}${yy}.cfm`;
}

/** Parse MMDDYY from USCCB reading URLs (ignores memorial suffix paths). */
export function dateKeyFromUsccbGuid(guid: string): string | null {
  const match = guid.match(/\/readings\/(\d{2})(\d{2})(\d{2})(?:[^/]*)?\.cfm/i);
  if (!match) return null;
  const [, mm, dd, yy] = match;
  const year = 2000 + Number(yy);
  const month = Number(mm);
  const day = Number(dd);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return toDateKey(date);
}

function decodeRssEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function htmlToPlainText(html: string): string {
  return decodeRssEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/Copyright ©[\s\S]*$/i, "")
    .replace(/Lectionary for Mass[\s\S]*$/i, "")
    .trim();
}

type SectionKind = ReadingKind | "alleluia" | "unknown";

function sectionKindFromHeading(heading: string): SectionKind {
  const h = heading.toLowerCase();
  if (h.includes("reading 2") || h.includes("reading ii")) return "second_reading";
  if (h.includes("reading 1") || h.includes("reading i")) return "first_reading";
  if (h.includes("responsorial")) return "psalm";
  if (h.includes("gospel")) return "gospel";
  if (h.includes("alleluia")) return "alleluia";
  return "unknown";
}

const SECTION_LABELS: Record<ReadingKind, string> = {
  first_reading: "First Reading",
  psalm: "Responsorial Psalm",
  second_reading: "Second Reading",
  gospel: "Gospel",
};

function parseReadingsFromDescription(html: string): MassReading[] {
  const decoded = decodeRssEntities(html);
  const readings: MassReading[] = [];
  const sectionRe =
    /<h4[^>]*>\s*([^<]*?)\s*(?:<a[^>]*>([^<]*)<\/a>)?[^<]*<\/h4>\s*<div[^>]*class="poetry"[^>]*>([\s\S]*?)<\/div>/gi;

  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(decoded)) !== null) {
    const heading = (match[1] ?? "").trim();
    const citation = (match[2] ?? "").trim();
    const bodyHtml = match[3] ?? "";
    const kind = sectionKindFromHeading(heading);
    if (kind === "alleluia" || kind === "unknown") continue;

    const text = htmlToPlainText(bodyHtml);
    if (!text) continue;

    readings.push({
      kind,
      label: SECTION_LABELS[kind],
      title: citation,
      text,
    });
  }

  return readings;
}

type RssDay = {
  dateKey: string;
  liturgicalTitle: string;
  readings: MassReading[];
  pageUrl: string;
};

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  return m?.[1]?.trim() ?? "";
}

function parseRssItems(xml: string): RssDay[] {
  const items: RssDay[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1] ?? "";
    const title = htmlToPlainText(extractTag(block, "title"));
    const description = extractTag(block, "description");
    const guid =
      extractTag(block, "guid") ||
      extractTag(block, "link") ||
      "";
    const link = extractTag(block, "link");
    const dateKey = dateKeyFromUsccbGuid(guid || link);
    if (!dateKey || !description || description.includes("<!DOCTYPE html>")) continue;

    const readings = parseReadingsFromDescription(description);
    if (readings.length === 0) continue;

    items.push({
      dateKey,
      liturgicalTitle: title,
      readings,
      pageUrl: link || usccbReadingsPageUrl(new Date(`${dateKey}T12:00:00Z`)),
    });
  }
  return items;
}

let rssCache: { fetchedAt: number; byDate: Map<string, RssDay> } | null = null;
const RSS_CACHE_MS = 60 * 60 * 1000;

async function loadRssIndex(): Promise<Map<string, RssDay>> {
  const now = Date.now();
  if (rssCache && now - rssCache.fetchedAt < RSS_CACHE_MS) {
    return rssCache.byDate;
  }

  const response = await fetch(USCCB_RSS_URL, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
  });

  if (!response.ok) {
    throw new Error(`USCCB RSS HTTP ${response.status}`);
  }

  const xml = await response.text();
  const items = parseRssItems(xml);
  const byDate = new Map(items.map((day) => [day.dateKey, day]));
  rssCache = { fetchedAt: now, byDate };
  return byDate;
}

export async function fetchUsccbReadingsForDate(
  date: Date,
): Promise<RssDay | null> {
  const index = await loadRssIndex();
  return index.get(toDateKey(date)) ?? null;
}
