import { HomeLanding } from "@/components/HomeLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Free planning help for parish and family children's programs—Mass calendar, seasonal activities, games, and curriculum ideas.",
};

export default function HomePage() {
  return <HomeLanding />;
}
