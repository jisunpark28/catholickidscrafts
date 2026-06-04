import { parseDateParam, toDateKey } from "@/lib/dates";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import type { MassReading, ReadingKind } from "@/types/mass";

const LWC_ORIGIN = "https://readings.livingwithchrist.ca";

export const LWC_READINGS_SOURCE =
  "Living with Christ (readings.livingwithchrist.ca)";

type LwcTextType = "reading" | "reading2" | "psalm" | "gospel";

const LWC_TYPE_META: Record<
  LwcTextType,
  { kind: ReadingKind; label: string }
> = {
  reading: { kind: "first_reading", label: "First Reading" },
  reading2: { kind: "second_reading", label: "Second Reading" },
  psalm: { kind: "psalm", label: "Responsorial Psalm" },
  gospel: { kind: "gospel", label: "Gospel" },
};

export type LwcMassDay = {
  date: string;
  liturgicalTitle: string;
  readings: MassReading[];
  source: string;
  pageUrl: string;
};

function lwcPageUrl(dateKey: string, type: LwcTextType): string {
  return `${LWC_ORIGIN}/daily-texts/${type}/${dateKey}`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
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

async function fetchLwcHtml(path: string): Promise<string> {
  const response = await fetch(`${LWC_ORIGIN}${path}`, {
    next: { revalidate: 3600 },
    headers: {
      Accept: "text/html",
      "User-Agent": "CatholicKidsCrafts/1.0 (typing practice; +https://www.catholickidscrafts.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Living with Christ HTTP ${response.status} for ${path}`);
  }
  return response.text();
}

function listTextTypesFromHubHtml(html: string, dateKey: string): LwcTextType[] {
  const types = new Set<LwcTextType>();

  const sideNav = html.match(
    /texts-categories-side-bloc[\s\S]*?<ul>([\s\S]*?)<\/ul>/i,
  );
  const block = sideNav?.[1] ?? html;
  const linkRe =
    /\/daily-texts\/(reading2?|psalm|gospel)\/(\d{4}-\d{2}-\d{2})/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(block)) !== null) {
    const t = match[1] as LwcTextType;
    if (match[2] === dateKey && t in LWC_TYPE_META) {
      types.add(t);
    }
  }

  if (types.size === 0) {
    types.add("reading");
    if (block.includes("/daily-texts/psalm/")) types.add("psalm");
    if (block.includes("/daily-texts/gospel/")) types.add("gospel");
  }

  const order: LwcTextType[] = ["reading", "psalm", "reading2", "gospel"];
  return order.filter((t) => types.has(t));
}

function parseReadingPage(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<h1[^>]*class="title-b"[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch
    ? htmlFragmentToPlainText(titleMatch[1] ?? "")
    : "";

  const bodyMatch = html.match(
    /<div[^>]*class="content-sizing-section"[^>]*>([\s\S]*?)<\/div>/i,
  );
  const inner = bodyMatch?.[1] ?? "";
  const paragraphs = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => htmlFragmentToPlainText(m[1] ?? ""))
    .filter(Boolean);
  const text = paragraphs.join("\n\n");

  return { title, text };
}

function parseLiturgicalTitle(html: string, dateKey: string): string {
  const dateSpan = html.match(
    /<span[^>]*class="date"[^>]*>\s*([^<]+?)\s*<\/span>/i,
  );
  if (dateSpan?.[1]) return dateSpan[1].trim();

  const h1 = html.match(/<h1[^>]*class="title-b"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) {
    const full = htmlFragmentToPlainText(h1[1]);
    const ofIdx = full.toLowerCase().lastIndexOf(" of ");
    if (ofIdx >= 0) return full.slice(ofIdx + 4).trim();
    return full;
  }

  return dateKey;
}

async function fetchLwcReading(
  dateKey: string,
  type: LwcTextType,
): Promise<MassReading | null> {
  const meta = LWC_TYPE_META[type];
  try {
    const html = await fetchLwcHtml(`/daily-texts/${type}/${dateKey}`);
    const { title, text } = parseReadingPage(html);
    if (!text) return null;

    const citation = title.includes(" of ")
      ? title.split(/\s+of\s+/i)[0]?.trim() ?? title
      : title;

    return {
      kind: meta.kind,
      label: meta.label,
      title: citation,
      text,
      externalUrl: lwcPageUrl(dateKey, type),
    };
  } catch (e) {
    console.error("fetchLwcReading", type, dateKey, e);
    return null;
  }
}

export async function fetchLivingWithChristDay(
  date: Date | string,
): Promise<LwcMassDay> {
  const dateKey = typeof date === "string" ? date : toDateKey(date);
  if (!parseDateParam(dateKey)) {
    throw new Error("Invalid date. Use YYYY-MM-DD.");
  }

  const hubHtml = await fetchLwcHtml(`/daily-texts/reading/${dateKey}`);
  const types = listTextTypesFromHubHtml(hubHtml, dateKey);
  const readings = (
    await Promise.all(types.map((type) => fetchLwcReading(dateKey, type)))
  ).filter((r): r is MassReading => r !== null);

  if (readings.length === 0) {
    throw new Error(
      "No readings found on Living with Christ for this date.",
    );
  }

  return {
    date: dateKey,
    liturgicalTitle: parseLiturgicalTitle(hubHtml, dateKey),
    readings,
    source: LWC_READINGS_SOURCE,
    pageUrl: livingWithChristReadingUrl(dateKey),
  };
}
