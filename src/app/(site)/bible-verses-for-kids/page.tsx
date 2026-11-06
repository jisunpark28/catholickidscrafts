import { BibleVersesSubscribeForm } from "@/components/bible-verses-for-kids/BibleVersesSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITUATION_GROUPS, SITUATIONS } from "@/data/moms-bible/situations";
import { getSituationSeo } from "@/data/moms-bible/situation-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

const HUB_PATH = "/bible-verses-for-kids";

export const metadata: Metadata = pageMetadata({
  title: "Bible Verses for Kids — Catholic Scripture for Real Moments",
  description:
    "Catholic Bible verses for kids' real moments: sadness, bullying, anxiety, First Communion, and more. Free Scripture prompts and family talk questions for parents.",
  path: HUB_PATH,
});

/** Public SEO hub for Mom's Bible \"When my child is…\" moments. */
export default function BibleVersesForKidsHubPage() {
  const listItems = SITUATIONS.map((s) => {
    const seo = getSituationSeo(s.key);
    return {
      name: seo?.h1 ?? s.title,
      path: `${HUB_PATH}/${s.key}`,
    };
  });

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Bible Verses for Kids", path: HUB_PATH }]),
          itemListNode("Catholic Bible verses for kids' real moments", listItems),
        ]}
      />

      <div className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Bible Verses for Kids
        </nav>

        <h1 className="mt-3 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
          Bible verses for kids — Catholic Scripture for real family moments
        </h1>
        <div className="mt-3 max-w-3xl space-y-3 text-base leading-relaxed text-[#374151]">
          <p>
            Parenting is full of sudden weather: a lost pet, a hard day at school, a night of bad dreams, a First
            Communion glow. These free Catholic Scripture prompts gather verses for fifteen of those moments so you
            can open the Bible with your child without scrambling for the right page.
          </p>
          <p>
            Each moment page shares the verse text, three family conversation questions, and a bridge into{" "}
            <Link href="/moms-bible/situations" className="font-semibold text-[#335599] hover:underline">
              Mom&apos;s Bible
            </Link>{" "}
            when you want to highlight a verse and leave a note. Built for Catholic parents who want Scripture that
            meets kids where they are.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {SITUATION_GROUPS.map((g) => (
            <section key={g.title} aria-labelledby={`group-${g.color}`}>
              <h2 id={`group-${g.color}`} className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
                <span aria-hidden>{g.emoji}</span> {g.title}
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {g.situations.map((s) => {
                  const seo = getSituationSeo(s.key);
                  return (
                    <li key={s.key}>
                      <Link
                        href={`${HUB_PATH}/${s.key}`}
                        className="block rounded-2xl border border-[#f0d9b8] bg-white/90 p-4 no-underline transition hover:border-[#c9773a] hover:shadow-sm"
                      >
                        <span className="font-bold text-[#1f2937]">
                          <span aria-hidden>{s.emoji}</span> {s.title}
                        </span>
                        {seo ? (
                          <span className="mt-1 block text-sm text-[#4b5563]">{seo.description}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <BibleVersesSubscribeForm />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          Prefer the in-app board?{" "}
          <Link href="/moms-bible/situations" className="font-semibold text-[#335599] hover:underline">
            Open Mom&apos;s Bible situations
          </Link>{" "}
          to highlight and leave a note for your child.
        </p>
      </div>
    </PageShell>
  );
}
