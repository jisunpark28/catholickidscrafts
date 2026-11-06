import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { groupSaintsBySet, SAINTS_HUB, SAINT_SEO_CARDS } from "@/lib/seo/card-seo";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode, itemListNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Saints for Kids",
  description:
    "Catholic saint stories for children — apostles, martyrs, young saints, and holy friends from every land. Free family talk prompts for parents and catechists.",
  path: SAINTS_HUB,
});

export default function CatholicSaintsHubPage() {
  const groups = groupSaintsBySet();
  const listItems = SAINT_SEO_CARDS.map((c) => ({
    name: c.title,
    path: `${SAINTS_HUB}/${c.slug}`,
  }));

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Catholic Saints for Kids", path: SAINTS_HUB }]),
          itemListNode("Catholic saints for kids", listItems),
        ]}
      />
      <div className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>{" "}
          › Catholic Saints for Kids
        </nav>
        <h1 className="mt-3 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">
          Catholic saints for kids
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#374151]">
          Meet {SAINT_SEO_CARDS.length} saints through short, child-friendly cards: who they are, a memorable line
          from their story, and three questions you can ask at the dinner table. Grouped by set so every saint is two
          clicks away.
        </p>

        <div className="mt-8 space-y-8">
          {groups.map((g) => (
            <section key={g.set} aria-labelledby={`set-${g.set}`}>
              <h2 id={`set-${g.set}`} className="font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
                {g.set}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.cards.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${SAINTS_HUB}/${c.slug}`}
                      className="block rounded-2xl border border-[#f0d9b8] bg-white/90 px-3 py-3 text-sm no-underline hover:border-[#c9773a]"
                    >
                      <span className="font-bold text-[#1f2937]">{c.title}</span>
                      {c.when ? <span className="mt-1 block text-[#6b7280]">{c.when}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-saints-for-kids" />
        </div>
      </div>
    </PageShell>
  );
}
