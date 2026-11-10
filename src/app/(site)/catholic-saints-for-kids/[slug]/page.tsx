import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getSaintSeoCard,
  SAINTS_HUB,
  SAINT_SEO_CARDS,
  saintFactBox,
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
  return pageMetadata({
    title: seo.seoTitle,
    description: saintMetaDescription(card),
    path: `${SAINTS_HUB}/${card.slug}`,
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

function SaintFactBoxCard({ box }: { box: SaintFactBox }) {
  const rows: { label: string; content: ReactNode }[] = [];
  if (box.feast) rows.push({ label: "Feast Day", content: <FactPills items={[box.feast]} /> });
  if (box.patron.length > 0) rows.push({ label: "Patron of", content: <FactPills items={box.patron} /> });
  if (box.symbols.length > 0) rows.push({ label: "Symbols", content: <FactPills items={box.symbols} /> });
  if (box.story) {
    rows.push({
      label: "1-Line Story",
      content: <p className="text-base leading-relaxed text-[#374151]">{box.story}</p>,
    });
  }
  return (
    <section
      aria-labelledby="fact-box"
      className="mt-4 max-w-3xl rounded-2xl border border-[#f0d9b8] bg-white/90 p-4"
    >
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
  const description = factBox ? saintMetaDescription(card) : seo.description;
  const path = `${SAINTS_HUB}/${card.slug}`;

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

        <header className="mt-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9a6b3f]">{card.set}</p>
          <h1 className="mt-1 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{seo.h1}</h1>
          {card.when ? <p className="mt-2 text-sm text-[#4b5563]">Feast / memorial: {card.when}</p> : null}
        </header>

        {factBox ? (
          <SaintFactBoxCard box={factBox} />
        ) : (
          <div className="mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-[#374151]">
            <p>{seo.intro[0]}</p>
            <p>{seo.intro[1]}</p>
          </div>
        )}

        <blockquote className="mt-6 max-w-3xl rounded-2xl border border-[#f0d9b8] bg-white/90 p-4 text-base font-medium text-[#1f2937]">
          “{card.text}”
          {card.ref ? <footer className="mt-2 text-sm font-normal text-[#6b7280]">{card.ref}</footer> : null}
        </blockquote>

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
