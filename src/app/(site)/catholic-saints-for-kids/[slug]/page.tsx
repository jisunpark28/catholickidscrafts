import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { cardSharePath, cardThumbSrc } from "@/lib/resource/card-meta";
import {
  getSaintSeoCard,
  SAINTS_HUB,
  SAINT_SEO_CARDS,
  saintFactBox,
  saintIndexableTitle,
  saintMetaDescription,
  saintPageSeo,
  type SaintFactBox,
} from "@/lib/seo/card-seo";
import { pinOgImage } from "@/lib/seo/pin-og";
import { pageMetadata } from "@/lib/site-metadata";
import {
  absoluteSiteUrl,
  breadcrumbNode,
  organizationId,
  SITE_NAME,
  type JsonLdNode,
} from "@/lib/structured-data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SAINT_SEO_CARDS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getSaintSeoCard(slug);
  if (!card) return {};
  const seo = saintPageSeo(card);
  const path = `${SAINTS_HUB}/${card.slug}`;
  const description = saintMetaDescription(card);
  if (saintFactBox(card)) {
    // Indexable: keyword title used as-is (no site suffix) so it stays within ~60 characters.
    const title = saintIndexableTitle(card);
    return pageMetadata({
      title,
      absoluteTitle: true,
      description,
      path,
      image: pinOgImage("saint", card.slug, title),
    });
  }
  // No Fact Box yet: keep the page reachable for visitors but out of the index and sitemap.
  return pageMetadata({
    title: seo.seoTitle,
    description,
    path,
    robots: { index: false, follow: true },
    image: pinOgImage("saint", card.slug, seo.seoTitle),
  });
}

function learningNode(name: string, description: string, pagePath: string, about: string): JsonLdNode {
  return {
    "@type": "LearningResource",
    name,
    description,
    learningResourceType: "Saint biography for children",
    educationalLevel: ["Elementary School", "Parents"],
    about: { "@type": "Person", name: about },
    isAccessibleForFree: true,
    inLanguage: "en",
    url: absoluteSiteUrl(pagePath),
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
    provider: { "@id": organizationId() },
  };
}

function FactPills({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-[#f0d9b8] bg-[#fff8f0] px-3 py-0.5 text-sm text-[#1f2937]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Compare a Fact Box story with the card caption, ignoring quotes, punctuation and case. */
function sameText(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return norm(a) === norm(b);
}

/** Feast day is shown once in the page header, so the Fact Box only lists patronage, symbols and the story. */
function SaintFactBoxCard({ box, showStory }: { box: SaintFactBox; showStory: boolean }) {
  const rows: { label: string; content: ReactNode }[] = [];
  if (box.patron.length > 0) rows.push({ label: "Patron of", content: <FactPills items={box.patron} /> });
  if (box.symbols.length > 0) rows.push({ label: "Symbols", content: <FactPills items={box.symbols} /> });
  if (showStory && box.story) {
    rows.push({
      label: "1-Line Story",
      content: <p className="text-base leading-relaxed text-[#374151]">{box.story}</p>,
    });
  }
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="fact-box" className="rounded-2xl border border-[#f0d9b8] bg-white/90 p-4">
      <h2 id="fact-box" className="font-[Georgia,serif] text-lg font-bold text-[#1f2937]">
        Fact Box
      </h2>
      <dl className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
            <dt className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a6b3f] sm:w-28">
              {row.label}
            </dt>
            <dd>{row.content}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function CatholicSaintPage({ params }: Props) {
  const { slug } = await params;
  const card = getSaintSeoCard(slug);
  if (!card) notFound();
  const seo = saintPageSeo(card);
  const factBox = saintFactBox(card);
  const description = saintMetaDescription(card);
  const path = `${SAINTS_HUB}/${card.slug}`;
  const showStory = Boolean(factBox?.story && !sameText(factBox.story, card.text));

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Catholic Saints for Kids", path: SAINTS_HUB },
            { name: card.title, path },
          ]),
          learningNode(seo.h1, description, path, card.title),
        ]}
      />
      <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          ›{" "}
          <Link href={SAINTS_HUB} className="text-[#335599] hover:underline">
            Catholic Saints for Kids
          </Link>{" "}
          › {card.title}
        </nav>

        {/* Desktop (lg+): one grid row (items-stretch) so the card column ends level with the Fact Box (or the quote). */}
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-stretch">
          <figure className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-52 lg:flex lg:w-auto lg:flex-col">
            <div className="rounded-2xl border border-[#f0d9b8] bg-white p-2 shadow-sm lg:flex lg:min-h-[12rem] lg:flex-1 lg:flex-col lg:bg-[#fef9f6]">
              {/* On desktop the picture fills the stretched frame without changing its 4:5 shape; the frame uses the card paper colour so the extra space blends in. */}
              <div className="relative lg:flex-1">
                <Image
                  src={cardThumbSrc(card.id)}
                  alt={`${card.title} saint card for kids`}
                  width={432}
                  height={540}
                  unoptimized
                  priority
                  className="block h-auto w-full rounded-lg bg-[#fbf7f1] lg:absolute lg:inset-0 lg:h-full lg:bg-transparent lg:object-contain"
                />
              </div>
            </div>
            <Link
              href={cardSharePath(card.id)}
              className="mt-2 flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#c9773a] bg-white px-3 py-1.5 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-[#fff8f0]"
            >
              <span aria-hidden="true">🖨️</span> Print / Save Saint Card
            </Link>
          </figure>

          <div className="min-w-0 flex-1 space-y-4">
            <header>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9a6b3f]">{card.set}</p>
              <h1 className="mt-1 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{seo.h1}</h1>
              {card.when ? (
                <p className="mt-2 text-base text-[#4b5563]">
                  <span className="font-semibold text-[#1f2937]">Feast day:</span> {card.when}
                </p>
              ) : null}
            </header>

            <blockquote className="rounded-2xl border-l-4 border-[#c9773a] bg-white/90 p-4 text-lg font-medium leading-relaxed text-[#1f2937]">
              “{card.text}”
              {card.ref ? <footer className="mt-2 text-sm font-normal text-[#6b7280]">{card.ref}</footer> : null}
            </blockquote>

            {factBox ? <SaintFactBoxCard box={factBox} showStory={showStory} /> : null}
          </div>
        </div>

        <section className="mt-8 max-w-3xl" aria-labelledby="talk">
          <h2 id="talk" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Family conversation questions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
            {seo.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </section>

        <p className="mt-6 text-sm text-[#4b5563]">
          Looking for Scripture for a hard day at home?{" "}
          <Link href="/bible-verses-for-kids" className="font-semibold text-[#335599] hover:underline">
            Bible verses for kids
          </Link>
        </p>

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-saints-for-kids" />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          <Link href={SAINTS_HUB} className="font-semibold text-[#335599] hover:underline">
            ← All Catholic saints for kids
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
