"use client";

import { MB_CHILD_COOKIE, MB_COLOR_INFO } from "@/lib/moms-bible/constants";
import type { MbChapterView, MbHighlightDto } from "@/lib/moms-bible/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mbFetch } from "./mb-fetch";

export type MbSelection = { chapter: number; verse: number } | null;

export type MomsBibleState = ReturnType<typeof useMomsBible>;

function defaultAuthor(view: MbChapterView): string | null {
  if (view.viewer === "parent") return view.authors.find((a) => a.isMe)?.parentId ?? view.authors[0]?.parentId ?? null;
  // Child: whoever wrote most recently in this chapter, else the first parent.
  const newest = [...view.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return newest?.authorParentId ?? view.highlights[0]?.authorParentId ?? view.authors[0]?.parentId ?? null;
}

/** Mom's Bible state for one reader page (shared by the passage and the notes column). */
export function useMomsBible(initial: MbChapterView, bookSlug: string, chapters: readonly number[]) {
  const [view, setView] = useState<MbChapterView>(initial);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(() => defaultAuthor(initial));
  const [selected, setSelected] = useState<MbSelection>(null);
  const [loading, setLoading] = useState(false);
  const chaptersKey = chapters.join(",");

  const load = useCallback(
    async (childId?: string) => {
      setLoading(true);
      const q = new URLSearchParams({ book: bookSlug, chapters: chaptersKey });
      if (view.viewer === "parent") q.set("child", childId ?? view.childId);
      const res = await mbFetch<MbChapterView>(`/api/moms-bible/chapter?${q.toString()}`);
      setLoading(false);
      if (res.ok) {
        setView(res.data);
        return res.data;
      }
      return null;
    },
    [bookSlug, chaptersKey, view.viewer, view.childId],
  );

  const refresh = useCallback(() => load(), [load]);

  const switchChild = useCallback(
    async (childId: string) => {
      document.cookie = `${MB_CHILD_COOKIE}=${encodeURIComponent(childId)}; path=/; max-age=31536000; samesite=lax`;
      setSelected(null);
      const next = await load(childId);
      if (next) setActiveAuthor(defaultAuthor(next));
    },
    [load],
  );

  // Seen state: the child opened these chapters; a parent saw replies in this child's chapter.
  const hasReplies = view.notes.some((n) => n.childRepliedAt);
  useEffect(() => {
    const list = chaptersKey.split(",").map(Number);
    if (view.viewer === "child") {
      void mbFetch("/api/moms-bible/seen", "POST", { book: bookSlug, chapters: list });
    } else if (hasReplies) {
      void mbFetch("/api/moms-bible/notifications", "POST", { childId: view.childId, book: bookSlug, chapters: list });
    }
  }, [view.viewer, view.childId, bookSlug, chaptersKey, hasReplies]);

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

  const noteVerses = useMemo(() => {
    const set = new Set<string>();
    for (const n of view.notes) {
      if (n.startVerse === null) continue;
      if (showTabs && activeAuthor && n.authorParentId !== activeAuthor) continue;
      set.add(`${n.chapter}:${n.startVerse}`);
    }
    return set;
  }, [view.notes, showTabs, activeAuthor]);

  const verseClass = useCallback(
    (chapter: number, verse: number): string | undefined => {
      const h = marks.get(`${chapter}:${verse}`);
      const cls: string[] = [];
      if (h?.color) cls.push("mb-hl", MB_COLOR_INFO[h.color].className);
      if (h?.underline) cls.push("mb-ul");
      if (selected && selected.chapter === chapter && selected.verse === verse) cls.push("mb-sel");
      return cls.length ? cls.join(" ") : undefined;
    },
    [marks, selected],
  );

  const verseBadge = useCallback(
    (chapter: number, verse: number): string | null => {
      const key = `${chapter}:${verse}`;
      const parts: string[] = [];
      if (marks.get(key)?.star) parts.push("⭐");
      if (noteVerses.has(key)) parts.push("💬");
      return parts.length ? parts.join("") : null;
    },
    [marks, noteVerses],
  );

  return {
    view,
    loading,
    refresh,
    switchChild,
    activeAuthor,
    setActiveAuthor,
    showTabs,
    selected,
    setSelected,
    marks,
    verseClass,
    verseBadge,
    canSelectVerses: view.viewer === "parent",
  };
}
