/**
 * Keepsake PDF data (design section 8). Server only. The caller must have checked that the
 * viewer is a linked parent with their own Plus (canParentPrintPdf).
 */
import { CATHOLIC_BOOK_NAMES_EN } from "@/lib/bible/catholic-book-names/locale-data";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { prisma } from "@/lib/prisma";
import { linkedParents } from "./access";
import { isMbColor } from "./constants";
import { buildPdfEntries, pdfTitle, rolesPhrase, type PdfEntry, type PdfOptions } from "./pdf-book";
import { noteRef } from "./queries";

export type PdfBookEntry = PdfEntry & { ref: string; bookName: string; chapterLabel: string; text: string };

const BOOK_ORDER = Object.keys(CATHOLIC_BOOK_NAMES_EN);

/** Verse text per storage chapter (cached upstream for a day); errors leave the text out. */
async function chapterTexts(keys: { bookSlug: string; chapter: number }[]) {
  const out = new Map<string, Map<number, string>>();
  const queue = [...keys];
  async function worker() {
    for (let k = queue.shift(); k; k = queue.shift()) {
      try {
        const data = await fetchBibleChapter(k.bookSlug, k.chapter);
        if (data.meta.chapter !== k.chapter) continue;
        out.set(
          `${k.bookSlug}|${k.chapter}`,
          new Map(data.verses.map((v) => [v.verse, modernizeVerse(k.bookSlug, k.chapter, v.verse, v.text)])),
        );
      } catch {
        /* the entry still prints without the verse text */
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, queue.length) }, worker));
  return out;
}

export async function loadPdfBook(childId: string, opt: PdfOptions) {
  const [child, parents, notes, highlights, book] = await Promise.all([
    prisma.subProfile.findUnique({ where: { id: childId }, select: { displayName: true } }),
    linkedParents(childId),
    prisma.mbNote.findMany({
      where: { subProfileId: childId },
      select: {
        id: true,
        authorParentId: true,
        bookSlug: true,
        chapter: true,
        startVerse: true,
        endVerse: true,
        color: true,
        situationKey: true,
        createdAt: true,
        items: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          select: { authorKind: true, authorParentId: true, kind: true, body: true, stickerKey: true, createdAt: true },
        },
      },
    }),
    prisma.mbHighlight.findMany({
      where: { subProfileId: childId },
      select: { authorParentId: true, bookSlug: true, chapter: true, verse: true, color: true, star: true, underline: true, situationKey: true },
    }),
    prisma.mbBook.findUnique({ where: { subProfileId: childId }, select: { dedication: true, dedicationBy: true } }),
  ]);
  const childName = child?.displayName ?? "";
  const roleOf = new Map(parents.map((p) => [p.parentId, p.roleLabel]));
  const entries = buildPdfEntries(
    notes.map((n) => ({ ...n, color: isMbColor(n.color) ? n.color : null })),
    highlights.map((h) => ({ ...h, color: isMbColor(h.color) ? h.color : null })),
    BOOK_ORDER,
    opt,
  );

  const chapterKeys = [...new Map(entries.filter((e) => e.kind === "verse").map((e) => [`${e.bookSlug}|${e.chapter}`, e])).values()];
  const texts = await chapterTexts(chapterKeys.map((e) => ({ bookSlug: e.bookSlug, chapter: e.chapter })));

  const withText: PdfBookEntry[] = entries.map((e) => {
    const ref = noteRef(e.bookSlug, e.chapter, e.startVerse, e.endVerse);
    const verses = texts.get(`${e.bookSlug}|${e.chapter}`);
    const text =
      e.startVerse !== null && verses
        ? Array.from({ length: (e.endVerse ?? e.startVerse) - e.startVerse + 1 }, (_, i) => verses.get(e.startVerse! + i) ?? "")
            .filter(Boolean)
            .join(" ")
        : "";
    const chapterRef = noteRef(e.bookSlug, e.chapter, null, null);
    return {
      ...e,
      ref,
      bookName: CATHOLIC_BOOK_NAMES_EN[e.bookSlug] ?? e.bookSlug,
      chapterLabel: chapterRef,
      text,
    };
  });

  const authorRoles = [...new Set(entries.flatMap((e) => e.notes.map((n) => roleOf.get(n.authorParentId) ?? "Parent")))];
  const myRole = roleOf.get(opt.me) ?? "Mom";
  const titleRoles = opt.others ? (authorRoles.length ? authorRoles : [myRole]) : [myRole];
  const allRoles = [...new Set(parents.map((p) => p.roleLabel))];
  return {
    childName,
    title: pdfTitle(titleRoles, childName),
    blessingFrom: opt.others ? rolesPhrase(allRoles) : myRole,
    roleOf: Object.fromEntries(roleOf),
    entries: withText,
    dedication: book?.dedication ?? "",
    dedicationBy: book?.dedicationBy ?? "",
  };
}
