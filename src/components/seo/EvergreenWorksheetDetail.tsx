import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import {
  evergreenDescription,
  evergreenSeoTitle,
  faithCardPath,
  getEvergreenSheet,
  hubPath,
  printPath,
  publicPath,
  relatedCards,
  type EvergreenPage,
} from "@/lib/seo/evergreen-worksheets";
import { breadcrumbNode, worksheetNode } from "@/lib/structured-data";
import Link from "next/link";
import { notFound } from "next/navigation";

const h2 = "font-[Georgia,serif] text-xl font-bold text-[#1f2937]";
const p = "mt-2 text-base leading-relaxed text-[#374151]";
const link = "font-semibold text-[#335599] hover:underline";

/** Public SEO page for one evergreen worksheet (Mass order or Family Virtue Challenge). */
export function EvergreenWorksheetDetail({ page }: { page: EvergreenPage }) {
  const sheet = getEvergreenSheet(page.key);
  if (!sheet) notFound();
  const isVirtue = page.kind === "virtue";
  const hubName = isVirtue ? "Catholic Virtue Challenge" : "Catholic Mass for Kids";
  const path = publicPath(page);
  const title = evergreenSeoTitle(page);
  const description = evergreenDescription(page, sheet);
  const l1 = sheet.levels.level1;
  const l2 = sheet.levels.level2;
  const missions = l1.activity?.type === "checklist" ? l1.activity.items : [];
  const steps =
    l2.activity?.type === "wordorder" ? l2.activity.pieces : l1.activity?.type === "wordorder" ? l1.activity.pieces : [];
  const talk = [...new Set([...l1.questions, ...l2.questions])];
  const cards = relatedCards(page);

  return (
    <PageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: hubName, path: hubPath(page.kind) },
            { name: page.name, path },
          ]),
          worksheetNode({
            name: title,
            gospelRef: sheet.gospelRef,
            description,
            abstract: l1.story,
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
          <Link href={hubPath(page.kind)} className="text-[#335599] hover:underline">
            {hubName}
          </Link>{" "}
          › {page.name}
        </nav>

        <header className="mt-3">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{title}</h1>
          <p className="mt-2 text-lg font-semibold text-[#4b5563]">
            {isVirtue
              ? `This Week's Catholic Virtue Challenge${page.virtueFamily ? ` · ${page.virtueFamily}` : ""}`
              : "The Order of Mass, explained for Catholic kids"}
          </p>
        </header>

        {isVirtue ? (
          <section className="mt-6 max-w-3xl" aria-labelledby="take-home">
            <h2 id="take-home" className={h2}>
              A take-home family challenge
            </h2>
            <p className={p}>
              After Sunday school or a homeschool lesson, your child brings this sheet home and hangs it on the fridge.
              From Monday to Saturday, the family practices one small mission a day and colors a star. At the end of
              the week, talk together and a parent signs the sheet.
            </p>
          </section>
        ) : null}

        <section className="mt-6 max-w-3xl" aria-labelledby="meaning">
          <h2 id="meaning" className={h2}>
            {isVirtue ? "What it means" : "What happens at Mass"}
          </h2>
          <p className={p}>{l2.story}</p>
        </section>

        <section className="mt-6 max-w-3xl" aria-labelledby="verse">
          <h2 id="verse" className={h2}>
            Scripture verse
          </h2>
          <p className={p}>{sheet.keyVerseDR}</p>
        </section>

        {missions.length ? (
          <section className="mt-6 max-w-3xl" aria-labelledby="missions">
            <h2 id="missions" className={h2}>
              Daily action checklist (Monday–Saturday)
            </h2>
            <ul className="mt-3 list-none space-y-2 pl-0 text-base text-[#374151]">
              {missions.map((m) => (
                <li key={m}>☆ {m}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {steps.length ? (
          <section className="mt-6 max-w-3xl" aria-labelledby="steps">
            <h2 id="steps" className={h2}>
              In order
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-base text-[#374151]">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-6 max-w-3xl" aria-labelledby="talk">
          <h2 id="talk" className={h2}>
            {isVirtue ? "Family Talk" : "Family conversation questions"}
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
            {talk.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          {isVirtue ? (
            <p className="mt-3 text-sm text-[#4b5563]">Parent&apos;s signature: the sheet has a space for a parent to sign at the end of the week.</p>
          ) : null}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={printPath(page, 1, true)}
            className="inline-flex justify-center rounded-full bg-[#2e7d32] px-6 py-3 text-center text-sm font-bold text-white no-underline hover:bg-[#256628]"
          >
            Print this worksheet
          </Link>
          <Link
            href={printPath(page, 1)}
            className="inline-flex justify-center rounded-full border-2 border-[#c9773a] bg-white px-6 py-3 text-center text-sm font-bold text-[#c9773a] no-underline hover:bg-[#fff8f0]"
          >
            Open the worksheet
          </Link>
        </div>
        <p className="mt-3 text-sm text-[#6b7280]">Plus unlocks worksheet previews and printing. Level 1 and Level 2 are both included.</p>

        {cards.length ? (
          <section className="mt-8 max-w-3xl" aria-labelledby="cards">
            <h2 id="cards" className={h2}>
              Related picture cards
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#374151]">
              {cards.map((c) => (
                <li key={c.id}>
                  <Link href={faithCardPath(c)} className={link}>
                    {c.title}
                  </Link>
                  {" — "}
                  {c.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10">
          <NewsletterSubscribeForm source={isVirtue ? "catholic-virtue-challenge" : "catholic-mass-for-kids"} />
        </div>

        <p className="mt-6 text-sm text-[#6b7280]">
          <Link href={hubPath(page.kind)} className={link}>
            ← All {isVirtue ? "virtue challenge" : "Mass"} worksheets
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
