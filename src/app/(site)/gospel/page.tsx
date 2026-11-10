import { redirect } from "next/navigation";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Gospel",
  description: "Type today's Gospel and collect daily praise stickers on your reading calendar.",
  ...canonicalForPath("/gospel"),
};

/** Short URL for Today's Gospel: typing now lives on /daily-mass */
export default function GospelShortLinkPage() {
  redirect("/daily-mass");
}
