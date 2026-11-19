import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { cardThumbSrc } from "@/lib/resource/card-meta";
import { groupSaintsBySet, INDEXABLE_SAINT_SEO_CARDS, SAINTS_HUB, SAINT_SEO_CARDS } from "@/lib/seo/card-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Saints for Kids – Feast Days, Patron Saints & Saint Stories",
  absoluteTitle: true,
  description:
    "Free Catholic saint pages for kids with feast days, patron saints and short stories. Great for a student saint research project or Confirmation saint ideas.",
  path: SAINTS_HUB,
  image: {
    url: "/images/saints/catholic-saints-for-kids-og.png",
    width: 1200,
    height: 630,
    alt: "Catholic saint cards for kids: Saint Peter, Saint Thérèse of Lisieux, Saint Teresa of Calcutta, Saint Kateri Tekakwitha and Saint Carlo Acutis",
  },
});

export default function CatholicSaintsHubPage() {
  const groups = groupSaintsBySet();
  // Structured data lists only the indexable saint pages (the ones with a Fact Box).
  const listItems = INDEXABLE_SAINT_SEO_CARDS.map((c) => ({
    name: c.title,
    path: `${SAINTS_HUB}/${c.slug}`,
  }));

  return (
    <PageShell>
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
          Meet {SAINT_SEO_CARDS.length} saints through short, child-friendly cards: who they are, their feast day, a
          short story, and three questions you can ask at the dinner table. Grouped by set so every saint is two clicks
          away.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          Teachers and catechists can use these pages for a student saint research project. Families can look here for
          patron saints for kids, and older students can find Confirmation saint ideas.
        </p>

        <div className="mt-8 space-y-10">
          {groups.map((g) => (
            <section key={g.set} aria-labelledby={`set-${g.set}`}>
              <h2 id={`set-${g.set}`} className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
                {g.set}
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {g.cards.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${SAINTS_HUB}/${c.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-[#f0d9b8] bg-white/90 p-2 text-sm no-underline hover:border-[#c9773a]"
                    >
                      <span className="block overflow-hidden rounded-lg bg-[#fbf7f1]">
                        <Image
                          src={cardThumbSrc(c.id)}
                          alt={`${c.title} saint card`}
                          width={432}
                          height={540}
                          unoptimized
                          loading="lazy"
                          className="block h-auto w-full transition-transform group-hover:scale-[1.02]"
                        />
                      </span>
                      <span className="mt-2 block px-1 font-bold leading-snug text-[#1f2937]">{c.title}</span>
                      {c.when ? <span className="mt-0.5 block px-1 text-xs text-[#6b7280]">{c.when}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-saints-for-kids" />
        </div>
      </div>
    </PageShell>
  );
}
