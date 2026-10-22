import { GospelHub } from "@/components/gospel/GospelHub";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { todayUniversalis, toDateKey } from "@/lib/dates";
import {
  getGospelCompletedDateKeys,
  isSignedInReader,
} from "@/lib/gospel/progress";
import { getReaderKey } from "@/lib/bible/reader";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { pageMetadata } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { breadcrumbNode } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Gospel Typing & Sunday Sheet for Kids",
  description:
    "Type today's Gospel, collect praise stickers and download the free printable Sunday Gospel sheet. Ready for Sunday school and children's ministry.",
  path: "/bible/gospel",
});

export const dynamic = "force-dynamic";

export default async function TodaysGospelPage() {
  const today = todayUniversalis();
  const todayDate = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const [key, sections, copy] = await Promise.all([
    getReaderKey(),
    getPublishedHomeSections(),
    getSiteCopyMap(),
  ]);
  const signedIn = isSignedInReader(key);
  const initialCompleted = signedIn
    ? await getGospelCompletedDateKeys(year, month)
    : [];
  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  return (
    <HomePdfShell groups={groups}>
      <JsonLd nodes={[breadcrumbNode([{ name: "Today's Gospel", path: "/bible/gospel" }])]} />
      <h1 className="mb-4 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">Today&apos;s Gospel</h1>
      <GospelHub
        signedIn={signedIn}
        initialCompleted={initialCompleted}
        todayDate={todayDate}
      />
      <RelatedLinks
        links={[
          { href: "/", label: "Print this Sunday's Gospel sheet", hint: "Free printable sheet in two levels." },
          { href: "/daily-mass", label: "Read today's Mass readings", hint: "All the readings with questions to talk about." },
          { href: "/prayers", label: "Learn the prayers we say at Mass", hint: "Our Father, Hail Mary and more on flip cards." },
          { href: "/liturgy/mass", label: "What happens at Mass?", hint: "Kid-friendly questions and answers." },
        ]}
      />
    </HomePdfShell>
  );
}
