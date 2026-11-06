import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { yearLabel } from "@/lib/resource/sheets";
import {
  sheetsGroupedBySeason,
  SUNDAY_MASS_WORKSHEETS_HUB,
  sundayMassWorksheetPath,
} from "@/lib/seo/sunday-mass-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Sunday Mass Worksheets for Catholic Kids",
  description:
    "Free printable Catholic Sunday Mass worksheets for kids and catechists — Advent through Ordinary Time. Gospel story, activities, and family talk questions for every week.",
  path: SUNDAY_MASS_WORKSHEETS_HUB,
});

export default function SundayMassWorksheetsHubPage() {
  const groups = sheetsGroupedBySeason();
  const listItems = groups.flatMap((g) =>
    g.sheets.map((s) => ({
      name: `${s.liturgicalName} (${yearLabel(s.key)})`,
      path: sundayMassWorksheetPath(s.key),
    })),
  );

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Sunday Mass Worksheets", path: SUNDAY_MASS_WORKSHEETS_HUB }]),
          itemListNode("Catholic Sunday Mass worksheets for kids", listItems),
        ]}
      />
      <div className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Sunday Mass Worksheets
        </nav>
        <h1 className="mt-3 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
          Sunday Mass worksheets for Catholic kids
        </h1>
        <div className="mt-3 max-w-3xl space-y-3 text-base leading-relaxed text-[#374151]">
          <p>
            Every Sunday of the Roman Catholic liturgical year deserves a kid-sized Gospel sheet: a short story,
            an activity, reflection questions, and a prayer. Browse the full library below — Advent is listed first
            so families preparing for Christmas can find this season quickly.
          </p>
          <p>
            Each worksheet page includes the Gospel summary, key verse, and family conversation prompts. Print this
            Sunday free in the app; Plus unlocks the full archive. Season hubs like{" "}
            <Link href="/resources/advent" className="font-semibold text-[#335599] hover:underline">
              Advent resources
            </Link>{" "}
            stay available for browsing by liturgical color and theme.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {groups.map((g) => (
            <section key={g.season} aria-labelledby={`season-${g.season}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`season-${g.season}`} className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
                  {g.label}
                </h2>
                <Link href={g.seasonHref} className="text-sm font-semibold text-[#335599] hover:underline">
                  Season hub →
                </Link>
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.sheets.map((s) => (
                  <li key={s.key}>
                    <Link
                      href={sundayMassWorksheetPath(s.key)}
                      className="block rounded-2xl border border-[#f0d9b8] bg-white/90 px-3 py-3 text-sm no-underline hover:border-[#c9773a]"
                    >
                      <span className="font-bold text-[#1f2937]">
                        {s.liturgicalName}{" "}
                        <span className="font-medium text-[#6b7280]">({yearLabel(s.key)})</span>
                      </span>
                      <span className="mt-1 block text-[#4b5563]">{s.gospelRef}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <NewsletterSubscribeForm source="sunday-mass-worksheets" />
        </div>
      </div>
    </PageShell>
  );
}
