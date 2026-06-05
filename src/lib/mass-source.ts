import { toDateKey } from "@/lib/dates";
import type { MassDay, MassDaySummary, MassReading, MonthCalendar } from "@/types/mass";
import {
  fetchLiturgicalTitle,
  fetchMassDaySummary,
  fetchMonthCalendar,
  fetchOptionalField,
  fetchReading,
  rankFromTitle,
} from "@/lib/evangelizo";
import {
  fetchUsccbReadingsForDate,
  MASS_READINGS_PRIMARY_SOURCE,
  usccbReadingsPageUrl,
  USCCB_COPYRIGHT_NOTICE,
} from "@/lib/usccb-rss";

export { USCCB_COPYRIGHT_NOTICE };
export { fetchMonthCalendar, fetchMassDaySummary };

const EVANGELIZO_REPUBLISH =
  process.env.MASS_REPUBLISH_EVANGELIZO === "true" ||
  process.env.MASS_REPUBLISH_EVANGELIZO === "1";

export const MASS_DATA_SOURCE = EVANGELIZO_REPUBLISH
  ? "Evangelizo.org (operator-enabled republish) + USCCB where available"
  : MASS_READINGS_PRIMARY_SOURCE;

export const MASS_CALENDAR_SOURCE =
  "Evangelizo.org Reader API (liturgical titles) + USCCB (readings when in RSS)";

/** Public-site footer: how Daily Mass and related pages source liturgical data. */
export const SITE_LITURGY_FOOTER =
  "Liturgical calendar: Evangelizo.org · Mass readings: USCCB & Living with Christ (external links only)";

async function readingsWithUsccbFirst(date: Date): Promise<{
  readings: MassReading[];
  liturgicalTitleOverride?: string;
  usccbPageUrl: string;
  republishedViaEvangelizo: boolean;
}> {
  const pageUrl = usccbReadingsPageUrl(date);
  const usccb = await fetchUsccbReadingsForDate(date).catch(() => null);

  if (usccb && usccb.readings.length > 0) {
    return {
      readings: usccb.readings.map((r) => ({ ...r, externalUrl: usccb.pageUrl })),
      liturgicalTitleOverride: usccb.liturgicalTitle,
      usccbPageUrl: usccb.pageUrl,
      republishedViaEvangelizo: false,
    };
  }

  if (EVANGELIZO_REPUBLISH) {
    const [fr, ps, sr, gsp] = await Promise.all([
      fetchReading(date, "FR"),
      fetchReading(date, "PS"),
      fetchReading(date, "SR"),
      fetchReading(date, "GSP"),
    ]);
    const readings = [fr, ps, sr, gsp].filter((r): r is MassReading => r !== null);
    return {
      readings,
      usccbPageUrl: pageUrl,
      republishedViaEvangelizo: readings.length > 0,
    };
  }

  const [fr, ps, sr, gsp] = await Promise.all([
    fetchReading(date, "FR"),
    fetchReading(date, "PS"),
    fetchReading(date, "SR"),
    fetchReading(date, "GSP"),
  ]);

  const citations = [fr, ps, sr, gsp].filter((r): r is MassReading => r !== null);
  const readings: MassReading[] = citations.map((r) => ({
    kind: r.kind,
    label: r.label,
    title: r.title,
    externalUrl: pageUrl,
  }));

  return {
    readings,
    usccbPageUrl: pageUrl,
    republishedViaEvangelizo: false,
  };
}

export async function fetchMassDay(date: Date): Promise<MassDay> {
  const { isWithinEvangelizoWindow } = await import("@/lib/dates");
  if (!isWithinEvangelizoWindow(date)) {
    const usccbOnly = await fetchUsccbReadingsForDate(date).catch(() => null);
    if (!usccbOnly) {
      throw new Error(
        "Date is outside the liturgical feed window. Open the official USCCB readings page for this date.",
      );
    }
    return {
      date: toDateKey(date),
      liturgicalTitle: usccbOnly.liturgicalTitle,
      rank: "ferial",
      readings: usccbOnly.readings,
      source: MASS_DATA_SOURCE,
      usccbPageUrl: usccbOnly.pageUrl,
      readingsOnSite: true,
    };
  }

  const [liturgicalTitle, saint, feast, readingBundle] = await Promise.all([
    fetchLiturgicalTitle(date),
    fetchOptionalField(date, "saint"),
    fetchOptionalField(date, "feast"),
    readingsWithUsccbFirst(date),
  ]);

  const hasOnSiteText = readingBundle.readings.some((r) => Boolean(r.text?.trim()));

  return {
    date: toDateKey(date),
    liturgicalTitle: readingBundle.liturgicalTitleOverride ?? liturgicalTitle,
    rank: rankFromTitle(readingBundle.liturgicalTitleOverride ?? liturgicalTitle),
    saint,
    feast,
    readings: readingBundle.readings,
    source: readingBundle.republishedViaEvangelizo
      ? "Evangelizo.org (full text; verify license) + USCCB calendar"
      : hasOnSiteText
        ? MASS_READINGS_PRIMARY_SOURCE
        : "USCCB (official page; citations via Evangelizo)",
    usccbPageUrl: readingBundle.usccbPageUrl,
    readingsOnSite: hasOnSiteText,
  };
}
