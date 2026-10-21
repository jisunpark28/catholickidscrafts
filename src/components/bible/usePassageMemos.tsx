"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { PLUS_PRICE_LABEL } from "@/lib/subscription/plan-copy";
import {
  DEFAULT_MEMO_COLOR,
  MEMO_BODY_MAX,
  MEMO_COLORS,
  authorMemoLabel,
  formatMemoDate,
  memoColor,
  type MemoColor,
  type MemoVisibility,
  type PassageMemoDto,
  type PassageMemoSetup,
} from "@/lib/bible-memos/passage-memos";
import {
  offsetsToVerseRange,
  verseAtOffset,
  verseRangeToOffsets,
} from "@/lib/bible-memos/verse-offsets";
import { normalizePassageText } from "@/lib/typing-accuracy";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import "@/styles/passage-memos.css";

type Args = {
  bookSlug: string;
  bookName: string;
  chapter: number;
  text: string;
  setup: PassageMemoSetup | null;
};

type Draft = { start: number; end: number; startVerse: number; endVerse: number; quote: string };
type Anchor = { top: number; left: number; bottom: number };

const SUBSCRIBE_HREF = "/subscribe";
const MY_MEMOS_HREF = "/account/memos";
const POPOVER_W = 340;

function ciOf(node: Node | null): number | null {
  let el: Node | null = node;
  while (el && el.nodeType !== Node.ELEMENT_NODE) el = el.parentNode;
  const span = (el as Element | null)?.closest?.("[data-ci]");
  if (!span) return null;
  const n = Number(span.getAttribute("data-ci"));
  return Number.isFinite(n) ? n : null;
}

/** Character [start, end) of a DOM selection inside the passage element. */
function selectionToOffsets(passage: HTMLElement, sel: Selection): { start: number; end: number } | null {
  if (sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!passage.contains(range.commonAncestorContainer)) return null;
  const spans = passage.querySelectorAll<HTMLElement>("[data-ci]");
  let first: number | null = null;
  let last: number | null = null;
  // Robust for selections that start/end on the <p> itself or between spans.
  for (const span of spans) {
    if (!range.intersectsNode(span)) continue;
    const i = Number(span.dataset.ci);
    if (span.contains(range.startContainer) && range.startOffset >= (span.textContent?.length ?? 1)) continue;
    if (span.contains(range.endContainer) && range.endOffset === 0) continue;
    if (first === null) first = i;
    last = i;
  }
  if (first === null || last === null) return null;
  return { start: first, end: last + 1 };
}

function trimRange(text: string, start: number, end: number) {
  let a = start;
  let b = end;
  while (a < b && /\s/.test(text[a]!)) a++;
  while (b > a && /\s/.test(text[b - 1]!)) b--;
  return a < b ? { start: a, end: b } : null;
}

