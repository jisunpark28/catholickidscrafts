import { BibleVersesSubscribeForm } from "@/components/bible-verses-for-kids/BibleVersesSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSituation, SITUATIONS } from "@/data/moms-bible/situations";
import { getSituationSeo } from "@/data/moms-bible/situation-seo";
import { resolveSituationVerse } from "@/lib/moms-bible/resolve-situation-verse";
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

const HUB_PATH = "/bible-verses-for-kids";

type Props = { params: Promise<{ momentSlug: string }> };

export function generateStaticParams() {
  return SITUATIONS.map((s) => ({ momentSlug: s.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { momentSlug } = await params;
  const situation = getSituation(momentSlug);
  const seo = getSituationSeo(momentSlug);
  if (!situation || !seo) return {};
  return pageMetadata({
    title: seo.seoTitle,
    description: seo.description,
    path: `${HUB_PATH}/${momentSlug}`,
  });
}

function scriptureGuideNode(input: {
  name: string;
  description: string;
  pagePath: string;
  about: string;
}): JsonLdNode {
  return {
    "@type": "LearningResource",
    name: input.name,
    description: input.description,
    learningResourceType: "Conversation guide",
    educationalLevel: ["Elementary School", "Parents"],
    about: { "@type": "Thing", name: input.about },
    isAccessibleForFree: true,
    inLanguage: "en",
    url: absoluteSiteUrl(input.pagePath),
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
    provider: { "@id": organizationId() },
  };
}

export default async function BibleVerseMomentPage({ params }: Props) {
  const { momentSlug } = await params;
  const situation = getSituation(momentSlug);
  const seo = getSituationSeo(momentSlug);
  if (!situation || !seo) notFound();

  const verses = (
    await Promise.all(situation.refs.map((ref) => resolveSituationVerse(ref, situation.key)))
  ).filter((v): v is NonNullable<typeof v> => Boolean(v));

  const path = `${HUB_PATH}/${situation.key}`;
  const aboutLabels = situation.refs.map((r) => r.label).join("; ");

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Bible Verses for Kids", path: HUB_PATH },
            { name: seo.h1, path },
          ]),
          scriptureGuideNode({
            name: seo.h1,
            description: seo.description,
            pagePath: path,
            about: aboutLabels,
          }),
        ]}
      />

      <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          ›{" "}
          <Link href={HUB_PATH} className="text-[#335599] hover:underline">
            Bible Verses for Kids
          </Link>{" "}
          › {situation.title}
        </nav>

        <header className="mt-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9a6b3f]">
            <span aria-hidden>{situation.emoji}</span> When my child is…
          </p>
          <h1 className="mt-1 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{seo.h1}</h1>
        </header>

        <div className="mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-[#374151]">
          <p>{seo.intro[0]}</p>
          <p>{seo.intro[1]}</p>
        </div>

        <section className="mt-8" aria-labelledby="verses-heading">
          <h2 id="verses-heading" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Recommended Scripture
          </h2>
          <ul className="mt-3 space-y-4">
            {verses.map((v) => (
              <li key={v.ref.label} className="rounded-2xl border border-[#f0d9b8] bg-white/90 p-4 sm:p-5">
                <h3 className="font-[Georgia,serif] text-lg font-bold text-[#1f2937]">{v.ref.label}</h3>
                {v.text ? (
                  <p className="mt-2 text-base leading-relaxed text-[#374151]">&ldquo;{v.text}&rdquo;</p>
                ) : (
                  <p className="mt-2 text-sm text-[#6b7280]">Open the verse in Mom&apos;s Bible to read the full text.</p>
                )}
                <Link
                  href={v.href}
                  className="mt-4 inline-flex rounded-full bg-[#c9773a] px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#b5662e]"
                >
                  Highlight this verse in your Mom&apos;s Bible →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="talk-heading">
          <h2 id="talk-heading" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Family conversation questions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
            {seo.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </section>

        <div className="mt-10">
          <BibleVersesSubscribeForm />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          <Link href={HUB_PATH} className="font-semibold text-[#335599] hover:underline">
            ← All Bible verses for kids
          </Link>
          {" · "}
          <Link href="/moms-bible/situations" className="font-semibold text-[#335599] hover:underline">
            Mom&apos;s Bible
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
