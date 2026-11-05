"use client";

import { MB_COLOR_INFO, type MbColorKey } from "@/lib/moms-bible/constants";
import type { MbChapterView, MbHighlightDto } from "@/lib/moms-bible/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mbFetch, type MbResult } from "./mb-fetch";

export type MbSelection = { chapter: number; verse: number } | null;

export type MomsBibleState = ReturnType<typeof useMomsBible>;

function defaultAuthor(view: MbChapterView): string | null {
  if (view.viewer === "parent") return view.authors.find((a) => a.isMe)?.parentId ?? view.authors[0]?.parentId ?? null;
  // Child: whoever's note has the latest activity (a new note or the child's reply); other tabs get a dot.
  const last = (n: MbChapterView["notes"][number]) => (n.childRepliedAt && n.childRepliedAt > n.createdAt ? n.childRepliedAt : n.createdAt);
  const newest = [...view.notes].sort((a, b) => last(b).localeCompare(last(a)))[0];
  return newest?.authorParentId ?? view.highlights[0]?.authorParentId ?? view.authors[0]?.parentId ?? null;
}


/** Mom's Bible state for one reader page (shared by the passage and the notes column). */
export function useMomsBible(initial: MbChapterView, bookSlug: string, chapters: readonly number[]) {
  const [view, setView] = useState<MbChapterView>(initial);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(() => defaultAuthor(initial));
  const [selected, setSelected] = useState<MbSelection>(null);
  const [loading, setLoading] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chaptersKey = chapters.join(",");
  const isParent = view.viewer === "parent";
  const meId = view.authors.find((a) => a.isMe)?.parentId ?? null;
  /** Parent writes need the Family Pass; the sample never writes. */
  const canWrite = isParent && !view.preview && view.familyPass;
  /** Child: tap a verse to start a message to a linked parent (new threads need the Family Pass, like parents'). */
  const canChildMessage = !isParent && !view.preview && view.familyPass && view.authors.some((a) => a.linked);

  const refresh = useCallback(async () => {
    if (view.preview) return null;
    setLoading(true);
    const q = new URLSearchParams({ book: bookSlug, chapters: chaptersKey });
    if (view.viewer === "parent") q.set("child", view.childId);
    const res = await mbFetch<MbChapterView>(`/api/moms-bible/chapter?${q.toString()}`);
    setLoading(false);
    if (res.ok) {
      setView(res.data);
      return res.data;
    }
    return null;
  }, [bookSlug, chaptersKey, view.viewer, view.childId, view.preview]);

  /**
   * Run a write. Parents without Plus (and the sample) get the Plus modal instead of a request;
   * a 402 from the server opens it too (the server is the real gate).
   */
  const write = useCallback(
    async (fn: () => Promise<MbResult>, opts: { parentWrite?: boolean } = { parentWrite: true }): Promise<boolean> => {
      if (view.preview || (opts.parentWrite && isParent && !view.familyPass)) {
        setPlusOpen(true);
        return false;
      }
      setError(null);
      const res = await fn();
      if (!res.ok) {
        if (res.status === 402 && isParent) setPlusOpen(true);
        else setError(res.error);
        return false;
      }
      await refresh();
      return true;
    },
    [view.preview, view.familyPass, isParent, refresh],
  );

  // Seen state: the child opened these chapters; a parent saw replies in this child's chapter.
  const hasReplies = view.notes.some((n) => n.childRepliedAt);
  useEffect(() => {
    if (view.preview) return;
    const list = chaptersKey.split(",").map(Number);
    if (view.viewer === "child") {
      void mbFetch("/api/moms-bible/seen", "POST", { book: bookSlug, chapters: list });
    } else if (hasReplies) {
      void mbFetch("/api/moms-bible/notifications", "POST", { childId: view.childId, book: bookSlug, chapters: list });
    }
  }, [view.viewer, view.childId, view.preview, bookSlug, chaptersKey, hasReplies]);

  const showTabs = useMemo(() => {
    if (view.viewer === "parent") return view.authors.length > 1;
    const withContent = new Set([...view.notes.map((n) => n.authorParentId), ...view.highlights.map((h) => h.authorParentId)]);
    return withContent.size > 1;
  }, [view]);

  /** Highlights painted on the text: the active tab's author (all authors when there are no tabs). */
  const marks = useMemo(() => {
    const map = new Map<string, MbHighlightDto>();
    for (const h of view.highlights) {
      if (showTabs && activeAuthor && h.authorParentId !== activeAuthor) continue;
      map.set(`${h.chapter}:${h.verse}`, h);
    }
    return map;
  }, [view.highlights, showTabs, activeAuthor]);

  const myMark = useCallback(
    (chapter: number, verse: number) =>
      view.highlights.find((h) => h.chapter === chapter && h.verse === verse && h.authorParentId === meId),
    [view.highlights, meId],
  );

  const verseClass = useCallback(
    (chapter: number, verse: number): string | undefined => {
      const h = marks.get(`${chapter}:${verse}`);
      const cls: string[] = [];
      if (h?.color) cls.push(MB_COLOR_INFO[h.color].className);
      if (h?.star || h?.underline) cls.push("mb-v--star");
      if (selected && selected.chapter === chapter && selected.verse === verse) cls.push("mb-v--sel");
      return cls.length ? cls.join(" ") : undefined;
    },
    [marks, selected],
  );

  /** Palette: set/clear this parent's colour or star on the selected verse. */
  const mark = useCallback(
    async (next: { color?: MbColorKey | null; star?: boolean; clear?: boolean }, alsoChildIds: string[] = [], situationKey?: string) => {
      if (!selected) return false;
      const cur = myMark(selected.chapter, selected.verse);
      const body = next.clear
        ? { color: null, star: false, underline: false }
        : {
            color: next.color !== undefined ? next.color : cur?.color ?? null,
            star: next.star ?? cur?.star ?? false,
            underline: false,
          };
      return write(() =>
        mbFetch("/api/moms-bible/highlights", "PUT", {
          childId: view.childId,
          book: bookSlug,
          chapter: selected.chapter,
          verse: selected.verse,
          ...body,
          situationKey: situationKey || undefined,
          alsoChildIds: alsoChildIds.length ? alsoChildIds : undefined,
        }),
      );
    },
    [selected, myMark, write, view.childId, bookSlug],
  );

  return {
    view,
    bookSlug,
    loading,
    refresh,
    write,
    error,
    setError,
    plusOpen,
    setPlusOpen,
    activeAuthor,
    setActiveAuthor,
    showTabs,
    selected,
    setSelected,
    marks,
    myMark,
    mark,
    meId,
    canWrite,
    canChildMessage,
    verseClass,
    /** Parents (and the sample) tap verses to mark them; children tap one to send a message. */
    canSelectVerses: isParent || canChildMessage,
  };
}
