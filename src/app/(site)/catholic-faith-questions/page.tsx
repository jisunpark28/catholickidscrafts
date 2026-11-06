import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAITH_HUB, FAITH_SEO_CARDS, groupFaithByCatThenSet } from "@/lib/seo/card-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Faith Questions for Kids",
  description:
    "Catholic faith questions for kids — Mass, prayer, sacraments, and virtues explained in child-friendly cards with family talk prompts.",
  path: FAITH_HUB,
});

export default function CatholicFaithQuestionsHubPage() {
  const groups = groupFaithByCatThenSet();
  const listItems = FAITH_SEO_CARDS.map((c) => ({
    name: c.title,
    path: `${FAITH_HUB}/${c.slug}`,
  }));

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Catholic Faith Questions", path: FAITH_HUB }]),
          itemListNode("Catholic faith questions for kids", listItems),
        ]}
      />
      <div className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Catholic Faith Questions
        </nav>
        <h1 className="mt-3 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
          Catholic faith questions for kids
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          {FAITH_SEO_CARDS.length} short cards covering Mass &amp; Church, Prayer, Sacraments, and Virtue &amp; Life.
          Each page adds family conversation questions so catechism ideas stick beyond flashcards.
        </p>

        <div className="mt-8 space-y-10">
          {groups.map((g) => (
            <section key={g.cat} aria-labelledby={`cat-${g.cat}`}>
              <h2 id={`cat-${g.cat}`} className="font-[Georgia,serif] text-2xl font-bold text-[#1f2937]">
                {g.cat}
              </h2>
              <div className="mt-4 space-y-6">
                {g.sets.map((s) => (
                  <div key={s.set}>
                    <h3 className="text-lg font-bold text-[#374151]">{s.set}</h3>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {s.cards.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`${FAITH_HUB}/${c.slug}`}
                            className="block rounded-2xl border border-[#f0d9b8] bg-white/90 px-3 py-3 text-sm no-underline hover:border-[#c9773a]"
                          >
                            <span className="font-bold text-[#1f2937]">{c.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-faith-questions" />
        </div>
      </div>
    </PageShell>
  );
}
