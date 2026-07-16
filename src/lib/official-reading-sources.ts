import { toDateKey } from "@/lib/dates";
import { goodNewsDailyMissaUrl } from "@/lib/scripture-links";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";
import { universalisMassPageUrlClient } from "@/lib/universalis-client";

/** Curated official / bishops’-conference reading destinations (link-out; not scrapers). */
export type OfficialReadingLink = {
  id: string;
  label: string;
  href: string;
  /** Short note for operators / UI tooltips */
  note: string;
  /** BCP conference or publisher */
  authority: string;
};

export function cbckDailyMissaUrl(date: Date): string {
  const ymd = toDateKey(date).replace(/-/g, "");
  return `https://missa.cbck.or.kr/DailyMissa/${ymd}`;
}

/** Vatican News embed (news about Pope/Church — not daily lectionary text). */
export const VATICAN_NEWS_WIDGET_EMBED =
  "https://www.vaticannews.va/widget/embed.html";

/**
 * Official outbound links for a given civil day.
 * Use for “read on the publisher’s site” — avoids republishing without license.
 */
export function officialReadingLinksForDate(date: Date): OfficialReadingLink[] {
  return [
    {
      id: "usccb",
      label: "USCCB Daily Readings (English, U.S.)",
      href: usccbReadingsPageUrl(date),
      authority: "United States Conference of Catholic Bishops",
      note:
        "Official U.S. Lectionary. RSS display on free websites permitted (see usccb.org/subscribe/rss).",
    },
    {
      id: "cbck",
      label: "CBCK 매일미사 (Korean)",
      href: cbckDailyMissaUrl(date),
      authority: "Catholic Bishops' Conference of Korea",
      note:
        "Official Korean daily Mass text on missa.cbck.or.kr. Republication requires written CBCK approval.",
    },
    {
      id: "goodnews",
      label: "GoodNews 매일미사 (Korean, Seoul)",
      href: goodNewsDailyMissaUrl(date),
      authority: "Archdiocese of Seoul (GoodNews)",
      note:
        "Korean daily Mass text on maria.catholic.or.kr. Outbound link only; republication requires publisher permission.",
    },
    {
      id: "universalis",
      label: "Universalis (today’s Mass)",
      href: universalisMassPageUrlClient(),
      authority: "Universalis Publishing Ltd",
      note:
        "JSONP embed permitted for websites per universalis.com/n-web.htm (typing practice on this site).",
    },
  ];
}
