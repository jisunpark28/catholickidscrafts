import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { FaithArticleCard, faithCollectionImage } from "@/components/faith/FaithArticleCard";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  FAITH_HUB,
  FAITH_SEO_CARDS,
  faithPageSeo,
  getFaithSeoCard,
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

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FAITH_SEO_CARDS.map((c) => ({ slug: c.slug }));
}

// Article text comes from the static card catalog; only the sidebar copy is read from the DB.
export const revalidate = 86400;
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getFaithSeoCard(slug);
  if (!card) return {};
  const seo = faithPageSeo(card);
  return pageMetadata({
    title: seo.seoTitle,
    description: seo.description,
    path: `${FAITH_HUB}/${card.slug}`,
    image: pinOgImage("faith", card.slug, seo.seoTitle),
  });
}

function learningNode(name: string, description: string, pagePath: string, about: string): JsonLdNode {
  return {
    "@type": "LearningResource",
    name,
    description,
    learningResourceType: "Catechism conversation guide",
    educationalLevel: ["Elementary School", "Parents"],
    about: { "@type": "Thing", name: about },
    isAccessibleForFree: true,
    inLanguage: "en",
    url: absoluteSiteUrl(pagePath),
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
    provider: { "@id": organizationId() },
  };
}

export default async function CatholicFaithQuestionPage({ params }: Props) {
  const { slug } = await params;
  const card = getFaithSeoCard(slug);
  if (!card) notFound();
  const seo = faithPageSeo(card);
  const path = `${FAITH_HUB}/${card.slug}`;
  const related = FAITH_SEO_CARDS.filter((item) => item.cat === card.cat && item.id !== card.id).slice(0, 2);

  return (
    <TestamentPageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Catholic Faith Questions", path: FAITH_HUB },
            { name: card.title, path },
          ]),
          learningNode(seo.h1, seo.description, path, card.title),
        ]}
      />
      <article className="mx-auto max-w-4xl rounded-[24px] border border-[#e6d9c5] bg-[#fffdf8] p-4 sm:p-8 lg:p-10">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          ›{" "}
          <Link href={FAITH_HUB} className="text-[#335599] hover:underline">
            Catholic Faith Questions
          </Link>{" "}
          › {card.title}
        </nav>

        <p className="mt-5 text-sm">
          <Link href={FAITH_HUB} className="font-semibold text-[#405329] underline">
            Back to faith cards
          </Link>
        </p>
        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9a6b3f]">
            {card.cat} · {card.set}
          </p>
          <h1 className="mt-1 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{seo.h1}</h1>
          {card.when ? <p className="mt-2 text-sm text-[#4b5563]">When: {card.when}</p> : null}
        </header>

        <figure className="relative mt-6 aspect-[2/1] overflow-hidden rounded-2xl bg-[#f4eddf]">
          <Image
            src={faithCollectionImage(card.cat)}
            alt={`${card.cat} collection illustration`}
            fill
            sizes="(max-width: 1024px) 90vw, 800px"
            className="object-contain"
            priority
          />
        </figure>
        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-[#374151]">
          <p>{seo.intro[0]}</p>
          <p>{seo.intro[1]}</p>
        </div>

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
          Need a verse for a real parenting moment?{" "}
          <Link href="/bible-verses-for-kids" className="font-semibold text-[#335599] hover:underline">
            Bible verses for kids
          </Link>
        </p>

        {related.length > 0 ? (
          <section className="mt-10" aria-labelledby="related-questions">
            <h2 id="related-questions" className="font-[Georgia,serif] text-2xl font-bold text-[#405329]">
              Keep exploring {card.cat}
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <FaithArticleCard key={item.id} card={item} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-faith-questions" />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          <Link href={FAITH_HUB} className="font-semibold text-[#335599] hover:underline">
            ← All Catholic faith questions
          </Link>
        </p>
      </article>
    </TestamentPageShell>
  );
}
