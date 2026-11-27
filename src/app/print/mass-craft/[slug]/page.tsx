import { HolyWaterHanger } from "@/components/mass-craft/HolyWaterHanger";
import { PrintToolbar } from "@/components/gospel-sheet/PrintToolbar";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { pathWithQuery } from "@/lib/sign-in-callback";
import { requireSignInForPage } from "@/lib/sign-in-gate";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SLUG = "holy-water-blessing-hanger";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== SLUG) return {};
  return pageMetadata({
    title: "Holy Water Blessing Hanger",
    absoluteTitle: true,
    description: "Sign in to print the holy water blessing hanger.",
    path: "/catholic-mass-for-kids/holy-water-blessing-hanger",
    robots: { index: false, follow: true },
  });
}

/** Sign-in craft. Any signed-in family may print. There is no Plus check and no file download. */
export default async function MassCraftPrintPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (slug !== SLUG) notFound();
  const level = parseLevelParam(query.level);
  await requireSignInForPage(pathWithQuery(`/print/mass-craft/${slug}`, query));
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <style>{`${GOSPEL_SHEET_CSS}@page{size:letter;margin:0}`}</style>
      <PrintToolbar
        slug={slug}
        level={level}
        gospelRef=""
        usccbUrl=""
        autoPrint={query.autoprint === "1"}
        basePath={`/print/mass-craft/${slug}`}
        backHref="/catholic-mass-for-kids/holy-water-blessing-hanger"
      />
      <HolyWaterHanger level={level} />
    </div>
  );
}
