import { GospelHub } from "@/components/gospel/GospelHub";
import { todayUniversalis, toDateKey } from "@/lib/dates";
import {
  getGospelCompletedDateKeys,
  isSignedInReader,
} from "@/lib/gospel/progress";
import { getReaderKey } from "@/lib/bible/reader";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Gospel",
  description: "Type today's Gospel and collect daily praise stickers on your reading calendar.",
  ...canonicalForPath("/bible/gospel"),
};

export const dynamic = "force-dynamic";

export default async function TodaysGospelPage() {
  const today = todayUniversalis();
  const todayDate = toDateKey(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;

  const key = await getReaderKey();
  const signedIn = isSignedInReader(key);
  const initialCompleted = signedIn
    ? await getGospelCompletedDateKeys(year, month)
    : [];

  return (
    <GospelHub
      signedIn={signedIn}
      initialCompleted={initialCompleted}
      todayDate={todayDate}
    />
  );
}
