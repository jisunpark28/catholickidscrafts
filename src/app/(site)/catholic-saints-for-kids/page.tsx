import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { SaintsHubBrowser, type SaintsHubGroup } from "@/components/seo/SaintsHubBrowser";
import { cardThumbSrc } from "@/lib/resource/card-meta";
import { groupSaintsBySet, INDEXABLE_SAINT_SEO_CARDS, SAINTS_HUB, SAINT_SEO_CARDS } from "@/lib/seo/card-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Saints for Kids",
  description:
    "Catholic saint stories for children — apostles, martyrs, young saints, and holy friends from every land. Free family talk prompts for parents and catechists.",
  path: SAINTS_HUB,
});

export default function CatholicSaintsHubPage() {
  const groups = groupSaintsBySet();
  // Structured data lists only the indexable saint pages (the ones with a Fact Box).
  const listItems = INDEXABLE_SAINT_SEO_CARDS.map((c) => ({
    name: c.title,
    path: `${SAINTS_HUB}/${c.slug}`,
  }));
  const browserGroups: SaintsHubGroup[] = groups.map((g) => ({
    set: g.set,
    cards: g.cards.map((c) => {
      const month = c.md ? Number(c.md.slice(0, 2)) : NaN;
      return {
        id: c.id,
        title: c.title,
        href: `${SAINTS_HUB}/${c.slug}`,
        thumb: cardThumbSrc(c.id),
        when: c.when,
        month: month >= 1 && month <= 12 ? month : null,
      };
    }),
  }));

  return (
    <HomePdfShell groups={[]}>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Catholic Saints for Kids", path: SAINTS_HUB }]),
          itemListNode("Catholic saints for kids", listItems),
        ]}
      />
      <div className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Catholic Saints for Kids
        </nav>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
            Catholic saints for kids
          </h1>
          <ShareToClassroomButton />
        </div>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          Meet {SAINT_SEO_CARDS.length} saints through short, child-friendly cards: who they are, a memorable line
          from their story, and three questions you can ask at the dinner table. Grouped by set so every saint is two
          clicks away.
        </p>

        <SaintsHubBrowser groups={browserGroups} />

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-saints-for-kids" />
        </div>
      </div>
    </HomePdfShell>
  );
}
