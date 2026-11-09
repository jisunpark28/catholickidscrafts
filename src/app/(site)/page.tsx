import { HomeView, homeMetadata } from "./home-view";
import { FALLBACK_COUNTRY } from "@/lib/sheet-keys/countries";
import type { Metadata } from "next";

export const metadata: Metadata = homeMetadata;

/**
 * Default-calendar home ("Other countries"). Canada / US visitors, and anyone whose country
 * cookie says otherwise, are rewritten to /home-variant/[country] in next.config.ts. Static;
 * 30-minute refresh keeps the Sunday Sheet flip within the hour after Sunday ends.
 */
export const revalidate = 1800;

export default function HomePage() {
  return <HomeView country={FALLBACK_COUNTRY} />;
}