/** Color swatches (radio group) for the write/edit popup. */
export function MemoColorPicker({
  value,
  onChange,
  label,
  name,
}: {
  value: MemoColor;
  onChange: (c: MemoColor) => void;
  label: string;
  name: string;
}) {
  return (
    <fieldset className="mt-3">
      <legend className="mb-1 text-[13px] font-semibold">{label}</legend>
      <div className="flex gap-2">
        {MEMO_COLORS.map((c) => (
          <label key={c.key} className="cursor-pointer" title={c.label}>
            <input
              type="radio"
              name={name}
              value={c.key}
              checked={value === c.key}
              onChange={() => onChange(c.key)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="block h-7 w-7 rounded-full border-2 border-white shadow-[0_0_0_1px_#d1d5db] peer-checked:shadow-[0_0_0_2px_#1f2937] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#1d4ed8]"
              style={{ background: c.swatch }}
            />
            <span className="sr-only">{c.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** "Only me" / "Share with family" segmented toggle. */
export function MemoVisibilityToggle({
  value,
  onChange,
  disabled,
  onlyMeLabel,
  shareLabel,
  size = "md",
}: {
  value: MemoVisibility;
  onChange: (v: MemoVisibility) => void;
  disabled?: boolean;
  onlyMeLabel: string;
  shareLabel: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";
  const opt = (v: MemoVisibility, icon: string, text: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={value === v}
      disabled={disabled}
      onClick={() => value !== v && onChange(v)}
      className={`${pad} font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
        value === v ? "bg-[#d9580f] text-white" : "bg-white text-[var(--color-ink)] hover:bg-[#fff4ec]"
      }`}
    >
      <span aria-hidden>{icon}</span> {text}
    </button>
  );
  return (
    <div role="radiogroup" className="inline-flex overflow-hidden rounded-full border border-[#e3d9cc]">
      {opt("PRIVATE", "\u{1F512}", onlyMeLabel)}
      {opt("FAMILY", "\u{1F46A}", shareLabel)}
    </div>
  );
}

function verseRef(bookName: string, chapter: number, a: number, b: number) {
  return a === b ? `${bookName} ${chapter}:${a}` : `${bookName} ${chapter}:${a}–${b}`;
}

export function usePassageMemos({ bookSlug, bookName, chapter, text, setup }: Args) {
  const copy = useSiteCopy();
  const t = useCallback((key: string, fallback: string) => textFromCopy(copy, key, fallback), [copy]);
  const target = useMemo(() => normalizePassageText(text), [text]);
  const enabled = Boolean(setup && setup.verseTable.length === target.length);
  const signedIn = Boolean(setup?.signedIn);
  const paid = Boolean(setup?.paid && signedIn);

  const passageRef = useRef<HTMLParagraphElement | null>(null);
  const typingFocusRef = useRef<(() => void) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dialogId = useId();

  const [memos, setMemos] = useState<PassageMemoDto[]>([]);
  const [selection, setSelection] = useState<(Draft & { anchor: Anchor }) | null>(null);
  const [editor, setEditor] = useState<(Draft & { anchor: Anchor }) | null>(null);
  const [upsell, setUpsell] = useState<Anchor | null>(null);
  const [viewing, setViewing] = useState<{ memo: PassageMemoDto; anchor: Anchor } | null>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [tapMode, setTapMode] = useState<{ firstVerse: number | null } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"view" | "edit" | "confirm">("view");
  const [editBody, setEditBody] = useState("");
  const [color, setColor] = useState<MemoColor>(DEFAULT_MEMO_COLOR);
  const [visibility, setVisibility] = useState<MemoVisibility>("PRIVATE");
  const [editColor, setEditColor] = useState<MemoColor>(DEFAULT_MEMO_COLOR);
  const [editVisibility, setEditVisibility] = useState<MemoVisibility>("PRIVATE");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Load memos for any signed-in reader (after cancel, existing memos stay viewable/deletable).
  useEffect(() => {
    if (!enabled || !signedIn) return;
    let cancelled = false;
    fetch(`/api/bible/memos?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${chapter}`)
      .then((r) => (r.ok ? r.json() : { memos: [] }))
      .then((d: { memos?: PassageMemoDto[]; total?: number }) => {
        if (cancelled) return;
        setMemos(d.memos ?? []);
        setTotal(d.total ?? d.memos?.length ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, signedIn, bookSlug, chapter]);

  const memoRange = useCallback(
    (m: PassageMemoDto): { start: number; end: number } | null => {
      if (!setup) return null;
      const sameText = m.textVersion === setup.textVersion;
      if (sameText && m.startOffset != null && m.endOffset != null && m.endOffset <= target.length) {
        return { start: m.startOffset, end: m.endOffset };
      }
      return verseRangeToOffsets(setup.verseTable, m.startVerse, m.endVerse);
    },
    [setup, target.length],
  );

  const { hlByChar, memoEndAt } = useMemo(() => {
    const hl = new Map<number, PassageMemoDto>();
    const ends = new Map<number, PassageMemoDto>();
    for (const m of memos) {
      const r = memoRange(m);
      if (!r) continue;
      for (let i = r.start; i < r.end; i++) hl.set(i, m);
      ends.set(r.end - 1, m);
    }
    return { hlByChar: hl, memoEndAt: ends };
  }, [memos, memoRange]);

  const anchorFor = useCallback((rect: DOMRect): Anchor | null => {
    const pane = passageRef.current?.parentElement;
    if (!pane) return null;
    const p = pane.getBoundingClientRect();
    return { top: rect.top - p.top, bottom: rect.bottom - p.top, left: rect.left - p.left + rect.width / 2 };
  }, []);

  const anchorForRange = useCallback(
    (start: number, end: number): Anchor | null => {
      const passage = passageRef.current;
      if (!passage) return null;
      const a = passage.querySelector(`[data-ci="${start}"]`);
      const b = passage.querySelector(`[data-ci="${end - 1}"]`);
      if (!a || !b) return null;
      const range = document.createRange();
      range.setStartBefore(a);
      range.setEndAfter(b);
      return anchorFor(range.getBoundingClientRect());
    },
    [anchorFor],
  );

  const makeDraft = useCallback(
    (start: number, end: number): Draft | null => {
      if (!setup) return null;
      const r = trimRange(target, start, end);
      if (!r) return null;
      const { startVerse, endVerse } = offsetsToVerseRange(setup.verseTable, r.start, r.end);
      return { ...r, startVerse, endVerse, quote: target.slice(r.start, r.end) };
    },
    [setup, target],
  );

  const closeAll = useCallback(
    (restoreFocus = true) => {
      setEditor(null);
      setUpsell(null);
      setViewing(null);
      setViewMode("view");
      setEditBody("");
      setSelection(null);
      setBody("");
      setError("");
      window.getSelection()?.removeAllRanges();
      if (restoreFocus) requestAnimationFrame(() => typingFocusRef.current?.());
    },
    [],
  );

  const openFor = useCallback(
    (d: Draft & { anchor: Anchor }) => {
      setSelection(null);
      setViewing(null);
      if (!paid) {
        setUpsell(d.anchor);
        return;
      }
      setBody("");
      setColor(DEFAULT_MEMO_COLOR);
      setVisibility("PRIVATE");
      setError("");
      setEditor(d);
    },
    [paid],
  );

  // Detect text selections inside the passage.
  useEffect(() => {
    if (!enabled) return;
    const onUp = () => {
      const passage = passageRef.current;
      const sel = window.getSelection();
      if (!passage || !sel || tapMode || editor) return;
      const offs = selectionToOffsets(passage, sel);
      if (!offs) {
        setSelection(null);
        return;
      }
      const draft = makeDraft(offs.start, offs.end);
      if (!draft) return setSelection(null);
      const anchor = anchorFor(sel.getRangeAt(0).getBoundingClientRect());
      if (anchor) setSelection({ ...draft, anchor });
    };
    const onUpDeferred = () => window.setTimeout(onUp, 0);
    document.addEventListener("mouseup", onUpDeferred);
    document.addEventListener("touchend", onUpDeferred);
    document.addEventListener("keyup", onUpDeferred);
    // Mobile long-press selection handles do not fire mouseup.
    let timer: number | undefined;
    const onSelChange = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onUp, 350);
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => {
      document.removeEventListener("mouseup", onUpDeferred);
      document.removeEventListener("touchend", onUpDeferred);
      document.removeEventListener("keyup", onUpDeferred);
      document.removeEventListener("selectionchange", onSelChange);
      window.clearTimeout(timer);
    };
  }, [enabled, tapMode, editor, makeDraft, anchorFor]);

  // Hide floating UI when the passage pane scrolls.
  useEffect(() => {
    const passage = passageRef.current;
    if (!passage || !enabled) return;
    const onScroll = () => setSelection(null);
    passage.addEventListener("scroll", onScroll, { passive: true });
    return () => passage.removeEventListener("scroll", onScroll);
  }, [enabled, memos.length]);

  // Tap-first-verse / tap-last-verse mode.
  useEffect(() => {
    const passage = passageRef.current;
    if (!passage || !tapMode || !setup) return;
    const onClick = (e: MouseEvent) => {
      const ci = ciOf(e.target as Node);
      if (ci === null) return;
      e.preventDefault();
      const verse = verseAtOffset(setup.verseTable, ci);
      if (tapMode.firstVerse === null) {
        setTapMode({ firstVerse: verse });
        return;
      }
      const r = verseRangeToOffsets(setup.verseTable, tapMode.firstVerse, verse);
      setTapMode(null);
      if (!r) return;
      const draft = makeDraft(r.start, r.end);
      const anchor = anchorForRange(r.start, r.end);
      if (!draft || !anchor) return;
      openFor({ ...draft, anchor });
    };
    passage.addEventListener("click", onClick);
    passage.classList.add("passage-memo-tapmode");
    return () => {
      passage.removeEventListener("click", onClick);
      passage.classList.remove("passage-memo-tapmode");
    };
  }, [tapMode, setup, makeDraft, anchorForRange, openFor]);

  useEffect(() => {
    if (editor) requestAnimationFrame(() => textareaRef.current?.focus());
  }, [editor]);

  // Escape closes any memo popover.
  useEffect(() => {
    if (!editor && !upsell && !viewing && !tapMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTapMode(null);
        closeAll();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editor, upsell, viewing, tapMode, closeAll]);

  const save = useCallback(async () => {
    if (!editor || !setup || saving) return;
    if (!body.trim()) {
      setError(t("bible.memo.empty", "Write a memo first."));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bible/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug,
          chapter,
          startVerse: editor.startVerse,
          endVerse: editor.endVerse,
          startOffset: editor.start,
          endOffset: editor.end,
          quotedText: editor.quote,
          textVersion: setup.textVersion,
          body: body.trim(),
          color,
          visibility,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { memo?: PassageMemoDto; error?: string };
      if (!res.ok || !data.memo) {
        setError(res.status === 403 ? t("bible.memo.upsell_title", "Memos are part of the family subscription") : data.error ?? t("bible.memo.error", "Could not save memo. Please try again."));
        return;
      }
      setMemos((list) => [...list, data.memo!].sort((a, b) => a.startVerse - b.startVerse));
      setTotal((n) => n + 1);
      setStatus(t("bible.memo.saved", "Memo saved."));
      closeAll();
    } catch {
      setError(t("bible.memo.error", "Could not save memo. Please try again."));
    } finally {
      setSaving(false);
    }
  }, [editor, setup, saving, body, color, visibility, bookSlug, chapter, t, closeAll]);

  const remove = useCallback(
    async (memo: PassageMemoDto) => {
      const res = await fetch(`/api/bible/memos/${encodeURIComponent(memo.id)}`, { method: "DELETE" });
      if (res.ok) {
        setMemos((list) => list.filter((m) => m.id !== memo.id));
        setTotal((n) => Math.max(0, n - 1));
        setStatus(t("bible.memo.deleted", "Memo deleted."));
        closeAll();
      } else {
        setError(t("bible.memo.delete_error", "Could not delete memo. Please try again."));
      }
    },
    [t, closeAll],
  );

  const update = useCallback(
    async (memo: PassageMemoDto) => {
      const next = editBody.trim();
      if (!next) {
        setError(t("bible.memo.empty", "Write a memo first."));
        return;
      }
      setSaving(true);
      setError("");
      try {
        const res = await fetch(`/api/bible/memos/${encodeURIComponent(memo.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: next, color: editColor, visibility: editVisibility }),
        });
        const data = (await res.json().catch(() => ({}))) as { memo?: PassageMemoDto; error?: string };
        if (!res.ok || !data.memo) {
          setError(
            res.status === 403
              ? t("bible.memo.edit_locked", "Editing memos needs Plus.")
              : data.error ?? t("bible.memo.error", "Could not save memo. Please try again."),
          );
          return;
        }
        const saved = data.memo;
        setMemos((list) => list.map((m) => (m.id === saved.id ? saved : m)));
        setViewing((v) => (v ? { ...v, memo: saved } : v));
        setViewMode("view");
        setStatus(t("bible.memo.saved", "Memo saved."));
      } catch {
        setError(t("bible.memo.error", "Could not save memo. Please try again."));
      } finally {
        setSaving(false);
      }
    },
    [editBody, editColor, editVisibility, t],
  );

  const jumpTo = useCallback(
    (memo: PassageMemoDto) => {
      const r = memoRange(memo);
      const passage = passageRef.current;
      if (!r || !passage) return;
      const span = passage.querySelector<HTMLElement>(`[data-ci="${r.start}"]`);
      if (!span) return;
      passage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const pRect = passage.getBoundingClientRect();
      const sRect = span.getBoundingClientRect();
      passage.scrollTo({ top: passage.scrollTop + sRect.top - pRect.top - pRect.height / 3, behavior: "smooth" });
      setFlashId(memo.id);
      window.setTimeout(() => setFlashId(null), 1500);
    },
    [memoRange],
  );

  const pendingRange = editor ?? selection;

  const passageCharClassName = useCallback(
    (i: number) => {
      if (pendingRange && i >= pendingRange.start && i < pendingRange.end && editor) return "passage-memo-pending";
      const m = hlByChar.get(i);
      if (!m) return undefined;
      const base = `passage-memo-hl passage-memo-c-${memoColor(m.color).key}`;
      return m.id === flashId ? `${base} passage-memo-flash` : base;
    },
    [pendingRange, editor, hlByChar, flashId],
  );

  const renderAfterPassageChar = useCallback(
    (i: number) => {
      const memo = memoEndAt.get(i);
      if (!memo) return null;
      const ref = verseRef(bookName, chapter, memo.startVerse, memo.endVerse);
      const shared = memo.visibility === "FAMILY";
      return (
        <button
          type="button"
          className={`passage-memo-pencil${memo.mine ? "" : " passage-memo-pencil-shared"}`}
          style={{ background: memoColor(memo.color).swatch }}
          aria-label={`${memo.mine ? t("bible.memo.open", "Open memo") : authorMemoLabel(memo.authorName)}: ${ref}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            const anchor = anchorFor((e.currentTarget as HTMLElement).getBoundingClientRect());
            if (anchor) {
              setSelection(null);
              setEditor(null);
              setViewMode("view");
              setError("");
              setViewing({ memo, anchor });
            }
          }}
        >
          <span aria-hidden>{shared ? "\u{1F46A}" : "✎"}</span>
        </button>
      );
    },
    [memoEndAt, bookName, chapter, t, anchorFor],
  );

  if (!enabled) {
    return { typingProps: {}, panel: null };
  }

  const popoverStyle = (a: Anchor): React.CSSProperties => {
    const paneW = passageRef.current?.parentElement?.clientWidth ?? 600;
    const w = Math.min(POPOVER_W, paneW - 16);
    const left = Math.max(8, Math.min(a.left - w / 2, paneW - w - 8));
    return { position: "absolute", top: a.bottom + 10, left, width: w, zIndex: 30 };
  };

  const cardShell =
    "passage-memo-ui rounded-2xl border border-[#eadfce] bg-white p-4 text-left text-[var(--color-ink)] shadow-[0_12px_32px_rgba(60,40,20,0.18)]";
  const sheetShell =
    "passage-memo-ui fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-[#eadfce] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-left text-[var(--color-ink)] shadow-[0_-8px_28px_rgba(60,40,20,0.2)]";
  const btnPrimary =
    "rounded-full bg-[#d9580f] px-5 py-2 text-sm font-bold text-white hover:bg-[#c04d0c] disabled:opacity-60";
  const btnGhost =
    "rounded-full border border-[#e3d9cc] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-ink)] hover:border-[#d9580f]";
  const wrap = (a: Anchor, labelledBy: string, children: React.ReactNode) =>
    isMobile ? (
      <div role="dialog" aria-labelledby={labelledBy} className={sheetShell}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e3d9cc]" aria-hidden />
        {children}
      </div>
    ) : (
      <div role="dialog" aria-labelledby={labelledBy} className={cardShell} style={popoverStyle(a)}>
        {children}
      </div>
    );

  const lock = <span aria-hidden>🔒</span>;

  const addButton = selection && !editor && !upsell && (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => openFor(selection)}
      className="passage-memo-ui absolute z-30 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#d9580f] bg-white px-3 py-1.5 text-xs font-bold text-[#d9580f] shadow-md hover:bg-[#fff4ec]"
      style={{ top: Math.max(0, selection.anchor.top - 40), left: selection.anchor.left }}
    >
      {t("bible.memo.add", "Add memo")} {!paid && lock}
    </button>
  );

  const upsellCard =
    upsell &&
    wrap(
      upsell,
      `${dialogId}-up`,
      <>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff1e6]" aria-hidden>
            🔒
          </span>
          <h3 id={`${dialogId}-up`} className="text-base font-bold">
            {t("bible.memo.upsell_title", "Memos are part of the family subscription")}
          </h3>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t("bible.memo.upsell_body", "Typing the Bible is free. Subscribe to save memos on your favourite passages.")}
        </p>
        <p className="mt-3 text-xl font-bold">
          {t("bible.memo.upsell_price", PLUS_PRICE_LABEL)}
          <span className="text-sm font-normal text-[var(--color-muted)]">{t("bible.memo.upsell_period", "/mo")}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={SUBSCRIBE_HREF} className={btnPrimary} autoFocus>
            {t("bible.memo.upsell_cta", "Start subscription")}
          </Link>
          <button type="button" className={btnGhost} onClick={() => closeAll()}>
            {t("bible.memo.upsell_dismiss", "Not now")}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {t("bible.memo.upsell_footnote", "Your typing progress and stickers stay free.")}
          {!setup?.signedIn && (
            <>
              {" "}
              <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
                {t("bible.memo.upsell_signin", "Already subscribed? Sign in")}
              </Link>
            </>
          )}
        </p>
      </>,
    );

  const visTag = (v: MemoVisibility) =>
    v === "FAMILY" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] font-semibold text-[#3730a3]">
        <span aria-hidden>{"\u{1F46A}"}</span> {t("bible.memo.shared", "Shared with family")}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efe9] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)]">
        {lock} {t("bible.memo.private", "Only me")}
      </span>
    );
  const quoteStyle = (c: string) => ({ background: memoColor(c).bg, borderLeftColor: memoColor(c).swatch });
  const colorLabel = t("bible.memo.color", "Highlight color");
  const onlyMeLabel = t("bible.memo.only_me", "Only me");
  const shareLabel = t("bible.memo.share_family", "Share with family");

  const editorCard =
    editor &&
    wrap(
      editor.anchor,
      `${dialogId}-ed`,
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 id={`${dialogId}-ed`} className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            {t("bible.memo.eyebrow", "Memo")} · {verseRef(bookName, chapter, editor.startVerse, editor.endVerse)}
          </h3>
          {visTag(visibility)}
        </div>
        <blockquote className="mt-2 max-h-28 overflow-y-auto rounded-r-lg border-l-4 px-3 py-2 text-sm italic" style={quoteStyle(color)}>
          “{editor.quote}”
        </blockquote>
        <label htmlFor={`${dialogId}-body`} className="sr-only">
          {t("bible.memo.eyebrow", "Memo")}
        </label>
        <textarea
          id={`${dialogId}-body`}
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MEMO_BODY_MAX}
          rows={isMobile ? 3 : 3}
          placeholder={t("bible.memo.placeholder", "Write what this passage means to you…")}
          className="mt-2 w-full rounded-xl border border-[#e3d9cc] px-3 py-2 text-sm focus:border-[#d9580f] focus:outline-none focus:ring-2 focus:ring-[#d9580f]/30"
          aria-describedby={error ? `${dialogId}-err` : undefined}
        />
        <p className="mt-1 text-right text-xs text-[var(--color-muted)]">
          {body.length} / {MEMO_BODY_MAX}
        </p>
        <MemoColorPicker value={color} onChange={setColor} label={colorLabel} name={`${dialogId}-color`} />
        <div className="mt-3">
          <MemoVisibilityToggle value={visibility} onChange={setVisibility} onlyMeLabel={onlyMeLabel} shareLabel={shareLabel} />
          {visibility === "FAMILY" && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {t("bible.memo.share_hint", "Your family can read this memo. Only you can edit it.")}
            </p>
          )}
        </div>
        {isMobile && <p className="mt-1 text-xs text-[var(--color-muted)]">{t("bible.memo.tip", "Tip: long-press to select words, or tap the first verse, then the last verse.")}</p>}
        {error && (
          <p id={`${dialogId}-err`} role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className={`mt-3 flex gap-2 ${isMobile ? "" : "justify-end"}`}>
          <button type="button" className={`${btnGhost} ${isMobile ? "flex-1 py-3" : ""}`} onClick={() => closeAll()}>
            {t("bible.memo.cancel", "Cancel")}
          </button>
          <button type="submit" disabled={saving} className={`${btnPrimary} ${isMobile ? "flex-1 py-3" : ""}`}>
            {saving ? t("bible.memo.saving", "Saving…") : t("bible.memo.save", "Save")}
          </button>
        </div>
      </form>,
    );

  const viewCard =
    viewing &&
    wrap(
      viewing.anchor,
      `${dialogId}-vw`,
      <>
        <div className="flex items-center justify-between gap-2">
          <h3 id={`${dialogId}-vw`} className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            {t("bible.memo.eyebrow", "Memo")} · {verseRef(bookName, chapter, viewing.memo.startVerse, viewing.memo.endVerse)}
          </h3>
          {visTag(viewMode === "edit" ? editVisibility : viewing.memo.visibility)}
        </div>
        {!viewing.memo.mine && (
          <p className="mt-1 text-sm font-semibold text-[#3730a3]">
            <span aria-hidden>{"\u{1F46A}"}</span> {authorMemoLabel(viewing.memo.authorName)}
          </p>
        )}
        <blockquote
          className="mt-2 max-h-28 overflow-y-auto rounded-r-lg border-l-4 px-3 py-2 text-sm italic"
          style={quoteStyle(viewMode === "edit" ? editColor : viewing.memo.color)}
        >
          “{viewing.memo.quotedText}”
        </blockquote>
        {!viewing.memo.mine ? (
          <>
            <p className="mt-2 whitespace-pre-wrap text-sm">{viewing.memo.body}</p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {viewing.memo.authorName} · {formatMemoDate(viewing.memo.createdAt)} · {t("bible.memo.read_only", "Read only")}
            </p>
            <div className="mt-3 flex justify-end">
              <button type="button" className={btnGhost} autoFocus onClick={() => closeAll()}>
                {t("bible.memo.close", "Close")}
              </button>
            </div>
          </>
        ) : viewMode === "edit" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void update(viewing.memo);
            }}
          >
            <label htmlFor={`${dialogId}-edit`} className="sr-only">
              {t("bible.memo.eyebrow", "Memo")}
            </label>
            <textarea
              id={`${dialogId}-edit`}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              maxLength={MEMO_BODY_MAX}
              rows={4}
              autoFocus
              className="mt-2 w-full rounded-xl border border-[#d9580f] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9580f]/30"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--color-muted)]">
              <span>
                {t("bible.memo.last_edited", "Last edited")} {formatMemoDate(viewing.memo.updatedAt)}
              </span>
              <span>
                {editBody.length} / {MEMO_BODY_MAX}
              </span>
            </div>
            <MemoColorPicker value={editColor} onChange={setEditColor} label={colorLabel} name={`${dialogId}-ecolor`} />
            <div className="mt-3">
              <MemoVisibilityToggle
                value={editVisibility}
                onChange={setEditVisibility}
                onlyMeLabel={onlyMeLabel}
                shareLabel={shareLabel}
              />
            </div>
            {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex gap-2">
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? t("bible.memo.saving", "Saving…") : t("bible.memo.save", "Save")}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setViewMode("view");
                  setError("");
                }}
              >
                {t("bible.memo.cancel", "Cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="mt-2 whitespace-pre-wrap text-sm">{viewing.memo.body}</p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {t("bible.memo.created", "Created")} {formatMemoDate(viewing.memo.createdAt)}
              {viewing.memo.updatedAt !== viewing.memo.createdAt && (
                <>
                  {" · "}
                  {t("bible.memo.last_edited", "Last edited")} {formatMemoDate(viewing.memo.updatedAt)}
                </>
              )}
            </p>
            {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {paid ? (
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => {
                    setEditBody(viewing.memo.body);
                    setEditColor(viewing.memo.color);
                    setEditVisibility(viewing.memo.visibility);
                    setError("");
                    setViewMode("edit");
                  }}
                >
                  {t("bible.memo.edit", "Edit")}
                </button>
              ) : (
                <Link href={SUBSCRIBE_HREF} className={`${btnGhost} text-[var(--color-muted)]`}>
                  {lock} {t("bible.memo.edit_plus", "Edit · Plus")}
                </Link>
              )}
              <button
                type="button"
                className={`${btnGhost} text-red-600`}
                onClick={() => setViewMode("confirm")}
              >
                {t("bible.memo.delete_short", "Delete")}
              </button>
              <button type="button" className="ml-auto text-sm font-semibold text-[var(--color-muted)] hover:underline" onClick={() => closeAll()}>
                {t("bible.memo.close", "Close")}
              </button>
            </div>
            {viewMode === "confirm" && (
              <div role="alertdialog" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
                {t("bible.memo.delete_confirm", "Delete this memo? This can't be undone.")}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    autoFocus
                    className="rounded-full bg-red-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-800"
                    onClick={() => void remove(viewing.memo)}
                  >
                    {t("bible.memo.delete", "Delete memo")}
                  </button>
                  <button type="button" className={btnGhost} onClick={() => setViewMode("view")}>
                    {t("bible.memo.keep", "Keep")}
                  </button>
                </div>
              </div>
            )}
            {!paid && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                {t("bible.memo.plan_ended", "Your Plus plan has ended.")}{" "}
                <Link href={SUBSCRIBE_HREF} className="font-semibold text-[var(--color-link)]">
                  {t("bible.memo.renew", "Renew")} · {PLUS_PRICE_LABEL}/month
                </Link>
              </p>
            )}
          </>
        )}
        <p className="mt-3 text-right text-xs">
          <Link href={MY_MEMOS_HREF} className="font-semibold text-[var(--color-link)]">
            {t("bible.memo.my_memos", "My memos")} ({total}) →
          </Link>
        </p>
      </>,
    );

  const tapBanner = tapMode && (
    <div
      role="status"
      className={`passage-memo-ui ${isMobile ? "fixed inset-x-3 bottom-4" : "absolute inset-x-2 top-0"} z-[60] flex items-center justify-between gap-3 rounded-xl bg-[#1f1a17] px-4 py-2.5 text-sm text-white shadow-lg`}
    >
      <span>
        {tapMode.firstVerse === null
          ? t("bible.memo.tap_first", "Tap the first verse.")
          : t("bible.memo.tap_last", "Selecting from {ref}. Now tap the last verse.").replace(
              "{ref}",
              `${chapter}:${tapMode.firstVerse}`,
            )}
      </span>
      <button type="button" className="font-bold text-[#f9c97a]" onClick={() => setTapMode(null)}>
        {t("bible.memo.cancel", "Cancel")}
      </button>
    </div>
  );

  const passageAddon = (
    <>
      {!tapMode && !editor && (
        <button
          type="button"
          onClick={() => {
            closeAll(false);
            setTapMode({ firstVerse: null });
          }}
          className="passage-memo-ui absolute right-2 top-0 z-20 inline-flex items-center gap-1 rounded-full border border-[#e3d9cc] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-muted)] hover:border-[#d9580f] hover:text-[#d9580f]"
        >
          ✎ {t("bible.memo.select_verses", "Select verses")} {!paid && lock}
        </button>
      )}
      {tapBanner}
      {addButton}
      {upsellCard}
      {editorCard}
      {viewCard}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </>
  );

  const panel = paid || memos.length > 0 ? (
    <section aria-labelledby={`${dialogId}-list`} className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
      <h2 id={`${dialogId}-list`} className="text-sm font-bold text-[var(--color-ink)]">
        {t("bible.memo.list_title", "Memos in this chapter")}{" "}
        <span className="font-normal text-[var(--color-muted)]">({memos.length})</span>
        <Link href={MY_MEMOS_HREF} className="float-right text-xs font-semibold text-[var(--color-link)]">
          {t("bible.memo.my_memos", "My memos")} ({total}) →
        </Link>
      </h2>
      {memos.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t("bible.memo.list_empty", "Select words in the passage and choose Add memo.")}
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {memos.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => jumpTo(m)}
                className="w-full rounded-xl border border-[#eee6db] border-l-4 bg-white p-3 text-left hover:bg-[#fffaf5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1d4ed8]"
                style={{ borderLeftColor: memoColor(m.color).swatch }}
              >
                <span className="flex justify-between gap-2 text-xs font-semibold text-[var(--color-muted)]">
                  <span>
                    {verseRef(bookName, chapter, m.startVerse, m.endVerse)}
                    {m.visibility === "FAMILY" && (
                      <span className="ml-1 text-[#3730a3]">
                        <span aria-hidden>{"\u{1F46A}"}</span> {m.mine ? t("bible.memo.shared_short", "Shared") : authorMemoLabel(m.authorName)}
                      </span>
                    )}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </span>
                <span className="mt-1 line-clamp-2 block rounded-md px-2 py-1 text-xs italic" style={{ background: memoColor(m.color).bg }}>“{m.quotedText}”</span>
                <span className="mt-1 line-clamp-3 block text-sm">{m.body}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">{paid
          ? t("bible.memo.list_hint", "Tap a memo to jump to its verse. Memos are private unless you share them with your family.")
          : t("bible.memo.list_hint_readonly", "Your Plus plan has ended, so memos are read-only. You can still view and delete them.")}{" "}
        {!paid && (
          <Link href={SUBSCRIBE_HREF} className="font-semibold text-[var(--color-link)]">
            {lock} {t("bible.memo.upsell_cta", "Start subscription")}
          </Link>
        )}
      </p>
    </section>
  ) : null;

  return {
    typingProps: {
      passageCharClassName,
      renderAfterPassageChar,
      passageAddon,
      onPassageElement: (el: HTMLParagraphElement | null) => {
        passageRef.current = el;
      },
      typingFocusRef,
    },
    panel,
  };
}
