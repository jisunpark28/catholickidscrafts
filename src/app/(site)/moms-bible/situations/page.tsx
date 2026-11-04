import { PageShell } from "@/components/PageShell";
import { SITUATION_GROUPS, type SituationRef } from "@/data/moms-bible/situations";
import { MB_COLOR_INFO } from "@/lib/moms-bible/constants";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { nabreToDouay } from "@/lib/bible/ref-map";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/moms-bible.css";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Bible Verses for Kids' Big Moments",
  description:
    "Catholic Bible verses for when your child is sad, scared, angry, moving, or celebrating, ready to highlight and share with a note.",
  path: "/moms-bible/situations",
});

type Resolved = { ref: SituationRef; href: string; text: string };

async function resolve(ref: SituationRef, situationKey: string): Promise<Resolved | null> {
  const start = nabreToDouay(ref.book, ref.chapter, ref.verse);
  if (!start) return null;
  const end = ref.verseEnd ? nabreToDouay(ref.book, ref.chapter, ref.verseEnd) : start;
  const [path, hash] = readHrefForDouay(start.slug, start.chapter, start.verse).split("#");
  const href = `${path}?situation=${encodeURIComponent(situationKey)}${hash ? `#${hash}` : ""}`;
  let text = "";
  try {
    const data = await fetchBibleChapter(start.slug, start.chapter);
    const last = end && end.chapter === start.chapter ? (end.verseEnd ?? end.verse) : start.verse;
    text = data.verses
      .filter((v) => v.verse >= start.verse && v.verse <= last)
      .map((v) => modernizeVerse(start.slug, start.chapter, v.verse, v.text))
      .join(" ");
  } catch {
    /* the card still links to the verse */
  }
  return { ref, href, text };
}

/** "When my child is…": moments with recommended verses; each opens the reader to leave a note. */
export default async function SituationsPage() {
  const groups = await Promise.all(
    SITUATION_GROUPS.map(async (g) => ({
      ...g,
      situations: await Promise.all(
        g.situations.map(async (s) => ({
          ...s,
          verses: (await Promise.all(s.refs.map((r) => resolve(r, s.key)))).filter((x): x is Resolved => Boolean(x)),
        })),
      ),
    })),
  );

  return (
    <PageShell wide>
      <div className="mb-situations">
        <h1 className="text-center text-3xl text-[var(--color-ink)]">When my child is…</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-[var(--color-muted)]">
          Pick a moment, open the verse and leave a highlight and a little note in your child&apos;s Bible.
        </p>

        <div className="mb-situations__groups">
          {groups.map((g) => (
            <section key={g.title} className={`mb-sgroup ${MB_COLOR_INFO[g.color].className}`}>
              <h2 className="mb-sgroup__title">
                <span aria-hidden>{g.emoji}</span> {g.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.situations.map((s) => (
                  <a key={s.key} href={`#s-${s.key}`} className="mb-chip">
                    {s.emoji} {s.title}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {groups.flatMap((g) =>
          g.situations.map((s) => (
            <section key={s.key} id={`s-${s.key}`} className="mb-situation">
              <h2 className="mb-situation__title">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </h2>
              <div className="mb-situation__verses">
                {s.verses.map((v) => (
                  <article key={v.ref.label} className={`mb-card mb-verse-card ${MB_COLOR_INFO[g.color].className}`}>
                    <p className="mb-note__ref">{v.ref.label}</p>
                    {v.text && <blockquote className="mb-quote">“{v.text}”</blockquote>}
                    <Link href={v.href} className="mb-link mt-2 inline-block">
                      Open &amp; leave a note →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )),
        )}
      </div>
    </PageShell>
  );
}
