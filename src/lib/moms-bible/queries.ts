/** Mom's Bible reads. Server only; callers must have authorized the viewer first. */
import { getCatholicBookName } from "@/lib/bible/catholic-book-names";
import { officialChapterLabel, officialRangeRef } from "@/lib/bible/chapter-pages";
import { prisma } from "@/lib/prisma";
import { linkedParents } from "./access";
import { isMbColor, isMbSticker } from "./constants";
import { chapterStamp, seedCount } from "./rules";
import type { MbAuthorDto, MbChapterView, MbChildChoice, MbItemDto, MbNoteDto } from "./types";

type ViewerArg = { kind: "parent"; parentId: string; children: MbChildChoice[] } | { kind: "child"; childId: string };

/** Official reference shown to people: "Psalm 34:19", "Psalm 34" (chapter letter). */
export function noteRef(bookSlug: string, chapter: number, start: number | null, end: number | null): string {
  const name = bookSlug === "psalms" ? "Psalm" : getCatholicBookName(bookSlug, "en", bookSlug);
  const range = start === null ? null : officialRangeRef(bookSlug, chapter, start, end ?? start);
  return `${name} ${range ?? officialChapterLabel(bookSlug, chapter)}`;
}

export async function loadChapterView(args: {
  viewer: ViewerArg;
  childId: string;
  bookSlug: string;
  chapters: number[];
  familyPass: boolean;
}): Promise<MbChapterView> {
  const { viewer, childId, bookSlug, chapters } = args;
  const meParent = viewer.kind === "parent" ? viewer.parentId : null;
  const [child, parents, highlights, notes, seeds] = await Promise.all([
    prisma.subProfile.findUnique({ where: { id: childId }, select: { displayName: true } }),
    linkedParents(childId),
    prisma.mbHighlight.findMany({
      where: { subProfileId: childId, bookSlug, chapter: { in: chapters } },
      select: { id: true, authorParentId: true, chapter: true, verse: true, color: true, star: true, underline: true },
    }),
    prisma.mbNote.findMany({
      where: { subProfileId: childId, bookSlug, chapter: { in: chapters } },
      orderBy: [{ chapter: "asc" }, { startVerse: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        authorParentId: true,
        chapter: true,
        startVerse: true,
        endVerse: true,
        color: true,
        situationKey: true,
        childRepliedAt: true,
        createdAt: true,
        items: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            authorKind: true,
            authorParentId: true,
            authorChildId: true,
            kind: true,
            body: true,
            stickerKey: true,
            createdAt: true,
          },
        },
      },
    }),
    viewer.kind === "child" ? childSeedCount(childId) : Promise.resolve(0),
  ]);

  const authorIds = new Set<string>(parents.map((p) => p.parentId));
  const authors: MbAuthorDto[] = parents.map((p) => ({ parentId: p.parentId, roleLabel: p.roleLabel, isMe: p.parentId === meParent }));
  // A parent whose link was removed keeps their old notes visible to the child, labelled generically.
  for (const id of [...highlights.map((h) => h.authorParentId), ...notes.map((n) => n.authorParentId)]) {
    if (!authorIds.has(id)) {
      authorIds.add(id);
      authors.push({ parentId: id, roleLabel: "Parent", isMe: id === meParent });
    }
  }

  const noteDtos: MbNoteDto[] = notes.map((n) => ({
    id: n.id,
    authorParentId: n.authorParentId,
    chapter: n.chapter,
    startVerse: n.startVerse,
    endVerse: n.endVerse,
    ref: noteRef(bookSlug, n.chapter, n.startVerse, n.endVerse),
    color: isMbColor(n.color) ? n.color : null,
    situationKey: n.situationKey,
    childRepliedAt: n.childRepliedAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    items: n.items.map(
      (i): MbItemDto => ({
        id: i.id,
        authorKind: i.authorKind,
        authorParentId: i.authorParentId,
        kind: i.kind,
        body: i.body,
        stickerKey: isMbSticker(i.stickerKey) ? i.stickerKey : null,
        createdAt: i.createdAt.toISOString(),
        mine:
          viewer.kind === "parent"
            ? i.authorKind === "PARENT" && i.authorParentId === viewer.parentId
            : i.authorKind === "CHILD" && i.authorChildId === viewer.childId,
      }),
    ),
  }));

  const children = viewer.kind === "parent" ? viewer.children : [];
  return {
    viewer: viewer.kind,
    childId,
    childName: child?.displayName ?? "",
    children,
    siblings: children.filter((c) => c.id !== childId),
    authors,
    highlights: highlights.map((h) => ({
      id: h.id,
      authorParentId: h.authorParentId,
      chapter: h.chapter,
      verse: h.verse,
      color: isMbColor(h.color) ? h.color : null,
      star: h.star,
      underline: h.underline,
    })),
    notes: noteDtos,
    familyPass: args.familyPass,
    seeds,
  };
}

