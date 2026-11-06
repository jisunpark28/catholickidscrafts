import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  keyToSlug,
  resourcePath,
  resourcePrintPath,
  seasonLabel,
  seasonPath,
  sheetAbstract,
  sheetDescription,
  sheetSeason,
  sheetSeoH1,
  sheetSeoH2,
  sheetSeoTitle,
  slugToKey,
  yearLabel,
} from "@/lib/resource/sheets";
import {
  sheetConversationQuestions,
  SUNDAY_MASS_WORKSHEETS_HUB,
  sundayMassWorksheetPath,
} from "@/lib/seo/sunday-mass-worksheets";
import { pinOgImage } from "@/lib/seo/pin-og";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, worksheetNode } from "@/lib/structured-data";
import { getSundaySheet, listSundaySheetKeys } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listSundaySheetKeys().map((key) => ({ slug: keyToSlug(key) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!sheet || !key) return {};
  return pageMetadata({
    title: sheetSeoTitle(sheet),
    absoluteTitle: true,
    description: sheetDescription(sheet),
    path: sundayMassWorksheetPath(key),
    image: pinOgImage("worksheet", keyToSlug(key), sheetSeoTitle(sheet)),
  });
}

export default async function SundayMassWorksheetPage({ params }: Props) {
  const { slug } = await params;
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  if (slug !== keyToSlug(key)) permanentRedirect(sundayMassWorksheetPath(key));

  const path = sundayMassWorksheetPath(key);
  const season = sheetSeason(sheet);
  const seasonHref = seasonPath(season);
  const questions = sheetConversationQuestions(sheet);
  const story = sheet.levels.level1.story.trim();
  const printHref = resourcePrintPath(key, 1);
  const appHref = resourcePath(key);

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Sunday Mass Worksheets", path: SUNDAY_MASS_WORKSHEETS_HUB },
            { name: seasonLabel(season), path: seasonHref },
            { name: `${sheet.liturgicalName} (${yearLabel(key)})`, path },
          ]),
          worksheetNode({
            name: sheetSeoTitle(sheet),
            gospelRef: sheet.gospelRef,
            description: sheetDescription(sheet),
            abstract: sheetAbstract(sheet),
            keyVerse: sheet.keyVerseDR,
            pagePath: path,
            isAccessibleForFree: true,
          }),
        ]}
      />

      <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          ›{" "}
          <Link href={SUNDAY_MASS_WORKSHEETS_HUB} className="text-[#335599] hover:underline">
            Sunday Mass Worksheets
          </Link>{" "}
          ›{" "}
          <Link href={seasonHref} className="text-[#335599] hover:underline">
            {seasonLabel(season)}
          </Link>{" "}
          › {sheet.liturgicalName}
        </nav>

        <header className="mt-3">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{sheetSeoH1(sheet)}</h1>
          <p className="mt-2 text-lg font-semibold text-[#4b5563]">{sheetSeoH2(sheet)}</p>
        </header>

        <section className="mt-6 max-w-3xl" aria-labelledby="gospel-summary">
          <h2 id="gospel-summary" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Gospel summary for kids
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[#374151]">{story}</p>
        </section>

        <section className="mt-6 max-w-3xl" aria-labelledby="key-verse">
          <h2 id="key-verse" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Key verse
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[#374151]">{sheet.keyVerseDR}</p>
          <p className="mt-3 text-sm text-[#4b5563]">
            Want to highlight a related verse with your child?{" "}
            <Link href="/bible-verses-for-kids" className="font-semibold text-[#335599] hover:underline">
              Browse Bible verses for kids
            </Link>{" "}
            or open{" "}
            <Link href="/moms-bible/situations" className="font-semibold text-[#335599] hover:underline">
              Mom&apos;s Bible situations
            </Link>
            .
          </p>
        </section>

        <section className="mt-6 max-w-3xl" aria-labelledby="talk">
          <h2 id="talk" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            Family conversation questions
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={printHref}
            className="inline-flex justify-center rounded-full bg-[#2e7d32] px-6 py-3 text-center text-sm font-bold text-white no-underline hover:bg-[#256628]"
          >
            Print this worksheet
          </Link>
          <Link
            href={appHref}
            className="inline-flex justify-center rounded-full border-2 border-[#c9773a] bg-white px-6 py-3 text-center text-sm font-bold text-[#c9773a] no-underline hover:bg-[#fff8f0]"
          >
            Open in the resource library
          </Link>
        </div>
        <p className="mt-3 text-sm text-[#6b7280]">
          This Sunday prints free for signed-in families. Plus unlocks every week — the designed sheet stays behind
          the same gate as the app.
        </p>

        <div className="mt-10">
          <NewsletterSubscribeForm source="sunday-mass-worksheets" />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          <Link href={SUNDAY_MASS_WORKSHEETS_HUB} className="font-semibold text-[#335599] hover:underline">
            ← All Sunday Mass worksheets
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
