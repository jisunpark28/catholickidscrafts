import { PdfSettingsBar } from "@/components/moms-bible/PdfSettingsBar";
import { getSituation } from "@/data/moms-bible/situations";
import { MB_COLOR_INFO, colorLabel, isMbSticker, stickerLabel } from "@/lib/moms-bible/constants";
import type { PdfBookEntry, loadPdfBook } from "@/lib/moms-bible/pdf-data";
import "@/styles/moms-bible-print.css";

const TZ = "America/Toronto";
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TZ });
const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ });

type Book = Awaited<ReturnType<typeof loadPdfBook>>;

/** The keepsake booklet (cover, legend, Bible-order body, blessing page). Authorization happens in the page. */
export function PdfBooklet({
  book,
  childId,
  meParentId,
  opt,
  printedAt = new Date(),
}: {
  book: Book;
  childId: string;
  meParentId: string;
  opt: { others: boolean; replies: boolean };
  printedAt?: Date;
}) {
  const printed = fmt(printedAt);
  const meRole = book.roleOf[meParentId] ?? "Mom";
  const childName = book.childName;

  // Group: book -> official chapter.
  const groups: { bookName: string; chapters: { label: string; entries: PdfBookEntry[] }[] }[] = [];
  for (const e of book.entries) {
    let g = groups[groups.length - 1];
    if (!g || g.bookName !== e.bookName) groups.push((g = { bookName: e.bookName, chapters: [] }));
    let c = g.chapters[g.chapters.length - 1];
    if (!c || c.label !== e.chapterLabel) g.chapters.push((c = { label: e.chapterLabel, entries: [] }));
    c.entries.push(e);
  }

  return (
    <div className="mbp">
      <PdfSettingsBar
        childId={childId}
        childName={childName}
        others={opt.others}
        replies={opt.replies}
        hasOthers={Object.keys(book.roleOf).length > 1}
        dedication={book.dedication}
        dedicationBy={book.dedicationBy}
        defaultBy={meRole}
      />

      <section className="mbp-cover">
        <div className="mbp-cover__emoji" aria-hidden>
          💌📖
        </div>
        <h1 className="mbp-cover__title">{book.title}</h1>
        <p className="mbp-cover__sub">A Legacy of Faith &amp; Love</p>
        {book.dedication && (
          <blockquote className="mbp-cover__dedication">
            <p>{book.dedication}</p>
            {book.dedicationBy && <footer>— {book.dedicationBy}</footer>}
          </blockquote>
        )}
        <p className="mbp-cover__date">Printed {printed}</p>
      </section>

      <section className="mbp-legend" aria-label="Colour legend">
        <h2>How to read this Bible</h2>
        <ul>
          {(Object.keys(MB_COLOR_INFO) as (keyof typeof MB_COLOR_INFO)[]).map((c) => (
            <li key={c}>
              <span className={`mbp-swatch mbp-hl--${c.toLowerCase()}`} aria-hidden />
              {colorLabel(c, meRole)}
            </li>
          ))}
          <li>
            <span className="mbp-star-sample" aria-hidden>
              ⭐
            </span>
            Starred verse (dashed gold underline)
          </li>
        </ul>
      </section>

      {groups.length === 0 && <p className="mbp-empty">No highlights or notes yet. They will appear here in Bible order.</p>}

      {groups.map((g) => (
        <section key={g.bookName} className="mbp-book">
          <h2 className="mbp-book__title">{g.bookName}</h2>
          {g.chapters.map((c) => (
            <div key={c.label} className="mbp-chapter">
              <h3 className="mbp-chapter__title">{c.label}</h3>
              {c.entries.map((e) => (
                <Entry key={`${e.kind}-${e.chapter}-${e.startVerse ?? "L"}`} e={e} roleOf={book.roleOf} childName={childName} />
              ))}
            </div>
          ))}
        </section>
      ))}

      <section className="mbp-blessing">
        <h2>A Handwritten Blessing from {book.blessingFrom}</h2>
        <div className="mbp-blessing__lines" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} />
          ))}
        </div>
        <div className="mbp-blessing__sign">
          <span>Signed</span>
          <span className="mbp-line" />
          <span>Date</span>
          <span className="mbp-line mbp-line--short" />
        </div>
      </section>
    </div>
  );
}

function Entry({ e, roleOf, childName }: { e: PdfBookEntry; roleOf: Record<string, string>; childName: string }) {
  const sit = e.situationKey ? getSituation(e.situationKey) : null;
  return (
    <article className={`mbp-entry${e.kind === "letter" ? " mbp-entry--letter" : ""}`}>
      <header className="mbp-entry__head">
        <span className="mbp-entry__ref">{e.kind === "letter" ? "📌 Chapter Letter" : e.ref}</span>
        {sit && (
          <span className="mbp-tag">
            {sit.emoji} {sit.title}
          </span>
        )}
      </header>
      {e.text && (
        <p className={`mbp-verse${e.color ? ` mbp-hl--${e.color.toLowerCase()}` : ""}${e.star || e.underline ? " mbp-verse--star" : ""}`}>
          {e.star && <span aria-hidden>⭐ </span>}
          {e.text}
        </p>
      )}
      {e.notes.map((n) =>
        n.items.map((i, idx) => {
          const date = fmtShort(i.createdAt);
          if (i.authorKind === "CHILD") {
            const role = roleOf[n.authorParentId] ?? "Mom";
            const content = i.kind === "STICKER" && isMbSticker(i.stickerKey) ? stickerLabel(i.stickerKey, role) : i.body;
            return (
              <div key={`${n.id}-${idx}`} className="mbp-reply">
                <span className="mbp-who">👧 {childName}</span> {content}
                <span className="mbp-date"> · {date}</span>
              </div>
            );
          }
          const role = roleOf[i.authorParentId ?? n.authorParentId] ?? "Parent";
          return (
            <div key={`${n.id}-${idx}`} className="mbp-note">
              <p className="mbp-note__text">{i.body}</p>
              <p className="mbp-note__by">
                💌 {role} · {date}
              </p>
            </div>
          );
        }),
      )}
    </article>
  );
}
