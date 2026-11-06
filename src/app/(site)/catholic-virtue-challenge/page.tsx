import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  evergreenPages,
  getEvergreenSheet,
  printPath,
  publicPath,
  VIRTUE_CHALLENGE_HUB,
  VIRTUE_FAMILIES,
} from "@/lib/seo/evergreen-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Virtue Challenge for Families: 24 Printable Worksheets",
  description:
    "24 printable Catholic family virtue challenge sheets for kids. Take one home from Sunday school, hang it on the fridge, and practice a virtue Monday to Saturday with a parent signature.",
  path: VIRTUE_CHALLENGE_HUB,
});

export default function VirtueChallengeHubPage() {
  const pages = evergreenPages("virtue");
  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Catholic Virtue Challenge", path: VIRTUE_CHALLENGE_HUB }]),
          itemListNode(
            "Family virtue challenge worksheets",
            pages.map((p) => ({ name: `${p.name} Virtue Challenge`, path: publicPath(p) })),
          ),
        ]}
      />
      <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Catholic Virtue Challenge
        </nav>
        <header className="mt-3 max-w-3xl">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
            This Week&apos;s Catholic Virtue Challenge
          </h1>
          <p className="mt-2 text-base leading-relaxed text-[#374151]">
            Faith formation does not end when Sunday school is over. Each sheet is a take-home family challenge: your
            child brings it home, hangs it on the fridge, and practices one virtue with the family from Monday to
            Saturday. Every sheet has a Scripture verse, what the virtue means, a daily action checklist, Family Talk
            questions, and a space for a parent&apos;s signature.
          </p>
        </header>

        <section className="mt-6 max-w-3xl rounded-2xl bg-white p-4 shadow-sm" aria-labelledby="year-plan">
          <h2 id="year-plan" className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
            A plan for the whole year
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[#374151]">
            A liturgical year has about 52–54 weeks. The six weeks of Lent are set aside for a special Lenten 40-day
            challenge (coming later). The other 48 weeks (Advent, Christmas, Easter, and Ordinary Time) fit these 24
            character strengths exactly: practice each one for two weeks.
          </p>
        </section>

        {VIRTUE_FAMILIES.map((fam) => {
          const list = pages.filter((p) => p.virtueFamily === fam.id);
          return (
            <section key={fam.id} className="mt-8" aria-labelledby={`fam-${fam.id}`}>
              <h2 id={`fam-${fam.id}`} className="font-[Georgia,serif] text-2xl font-bold text-[#1f2937]">
                {fam.id}
              </h2>
              <p className="mt-1 text-sm text-[#4b5563]">{fam.blurb}</p>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {list.map((p) => {
                  const sheet = getEvergreenSheet(p.key);
                  return (
                    <li key={p.key} className="rounded-2xl bg-white p-4 shadow-sm">
                      <h3 className="font-[Georgia,serif] text-lg font-bold">
                        <Link href={publicPath(p)} className="text-[#335599] hover:underline">
                          {p.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#374151]">{sheet?.levels.level1.story}</p>
                      <p className="mt-2 text-sm">
                        <Link href={printPath(p, 1, true)} className="font-semibold text-[#2e7d32] hover:underline">
                          Print with Plus
                        </Link>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </article>
    </PageShell>
  );
}
