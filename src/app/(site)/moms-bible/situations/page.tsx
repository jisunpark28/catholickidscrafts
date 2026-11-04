import { PageShell } from "@/components/PageShell";
import { SITUATION_GROUPS, type SituationRef } from "@/data/moms-bible/situations";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
import { SituationsBoard, type BoardGroup } from "@/components/moms-bible/SituationsBoard";
import { momsBibleToolbar } from "@/lib/moms-bible/page-data";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { nabreToDouay } from "@/lib/bible/ref-map";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/moms-bible.css";

// Per-viewer toolbar ("For Mia ▾"); verse texts are cached by fetchBibleChapter.
export const dynamic = "force-dynamic";

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

  const toolbar = await momsBibleToolbar().catch(() => null);
  const board: BoardGroup[] = groups.map((g) => ({
    color: g.color,
    emoji: g.emoji,
    title: g.title,
    situations: g.situations.map((s) => ({
      key: s.key,
      emoji: s.emoji,
      title: s.title,
      verses: s.verses.map((v) => ({ label: v.ref.label, href: v.href, text: v.text })),
    })),
  }));

  return (
    <PageShell wide>
      <div className="mb-situations rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        {toolbar && <MbToolbar data={toolbar} variant="for" />}
        <h1 className="mt-2 font-[Georgia,serif] text-3xl font-bold text-[#1f2937]">When my child is…</h1>
        <p className="mb-sub mt-1">Tap a moment — we&apos;ll suggest verses to open and leave a note.</p>
        <SituationsBoard groups={board} />
      </div>
    </PageShell>
  );
}
