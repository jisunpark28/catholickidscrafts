import { MemoPrintActions } from "@/components/account/MemoPrintActions";
import { withBookInfo } from "@/lib/bible-memos/book-info";
import { loadVisibleMemos, resolveMemoViewer } from "@/lib/bible-memos/memo-access";
import { filterMemos, formatMemoDate, memoColor } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import logo from "@/Logo.png";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import "@/styles/memo-print.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My memos (print)",
  robots: { index: false },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Print-friendly memo export (browser "Save as PDF"). Viewing needs sign-in only, not Plus. */
export default async function MemoPrintPage({ searchParams }: { searchParams: SP }) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) redirect("/account/login");
  const viewer = await resolveMemoViewer(key);
  if (!viewer) redirect("/account/login");
  const sp = await searchParams;
  const filters = {
    person: viewer.isParent ? one(sp.person) || "all" : "all",
    color: one(sp.color) || "all",
    book: one(sp.book),
    q: one(sp.q).slice(0, 200),
  };
  const memos = filterMemos((await loadVisibleMemos(viewer)).map(withBookInfo), filters).sort(
    (a, b) => a.bookOrder - b.bookOrder || a.chapter - b.chapter || a.startVerse - b.startVerse,
  );

  const books: { name: string; chapters: { chapter: number; items: typeof memos }[] }[] = [];
  for (const m of memos) {
    let b = books.find((x) => x.name === m.bookName);
    if (!b) books.push((b = { name: m.bookName, chapters: [] }));
    let c = b.chapters.find((x) => x.chapter === m.chapter);
    if (!c) b.chapters.push((c = { chapter: m.chapter, items: [] }));
    c.items.push(m);
  }
  const today = formatMemoDate(new Date().toISOString());
  const isPsalms = (name: string) => name === "Psalms";

  return (
    <div className="memo-print mx-auto max-w-3xl px-4 py-8 text-[#1f2937]">
      <MemoPrintActions />
      <header className="flex items-center gap-3 border-b-2 border-[#e5e7eb] pb-3">
        <Image src={logo} alt="" className="h-12 w-auto" priority />
        <div>
          <div className="text-lg font-bold">Catholic Kids Crafts · My memos</div>
          <div className="text-xs text-[#6b7280]">
            {viewer.isParent ? `${viewer.name} (parent)` : viewer.name} · {memos.length}{" "}
            {memos.length === 1 ? "memo" : "memos"} · Exported {today}
          </div>
        </div>
      </header>
      {memos.length === 0 && <p className="mt-6 text-sm text-[#6b7280]">No memos match these filters.</p>}
      {books.map((b) => (
        <section key={b.name}>
          <h2 className="mb-1 mt-6 text-lg font-bold">{b.name}</h2>
          {b.chapters.map((c) => (
            <div key={c.chapter}>
              <h3 className="mb-2 mt-2 text-[13px] font-semibold text-[#6b7280]">
                {isPsalms(b.name) ? `Psalm ${c.chapter}` : `Chapter ${c.chapter}`}
              </h3>
              {c.items.map((m) => {
                const col = memoColor(m.color);
                const passage =
                  m.startVerse === m.endVerse
                    ? `${isPsalms(b.name) ? "Psalm" : b.name} ${m.chapter}:${m.startVerse}`
                    : `${isPsalms(b.name) ? "Psalm" : b.name} ${m.chapter}:${m.startVerse}\u2013${m.endVerse}`;
                return (
                  <article key={m.id} className="memo-print-item mb-3.5 border-l-[5px] pl-3" style={{ borderLeftColor: col.swatch }}>
                    <div className="text-sm font-bold">
                      {passage}{" "}
                      <span className="text-[11px] font-normal text-[#6b7280]">
                        <span className="memo-print-swatch" style={{ background: col.swatch }} aria-hidden /> {col.label} highlight
                        {m.visibility === "FAMILY" ? " · Shared" : ""}
                      </span>
                    </div>
                    <blockquote className="my-1 px-2 py-1 font-serif text-[13px] italic" style={{ background: col.bg }}>
                      “{m.quotedText}”
                    </blockquote>
                    <p className="whitespace-pre-wrap text-[13px]">{m.body}</p>
                    <div className="mt-0.5 text-[11px] text-[#6b7280]">
                      {m.mine ? viewer.name : m.authorName} · {formatMemoDate(m.createdAt)}
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
