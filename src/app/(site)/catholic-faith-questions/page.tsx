import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { FaithArticleCard } from "@/components/faith/FaithArticleCard";
import { FaithNavigationDirectory } from "@/components/home/FaithNavigationDirectory";
import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadLiturgyQaDeck } from "@/lib/liturgy-qa-deck";
import { getResourceNav } from "@/lib/resource/nav";
import { FAITH_HUB, FAITH_SEO_CARDS, groupFaithByCatThenSet } from "@/lib/seo/card-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/qa-cards.css";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Faith Questions for Kids",
  description:
    "Catholic faith questions for kids — Mass, prayer, sacraments, and virtues explained in child-friendly cards with family talk prompts.",
  path: FAITH_HUB,
});

// Q&A deck is edited in admin: saves call revalidatePath, and the hourly refresh is a fallback.
export const revalidate = 3600;

export default async function CatholicFaithQuestionsHubPage() {
  const [nav, deck] = await Promise.all([getResourceNav(), loadLiturgyQaDeck()]);
  const groups = groupFaithByCatThenSet();
  const listItems = FAITH_SEO_CARDS.map((c) => ({
    name: c.title,
    path: `${FAITH_HUB}/${c.slug}`,
  }));

  return (
    <TestamentPageShell>
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
              <h2 id={`cat-${g.cat}`} className="font-[Georgia,serif] text-2xl font-bold text-[#405329]">
                {g.cat}
              </h2>
              <div className="mt-4 space-y-6">
                {g.sets.map((s) => (
                  <div key={s.set}>
                    <h3 className="text-lg font-bold text-[#374151]">{s.set}</h3>
                    <ul className="mt-3 grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
                      {s.cards.map((c) => (
                        <li key={c.id}>
                          <FaithArticleCard card={c} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <FaithNavigationDirectory groups={nav.groups} />

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-faith-questions" />
        </div>
      </div>

      <section id="qa-cards" className="mt-10 scroll-mt-28 rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8" aria-labelledby="qa-cards-heading">
        <h2 id="qa-cards-heading" className="font-[Georgia,serif] text-3xl font-bold text-[#405329]">
          Q&amp;A Cards
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          The questions and answers from Mass, the sacraments, the saints, devotions, and the Church seasons.
          Tap a card to read the answer, then flip it back.
        </p>
        <div className="mt-8 space-y-12">
          {deck.map((section) => (
            <section key={section.slug} aria-labelledby={`qa-topic-${section.slug}`} data-qa-source={section.source} data-qa-topic={section.slug}>
              <h3 id={`qa-topic-${section.slug}`} className="font-[Georgia,serif] text-2xl font-bold text-[#405329]">
                {section.topic.title}
              </h3>
              {section.topic.bigIdea ? <p className="mt-2 max-w-3xl text-[#6b4a2f]">{section.topic.bigIdea}</p> : null}
              <p className="mt-2 text-sm">
                <Link href={`/liturgy/${section.slug}`} className="font-semibold text-[#335599] underline">
                  {section.label} page
                </Link>
              </p>
              <div className="mt-4">
                <QaFlipCards cards={section.cards} cardBackColor={section.topic.cardBackColor} fit />
              </div>
            </section>
          ))}
        </div>
      </section>
    </TestamentPageShell>
  );
}
