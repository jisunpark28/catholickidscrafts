import { HomeLanding } from "@/components/HomeLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Daily Catholic Mass in English, liturgical-season kids crafts, curriculum paths, and curated recommendations.",
};

export default function HomePage() {
  return <HomeLanding />;
}
