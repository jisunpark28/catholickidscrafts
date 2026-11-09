import { HomeView, homeMetadata } from "../../home-view";
import { HOME_VARIANTS, isHomeVariant } from "@/lib/home-variants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Internal static copy of the home page per calendar country. Only reached through the `/`
 * rewrites in next.config.ts (lib/home-variants), so the browser URL stays `/`. Canonical is `/`
 * and direct hits get `X-Robots-Tag: noindex` (next.config.ts); not in the sitemap.
 */
export const metadata: Metadata = homeMetadata;
export const revalidate = 1800;
export const dynamicParams = false;

export function generateStaticParams() {
  return HOME_VARIANTS.map((country) => ({ country }));
}

export default async function HomeVariantPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  if (!isHomeVariant(country)) notFound();
  return <HomeView country={country} />;
}
