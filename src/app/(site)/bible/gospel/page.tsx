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

export const metadata: Metadata = pageMetadata({
  title: "Today's Gospel Typing for Kids",
  description:
    "Type today's Gospel from the Catholic Mass and collect a daily praise sticker on your reading calendar. A simple daily Bible habit for kids and families.",
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
      <GospelHub
        signedIn={signedIn}
        initialCompleted={initialCompleted}
        todayDate={todayDate}
      />
    </HomePdfShell>
  );
}
