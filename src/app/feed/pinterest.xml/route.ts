import {
  absolutePageUrl,
  absolutePinImageUrl,
  PINS_PER_DAY,
  pinsForUtcDate,
  secondsUntilNextUtcMidnight,
  type PinContent,
} from "@/lib/seo/pin-og";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function itemXml(pin: PinContent, pubDate: Date): string {
  const link = absolutePageUrl(pin.pagePath);
  const image = absolutePinImageUrl(pin.type, pin.slug);
  const title = xmlEscape(pin.title);
  return `  <item>
    <title>${title}</title>
    <link>${xmlEscape(link)}</link>
    <guid isPermaLink="true">${xmlEscape(link)}</guid>
    <pubDate>${pubDate.toUTCString()}</pubDate>
    <description>${cdata(pin.description)}</description>
    <enclosure url="${xmlEscape(image)}" type="image/png" length="0" />
    <media:content url="${xmlEscape(image)}" type="image/png" medium="image" width="1000" height="1500" />
  </item>`;
}

function buildRss(items: PinContent[], now: Date): string {
  const site = getSiteUrl();
  const dayStamp = now.toISOString().slice(0, 10);
  const channelTitle = "Catholic Kids Crafts — Pinterest daily picks";
  const channelDesc = `Four Catholic kids activities each UTC day (Advent-first rotation). ${PINS_PER_DAY} pins/day.`;
  const body = items.map((pin) => itemXml(pin, now)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(channelTitle)}</title>
    <link>${xmlEscape(site)}/</link>
    <description>${xmlEscape(channelDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <ttl>360</ttl>
    <!-- utc-day=${dayStamp} count=${items.length} -->
${body}
  </channel>
</rss>
`;
}

/** Rate-limited Pinterest RSS: 4 deterministic items per UTC calendar day. */
export async function GET() {
  const now = new Date();
  const items = pinsForUtcDate(now);
  const xml = buildRss(items, now);
  const untilMidnight = secondsUntilNextUtcMidnight(now);
  // Cap at 6h so CDNs refresh within the day, but never past the UTC day boundary.
  const maxAge = Math.min(untilMidnight, 6 * 60 * 60);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}