/** Stamp per storage chapter of one book for a child. */
export async function loadBookStamps(childId: string, bookSlug: string): Promise<Record<number, "waiting" | "shared" | "highlights">> {
  const [notes, hl] = await Promise.all([
    prisma.mbNote.findMany({ where: { subProfileId: childId, bookSlug }, select: { chapter: true, childRepliedAt: true } }),
    prisma.mbHighlight.groupBy({ by: ["chapter"], where: { subProfileId: childId, bookSlug }, _count: { _all: true } }),
  ]);
  const byChapter = new Map<number, { childRepliedAt: Date | null }[]>();
  for (const n of notes) {
    const list = byChapter.get(n.chapter) ?? [];
    list.push(n);
    byChapter.set(n.chapter, list);
  }
  const hlCount = new Map(hl.map((h) => [h.chapter, h._count._all]));
  const out: Record<number, "waiting" | "shared" | "highlights"> = {};
  for (const ch of new Set([...byChapter.keys(), ...hlCount.keys()])) {
    const stamp = chapterStamp(byChapter.get(ch) ?? [], hlCount.get(ch) ?? 0);
    if (stamp) out[ch] = stamp;
  }
  return out;
}

export async function childSeedCount(childId: string): Promise<number> {
  const rows = await prisma.mbNote.findMany({
    where: { subProfileId: childId, childRepliedAt: { not: null } },
    select: { bookSlug: true, chapter: true, childRepliedAt: true },
  });
  return seedCount(rows);
}

/** Child banner: newest note the child hasn't answered, in a chapter not opened since it arrived. */
export async function childNewNote(childId: string): Promise<{
  bookSlug: string;
  chapter: number;
  startVerse: number | null;
  ref: string;
  roleLabel: string;
} | null> {
  const notes = await prisma.mbNote.findMany({
    where: { subProfileId: childId, childRepliedAt: null },
    orderBy: { lastActivityAt: "desc" },
    take: 20,
    select: { bookSlug: true, chapter: true, startVerse: true, endVerse: true, authorParentId: true, lastActivityAt: true },
  });
  if (notes.length === 0) return null;
  const seen = await prisma.mbChapterSeen.findMany({
    where: { subProfileId: childId, OR: notes.map((n) => ({ bookSlug: n.bookSlug, chapter: n.chapter })) },
    select: { bookSlug: true, chapter: true, seenAt: true },
  });
  const seenMap = new Map(seen.map((s) => [`${s.bookSlug}:${s.chapter}`, s.seenAt.getTime()]));
  const fresh = notes.find((n) => (seenMap.get(`${n.bookSlug}:${n.chapter}`) ?? 0) < n.lastActivityAt.getTime());
  if (!fresh) return null;
  const parents = await linkedParents(childId);
  return {
    bookSlug: fresh.bookSlug,
    chapter: fresh.chapter,
    startVerse: fresh.startVerse,
    ref: noteRef(fresh.bookSlug, fresh.chapter, fresh.startVerse, fresh.endVerse),
    roleLabel: parents.find((p) => p.parentId === fresh.authorParentId)?.roleLabel ?? "Parent",
  };
}

/** Parent banner: unseen child replies on this parent's notes. */
export async function parentUnseenReplies(parentId: string): Promise<{
  count: number;
  latest: { childId: string; childName: string; bookSlug: string; chapter: number; startVerse: number | null; ref: string } | null;
}> {
  const rows = await prisma.mbNotification.findMany({
    where: { parentAccountId: parentId, seenAt: null, child: { active: true } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      subProfileId: true,
      child: { select: { displayName: true } },
      note: { select: { bookSlug: true, chapter: true, startVerse: true, endVerse: true } },
    },
  });
  if (rows.length === 0) return { count: 0, latest: null };
  const r0 = rows[0]!;
  return {
    count: rows.length,
    latest: {
      childId: r0.subProfileId,
      childName: r0.child.displayName,
      bookSlug: r0.note.bookSlug,
      chapter: r0.note.chapter,
      startVerse: r0.note.startVerse,
      ref: noteRef(r0.note.bookSlug, r0.note.chapter, r0.note.startVerse, r0.note.endVerse),
    },
  };
}
