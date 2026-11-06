import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  evergreenPages,
  getEvergreenSheet,
  MASS_FOR_KIDS_HUB,
  printPath,
  publicPath,
} from "@/lib/seo/evergreen-worksheets";
import { SUNDAY_MASS_WORKSHEETS_HUB } from "@/lib/seo/sunday-mass-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Mass for Kids: Order of the Mass Worksheets",
  description:
    "Printable Catholic worksheets that teach kids the order of the Mass: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, and the four parts of the Mass.",
  path: MASS_FOR_KIDS_HUB,
});

export default function MassForKidsHubPage() {
  const pages = evergreenPages("mass");
  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Catholic Mass for Kids", path: MASS_FOR_KIDS_HUB }]),
          itemListNode(
            "Order of the Mass worksheets",
            pages.map((p) => ({ name: `${p.name} Mass Worksheet`, path: publicPath(p) })),
          ),
        ]}
      />
      <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Catholic Mass for Kids
        </nav>
        <header className="mt-3">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
            Catholic Mass for Kids: Order of the Mass Worksheets
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-[#374151]">
            Help children follow along at Mass. Each printable sheet explains one part of the Mass, puts the
            steps in order, and ends with family talk questions and a prayer. Level 1 is for younger children; Level 2
            adds more detail.
          </p>
        </header>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {pages.map((p) => {
            const sheet = getEvergreenSheet(p.key);
            return (
              <li key={p.key} className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
                  <Link href={publicPath(p)} className="text-[#335599] hover:underline">
                    {p.name}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#374151]">{sheet?.levels.level1.story}</p>
                <p className="mt-3 text-sm">
                  <Link href={printPath(p, 1, true)} className="font-semibold text-[#2e7d32] hover:underline">
                    Print with Plus
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-sm text-[#4b5563]">
          Looking for this week&apos;s Gospel?{" "}
          <Link href={SUNDAY_MASS_WORKSHEETS_HUB} className="font-semibold text-[#335599] hover:underline">
            Browse Sunday Mass worksheets
          </Link>
          .
        </p>
      </article>
    </PageShell>
  );
}
