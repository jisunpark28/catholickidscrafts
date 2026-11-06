"use client";

import type { BibleReaderSegment } from "@/components/bible/BibleChapterReadClient";
import { SAMPLE_NOTE_TEXT } from "@/data/moms-bible/sample-genesis-1";
import { getSituation } from "@/data/moms-bible/situations";
import {
  MB_COLORS,
  MB_COLOR_INFO,
  MB_LIMITS,
  MB_STICKERS,
  colorLabel,
  prayerStarters,
  stickerLabel,
  type MbColorKey,
  type MbStickerKey,
} from "@/lib/moms-bible/constants";
import type { MbAuthorDto, MbItemDto, MbNoteDto } from "@/lib/moms-bible/types";
import { clip, ownerVerseMap, ownerVerseTexts } from "@/lib/moms-bible/verse-text";
import { normalizePassageText } from "@/lib/typing-accuracy";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mbFetch } from "./mb-fetch";
import type { MomsBibleState } from "./useMomsBible";
import "@/styles/moms-bible.css";

type VerseInfo = { chapter: number; verse: number; num: string; ref: string; id?: string; text: string };
type VerseIndex = Map<string, VerseInfo>;

/** Latest timestamp in a thread, so newer notes sort toward the bottom like a chat. */
function noteLastAt(note: MbNoteDto): string {
  let t = note.createdAt;
  if (note.childRepliedAt && note.childRepliedAt > t) t = note.childRepliedAt;
  for (const item of note.items) {
    if (item.createdAt > t) t = item.createdAt;
  }
  return t;
}

type Props = {
  mb: MomsBibleState;
  /** Storage book slug for API calls. */
  bookSlug: string;
  /** "Psalm" / "Genesis": prefix for official verse references. */
  refBookName: string;
  segments: readonly BibleReaderSegment[];
  /** ?situation= from "Open & leave a note" on the situations page. */
  initialSituation?: string | null;
};

const TZ = "America/Toronto";
const HEART: Record<MbColorKey, string> = { YELLOW: "💛", GREEN: "💚", BLUE: "💙", PINK: "🩷" };

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

function useVerseIndex(segments: readonly BibleReaderSegment[], refBookName: string): VerseIndex {
  return useMemo(() => {
    const map: VerseIndex = new Map();
    for (const s of segments) {
      const owners = ownerVerseMap(s.verseMarkers, s.verseLabels);
      const texts = ownerVerseTexts(normalizePassageText(s.text), s.verseMarkers, owners);
      for (const l of s.verseLabels) {
        if (l.continued || l.douay) continue;
        map.set(`${s.douayChapter}:${l.verse}`, {
          chapter: s.douayChapter,
          verse: l.verse,
          num: l.text,
          ref: `${refBookName} ${l.ref}`,
          id: l.id,
          text: texts.get(l.verse) ?? "",
        });
      }
    }
    return map;
  }, [segments, refBookName]);
}

function scrollToVerse(id?: string) {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cardColorClass(color: MbColorKey | null): string {
  return color ? `mb-card--${color.toLowerCase()}` : "mb-card--yellow";
}

// ───────────────────────── Palette (after the selected verse) ─────────────────────────

/** Floating palette under the selected verse (mockup 1): four colours + Star (+ Clear). */
export function MbPalette({ mb, situationKey }: { mb: MomsBibleState; situationKey?: string | null }) {
  const [busy, setBusy] = useState(false);
  const sel = mb.selected;
  if (!sel) return null;
  if (mb.view.viewer === "child") {
    // Child: the message box sits in the notes column (below the text on small screens).
    return (
      <div className="mb-palette" role="group" aria-label="Send a message about this verse" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="mb-palette__chip"
          onClick={() => document.getElementById("mb-composer")?.scrollIntoView({ behavior: "smooth", block: "center" })}
        >
          💌 Write a message ↓
        </button>
        <button type="button" className="mb-palette__chip mb-palette__chip--muted" onClick={() => mb.setSelected(null)}>
          ✕ Close
        </button>
      </div>
    );
  }
  const me = mb.view.authors.find((a) => a.isMe);
  const cur = mb.myMark(sel.chapter, sel.verse);
  const situation = getSituation(situationKey ?? null) ? situationKey! : undefined;
  const run = async (next: Parameters<MomsBibleState["mark"]>[0]) => {
    setBusy(true);
    await mb.mark(next, [], situation);
    setBusy(false);
  };
  return (
    <div className="mb-palette" role="group" aria-label="Highlight this verse" onClick={(e) => e.stopPropagation()}>
      {MB_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className="mb-palette__chip"
          disabled={busy}
          aria-pressed={cur?.color === c}
          onClick={() => void run(cur?.color === c && !cur.star ? { clear: true } : { color: cur?.color === c ? null : c })}
        >
          {MB_COLOR_INFO[c].emoji} {colorLabel(c, me?.roleLabel)}
        </button>
      ))}
      <button
        type="button"
        className="mb-palette__chip"
        disabled={busy}
        aria-pressed={Boolean(cur?.star)}
        onClick={() => void run(cur?.star && !cur.color ? { clear: true } : { star: !cur?.star })}
      >
        ⭐ Star
      </button>
      {cur && (
        <button type="button" className="mb-palette__chip mb-palette__chip--muted" disabled={busy} onClick={() => void run({ clear: true })}>
          ✕ Clear
        </button>
      )}
      {/* Small screens: the notes column sits below the text, so jump to the note box. */}
      <button
        type="button"
        className="mb-palette__chip lg:hidden"
        onClick={() => document.getElementById("mb-composer")?.scrollIntoView({ behavior: "smooth", block: "center" })}
      >
        ✏️ Write a note ↓
      </button>
    </div>
  );
}

// ───────────────────────── Notes column ─────────────────────────

export function MomsBiblePanel({ mb, bookSlug, refBookName, segments, initialSituation }: Props) {
  const { view } = mb;
  const verses = useVerseIndex(segments, refBookName);
  const isParent = view.viewer === "parent";
  const roleOf = (parentId: string | null) => view.authors.find((a) => a.parentId === parentId)?.roleLabel ?? "Parent";
  const me = view.authors.find((a) => a.isMe) ?? null;
  const situation = getSituation(initialSituation ?? null) ? initialSituation! : null;
  const [letterOpen, setLetterOpen] = useState(false);

  const visibleNotes = view.notes.filter((n) => !mb.showTabs || !mb.activeAuthor || n.authorParentId === mb.activeAuthor);
  const threadNotes = [...visibleNotes].sort((a, b) => noteLastAt(a).localeCompare(noteLastAt(b)));

  const sel = isParent ? mb.selected : null;
  // Child: a tapped verse opens a new message to a linked parent.
  const childSel = !isParent && mb.canChildMessage ? mb.selected : null;
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view.notes, letterOpen, sel, childSel]);
  const recipients = view.authors.filter((a) => a.linked);
  // A message the child started stays its own thread (parents answer it on its card).
  const myNoteAtSel = sel
    ? view.notes.find(
        (n) => n.chapter === sel.chapter && n.startVerse === sel.verse && n.authorParentId === me?.parentId && !n.startedByChild,
      ) ?? null
    : null;
  const selInfo = sel ? verses.get(`${sel.chapter}:${sel.verse}`) ?? null : null;
  const childSelInfo = childSel ? verses.get(`${childSel.chapter}:${childSel.verse}`) ?? null : null;
  // New compose cards sit at the bottom with the newest messages.

  const tabAuthors = isParent
    ? view.authors
    : view.authors.filter((a) => view.notes.some((n) => n.authorParentId === a.parentId) || view.highlights.some((h) => h.authorParentId === a.parentId));
  const hasDot = (parentId: string) =>
    view.notes.some((n) => n.authorParentId === parentId && (isParent ? n.unseenReply : !n.childRepliedAt));

  const draftCard =
    sel && selInfo && !myNoteAtSel ? (
      <article key="draft" className={`mb-card ${cardColorClass(mb.myMark(sel.chapter, sel.verse)?.color ?? null)}`}>
        <div className="mb-lbl">
          <span>
            💌 {me?.roleLabel ?? "Mom"}&apos;s Note · v.{selInfo.num}
          </span>
          <button type="button" className="mb-x normal-case" aria-label="Close" onClick={() => mb.setSelected(null)}>
            ×
          </button>
        </div>
        <Composer mb={mb} bookSlug={bookSlug} target={{ kind: "verse", info: selInfo }} note={null} situation={situation} />
      </article>
    ) : null;

  const childDraftCard =
    childSel && childSelInfo ? (
      <article key="child-draft" className={`mb-card ${cardColorClass(null)}`}>
        <div className="mb-lbl">
          <span>💌 My Message · v.{childSelInfo.num}</span>
          <button type="button" className="mb-x normal-case" aria-label="Close" onClick={() => mb.setSelected(null)}>
            ×
          </button>
        </div>
        {childSelInfo.text && <p className="mb-quote">{clip(childSelInfo.text)}</p>}
        <ChildMessageComposer mb={mb} bookSlug={bookSlug} info={childSelInfo} recipients={recipients} />
      </article>
    ) : null;

  const noteCards: ReactNode[] = threadNotes.map((n) => (
    <NoteCard
      key={n.id}
      note={n}
      mb={mb}
      roleLabel={roleOf(n.authorParentId)}
      verse={verses.get(`${n.chapter}:${n.startVerse}`) ?? null}
      endVerse={n.endVerse !== n.startVerse ? verses.get(`${n.chapter}:${n.endVerse}`) ?? null : null}
      composer={
        myNoteAtSel?.id === n.id && selInfo ? (
          <Composer mb={mb} bookSlug={bookSlug} target={{ kind: "verse", info: selInfo }} note={n} situation={situation} />
        ) : null
      }
    />
  ));
  if (draftCard) noteCards.push(draftCard);
  if (childDraftCard) noteCards.push(childDraftCard);

  return (
    <aside ref={panelRef} className="bible-reader__notes mb-panel" aria-label={isParent ? `${view.childName}'s Bible notes` : "Notes for you"}>
      {mb.showTabs && (
        <div className="mb-tabs" role="tablist">
          {tabAuthors.map((a) => (
            <button
              key={a.parentId}
              type="button"
              role="tab"
              aria-selected={mb.activeAuthor === a.parentId}
              className={`mb-tab${mb.activeAuthor === a.parentId ? " mb-tab--on" : ""}`}
              onClick={() => mb.setActiveAuthor(a.parentId)}
            >
              {a.roleLabel}&apos;s Notes
              {hasDot(a.parentId) && mb.activeAuthor !== a.parentId && <span className="mb-dot" aria-label="new" />}
            </button>
          ))}
        </div>
      )}

      {view.preview && (
        <div className="mb-card mb-card--notice">
          <div className="mb-lbl">✨ Sample · a peek at Mom&apos;s Bible</div>
          <p className="mt-2 text-sm">
            This is how highlights, notes and replies look in your child&apos;s own Bible. Tap a verse to try it.
          </p>
        </div>
      )}
      {isParent && !view.preview && !view.familyPass && <ExpiredReadOnlyNotice mb={mb} />}

      {isParent && !sel && (view.familyPass || view.preview) && (
        <p className="mb-hint">Tap a verse to highlight it or leave a note for {view.childName}.</p>
      )}
      {!isParent && mb.canChildMessage && !childSel && (
        <p className="mb-hint">Tap a verse to send a message to {recipients.map((r) => r.roleLabel).join(" or ")}.</p>
      )}

      {noteCards}

      {!isParent && threadNotes.length === 0 && !childDraftCard && (
        <div className="mb-card mb-card--plain">
          <p>No notes in this chapter yet.</p>
          {view.highlights.length > 0 && <p className="mt-1 text-xs text-[#8a7d96]">Look for the coloured verses: they were marked just for you.</p>}
        </div>
      )}

      {isParent && (view.familyPass || view.preview) && (
        letterOpen ? (
          <article className="mb-card mb-card--letter">
            <div className="mb-lbl">
              <span>📌 Chapter Letter</span>
              <button type="button" className="mb-x" aria-label="Close" onClick={() => setLetterOpen(false)}>
                ×
              </button>
            </div>
            <Composer
              mb={mb}
              bookSlug={bookSlug}
              target={{ kind: "letter", chapter: segments[0]?.douayChapter ?? 1 }}
              note={null}
              situation={situation}
              onDone={() => setLetterOpen(false)}
            />
          </article>
        ) : (
          <button type="button" className="mb-link self-start text-sm" onClick={() => setLetterOpen(true)}>
            ✉️ Write a chapter letter for {view.childName}
          </button>
        )
      )}

      {mb.error && (
        <p className="mb-error" role="alert">
          {mb.error}
        </p>
      )}
    </aside>
  );
}

/** A parent whose Plus ended (or never started): everything stays readable, new writes need Plus. */
export function ExpiredReadOnlyNotice({ mb }: { mb: MomsBibleState }) {
  const hasContent = mb.view.notes.length > 0 || mb.view.highlights.length > 0;
  return (
    <div className="mb-card mb-card--notice">
      <div className="mb-lbl">🔒 {hasContent ? "Read-only for now" : "Mom's Bible is a Plus feature"}</div>
      <p className="mt-2 text-sm">
        {hasContent
          ? `Everything already written stays here. ${mb.view.childName} can still answer notes waiting for a reply. Renew Plus to add new highlights and notes.`
          : `Highlight verses and leave notes and prayers in ${mb.view.childName}'s own Bible.`}
      </p>
      <button type="button" className="mb-btn mb-btn--primary mt-3" onClick={() => mb.setPlusOpen(true)}>
        ⭐ Get Plus
      </button>
    </div>
  );
}

// ───────────────────────── Parent composer (verse note / letter) ─────────────────────────

type ComposerTarget = { kind: "verse"; info: VerseInfo } | { kind: "letter"; chapter: number };

function Composer({
  mb,
  bookSlug,
  target,
  note,
  situation,
  onDone,
}: {
  mb: MomsBibleState;
  bookSlug: string;
  target: ComposerTarget;
  /** This parent's existing note on the verse: new text is added to its thread. */
  note: MbNoteDto | null;
  situation: string | null;
  onDone?: () => void;
}) {
  const { view } = mb;
  const [body, setBody] = useState("");
  const [also, setAlso] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [tag, setTag] = useState<string | null>(situation);
  const color = target.kind === "verse" ? mb.myMark(target.info.chapter, target.info.verse)?.color ?? note?.color ?? null : "PINK";
  const starters = prayerStarters(color, view.childName);
  const tagInfo = tag ? getSituation(tag) : null;

  const addStarter = (s: string) => {
    const t = s.replace(/…$/, "").trim();
    setBody((b) => (b.trim() ? `${b.trimEnd()} ${t} ` : `${t} `));
  };

  async function save() {
    setBusy(true);
    const ok = await mb.write(() =>
      note
        ? mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { body })
        : mbFetch("/api/moms-bible/notes", "POST", {
            childId: view.childId,
            book: bookSlug,
            chapter: target.kind === "verse" ? target.info.chapter : target.chapter,
            startVerse: target.kind === "verse" ? target.info.verse : null,
            endVerse: target.kind === "verse" ? target.info.verse : null,
            body,
            color: target.kind === "verse" ? color : null,
            situationKey: tag || undefined,
            alsoChildIds: also.length ? also : undefined,
          }),
    );
    setBusy(false);
    if (ok) {
      setBody("");
      setAlso([]);
      onDone?.();
    }
  }

  return (
    <div id={target.kind === "verse" ? "mb-composer" : undefined} onClick={(e) => e.stopPropagation()}>
      <div className="mb-compose-title">
        ✏️ {note ? "Add to this note" : target.kind === "letter" ? "Write a letter" : "Write a note"} — Prayer Starters
      </div>
      <div>
        {starters.map((s) => (
          <button key={s} type="button" className="mb-chip" onClick={() => addStarter(s)}>
            {HEART[color ?? "YELLOW"]} {s}
          </button>
        ))}
      </div>
      {tagInfo && !note && (
        <span className="mb-tag">
          {tagInfo.emoji} {tagInfo.title}
          <button type="button" aria-label="Remove moment" onClick={() => setTag(null)}>
            ×
          </button>
        </span>
      )}
      <label>
        <span className="sr-only">{target.kind === "letter" ? "Chapter letter" : "Note"}</span>
        <textarea
          className="mb-textarea"
          value={body}
          maxLength={MB_LIMITS.parentText}
          placeholder={target.kind === "letter" ? `Dear ${view.childName}, …` : `Write a note for ${view.childName}…`}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <div className="mb-compose-row">
        {!note &&
          view.siblings.map((c) => (
            <label key={c.id} className="mb-also">
              <input
                type="checkbox"
                checked={also.includes(c.id)}
                onChange={(e) => setAlso(e.target.checked ? [...also, c.id] : also.filter((x) => x !== c.id))}
              />
              Also send to {c.displayName}
            </label>
          ))}
        <button type="button" className="mb-btn mb-btn--primary" disabled={busy || !body.trim()} onClick={() => void save()}>
          {busy ? "Saving…" : target.kind === "letter" ? "Save letter 💌" : "Save note 💌"}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── Note card (both views) ─────────────────────────

type ItemGroup = { child: boolean; items: MbItemDto[] };

function groupItems(items: MbItemDto[]): ItemGroup[] {
  const out: ItemGroup[] = [];
  for (const i of items) {
    const child = i.authorKind === "CHILD";
    const last = out[out.length - 1];
    if (child && last?.child) last.items.push(i);
    else out.push({ child, items: [i] });
  }
  return out;
}

function NoteCard({
  note,
  mb,
  roleLabel,
  verse,
  endVerse,
  composer,
}: {
  note: MbNoteDto;
  mb: MomsBibleState;
  roleLabel: string;
  verse: VerseInfo | null;
  endVerse?: VerseInfo | null;
  composer?: ReactNode;
}) {
  const { view } = mb;
  const isParent = view.viewer === "parent";
  const isLetter = note.startVerse === null;
  const mineNote = isParent && mb.meId === note.authorParentId;
  const replied = Boolean(note.childRepliedAt);
  /** The child started this thread (a message to roleLabel). */
  const fromChild = Boolean(note.startedByChild);
  // A child's message is "Shared Together" once a parent answers it.
  const shared = fromChild ? note.items.some((i) => i.authorKind === "PARENT") : replied;
  const canReply = !isParent && !view.preview && (view.familyPass || !replied);
  const canParentAnswer = isParent && fromChild && mb.canWrite;
  const [busy, setBusy] = useState(false);
  const quote = verse ? clip([verse.text, endVerse?.text].filter(Boolean).join(" … ")) : "";
  const vLabel = verse ? `v.${verse.num}${endVerse ? `–${endVerse.num}` : ""}` : "";
  const sit = note.situationKey ? getSituation(note.situationKey) : null;

  async function del(paths: string[], ask: string) {
    if (!window.confirm(ask)) return;
    setBusy(true);
    await mb.write(
      async () => {
        let last = await mbFetch(paths[0]!, "DELETE");
        for (const p of paths.slice(1)) if (last.ok) last = await mbFetch(p, "DELETE");
        return last;
      },
      { parentWrite: false },
    );
    setBusy(false);
  }

  const openVerse = () => {
    if (!verse) return;
    scrollToVerse(verse.id);
    if (isParent) mb.setSelected({ chapter: verse.chapter, verse: verse.verse });
  };

  return (
    <article className={`mb-card ${isLetter ? "mb-card--letter" : cardColorClass(note.color)}`}>
      <div className="mb-lbl">
        {isLetter ? (
          <span>📌 Chapter Letter</span>
        ) : (
          <button type="button" className="text-left uppercase tracking-[0.5px]" onClick={openVerse} title="Show this verse">
            {fromChild ? `👧 ${isParent ? `${view.childName}'s` : "My"} Message to ${roleLabel}` : `💌 ${roleLabel}'s Note`}
            {vLabel ? ` · ${vLabel}` : ""}
          </button>
        )}
        {mineNote && !composer && !view.preview && (
          <button
            type="button"
            className="text-[11px] font-semibold normal-case tracking-normal text-[#a39aac] hover:underline"
            disabled={busy}
            onClick={() => void del([`/api/moms-bible/notes/${note.id}`], "Delete this note and its replies?")}
          >
            Delete
          </button>
        )}
      </div>
      {!isParent && quote && <p className="mb-quote">{quote}</p>}
      {sit && (
        <span className="mb-tag">
          {sit.emoji} {sit.title}
        </span>
      )}

      {groupItems(note.items).map((g, gi, all) =>
        g.child ? (
          <ChildBubble key={g.items[0]!.id} items={g.items} mb={mb} roleLabel={roleLabel} busy={busy} onDelete={del} />
        ) : (
          <div key={g.items[0]!.id}>
            <p className="mb-note-text">{g.items[0]!.body}</p>
            <div className="mb-date">
              {isParent ? "" : `From ${roleLabel} · `}
              {fmtDate(g.items[0]!.createdAt)}
              {isParent && g.items[0]!.authorParentId && g.items[0]!.authorParentId !== note.authorParentId
                ? ` · ${view.authors.find((a) => a.parentId === g.items[0]!.authorParentId)?.roleLabel ?? ""}`
                : ""}
              {isParent && !view.preview && !replied && gi === all.length - 1 && (
                <span className="mb-waiting-inline"> · 💛 Waiting for {view.childName}</span>
              )}
            </div>
          </div>
        ),
      )}

      {shared && (
        <div>
          <span className="mb-stamp">🌱 Shared Together</span>
        </div>
      )}

      {canReply && (replied ? <MoreReply note={note} mb={mb} /> : <FirstReply note={note} mb={mb} roleLabel={roleLabel} />)}
      {canParentAnswer && <ParentAnswer note={note} mb={mb} />}
      {composer}
    </article>
  );
}

function ChildBubble({
  items,
  mb,
  roleLabel,
  busy,
  onDelete,
}: {
  items: MbItemDto[];
  mb: MomsBibleState;
  roleLabel: string;
  busy: boolean;
  onDelete: (paths: string[], ask: string) => Promise<void>;
}) {
  const sticker = items.find((i) => i.kind === "STICKER" && i.stickerKey);
  const allTexts = items.filter((i) => i.kind === "TEXT" && i.body);
  const firstLine = sticker?.stickerKey ? stickerLabel(sticker.stickerKey, roleLabel) : allTexts[0]?.body;
  const texts = sticker ? allTexts : allTexts.slice(1);
  const last = items[items.length - 1]!;
  const mine = items.filter((i) => i.mine);
  return (
    <div className="mb-bubble-row">
      <div className="mb-bubble">
        <div className="mb-bubble__line">
          <b>👧 {mb.view.childName}:</b> {firstLine}
        </div>
        {texts.map((t) => (
          <div key={t.id} className="mb-bubble__line">
            {t.body}
          </div>
        ))}
        <div className="mb-date">
          {fmtDate(last.createdAt)} · {fmtTime(last.createdAt)}
          {mine.length > 0 && !mb.view.preview && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onDelete(mine.map((i) => `/api/moms-bible/items/${i.id}`), "Delete this reply?")}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FirstReply({ note, mb, roleLabel }: { note: MbNoteDto; mb: MomsBibleState; roleLabel: string }) {
  const [sticker, setSticker] = useState<MbStickerKey | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    const ok = await mb.write(
      () => mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { stickerKey: sticker, body: text.trim() || null }),
      { parentWrite: false },
    );
    setBusy(false);
    if (ok) {
      setSticker(null);
      setText("");
    }
  }
  return (
    <div className="mt-3">
      <div role="group" aria-label="Stickers">
        {(Object.keys(MB_STICKERS) as MbStickerKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={sticker === k}
            className={`mb-chip mb-chip--${k}`}
            onClick={() => setSticker(sticker === k ? null : k)}
          >
            {stickerLabel(k, roleLabel)}
          </button>
        ))}
      </div>
      <label>
        <span className="sr-only">Your reply</span>
        <textarea
          className="mb-textarea"
          value={text}
          maxLength={MB_LIMITS.childText}
          placeholder={`Write a little reply to ${roleLabel}…`}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#a39aac]">
          {[...text].length}/{MB_LIMITS.childText}
        </span>
        <button type="button" className="mb-btn mb-btn--primary" disabled={busy || (!sticker && !text.trim())} onClick={() => void send()}>
          {busy ? "Sending…" : "Send reply"}
        </button>
      </div>
    </div>
  );
}

function MoreReply({ note, mb }: { note: MbNoteDto; mb: MomsBibleState }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    const ok = await mb.write(() => mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { body: text.trim() }), {
      parentWrite: false,
    });
    setBusy(false);
    if (ok) setText("");
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) void send();
      }}
    >
      <label className="flex min-w-0 flex-1">
        <span className="sr-only">Add another reply</span>
        <input
          className="mb-reply-input"
          value={text}
          maxLength={MB_LIMITS.childText}
          placeholder="Add another reply…"
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="submit" className="mb-btn mb-btn--primary" disabled={busy || !text.trim()}>
        Send
      </button>
    </form>
  );
}

/**
 * Child: a new message on the tapped verse to one linked parent (Mom / Dad chips when there are
 * several): one of the 3 stickers and/or up to 200 characters, the same as a reply.
 */
function ChildMessageComposer({
  mb,
  bookSlug,
  info,
  recipients,
}: {
  mb: MomsBibleState;
  bookSlug: string;
  info: VerseInfo;
  recipients: MbAuthorDto[];
}) {
  const initial = (mb.showTabs && recipients.find((r) => r.parentId === mb.activeAuthor)) || recipients[0];
  const [to, setTo] = useState<string | null>(initial?.parentId ?? null);
  const [sticker, setSticker] = useState<MbStickerKey | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const role = recipients.find((r) => r.parentId === to)?.roleLabel ?? "Mom";
  async function send() {
    if (!to) return;
    setBusy(true);
    const ok = await mb.write(
      () =>
        mbFetch("/api/moms-bible/messages", "POST", {
          book: bookSlug,
          chapter: info.chapter,
          verse: info.verse,
          toParentId: to,
          stickerKey: sticker,
          body: text.trim() || null,
        }),
      { parentWrite: false },
    );
    setBusy(false);
    if (ok) {
      setSticker(null);
      setText("");
      mb.setActiveAuthor(to);
      mb.setSelected(null);
    }
  }
  return (
    <div id="mb-composer" className="mt-3" onClick={(e) => e.stopPropagation()}>
      {recipients.length > 1 && (
        <div role="group" aria-label="Send to" className="mb-2">
          {recipients.map((r) => (
            <button key={r.parentId} type="button" aria-pressed={to === r.parentId} className="mb-chip" onClick={() => setTo(r.parentId)}>
              💌 To {r.roleLabel}
            </button>
          ))}
        </div>
      )}
      <div role="group" aria-label="Stickers">
        {(Object.keys(MB_STICKERS) as MbStickerKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={sticker === k}
            className={`mb-chip mb-chip--${k}`}
            onClick={() => setSticker(sticker === k ? null : k)}
          >
            {stickerLabel(k, role)}
          </button>
        ))}
      </div>
      <label>
        <span className="sr-only">Your message</span>
        <textarea
          className="mb-textarea"
          value={text}
          maxLength={MB_LIMITS.childText}
          placeholder={`Write a little message to ${role}…`}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#a39aac]">
          {[...text].length}/{MB_LIMITS.childText}
        </span>
        <button
          type="button"
          className="mb-btn mb-btn--primary"
          disabled={busy || !to || (!sticker && !text.trim())}
          onClick={() => void send()}
        >
          {busy ? "Sending…" : `Send to ${role} 💌`}
        </button>
      </div>
    </div>
  );
}

/** Parent: write back on a message the child started (needs the Family Pass, like any parent write). */
function ParentAnswer({ note, mb }: { note: MbNoteDto; mb: MomsBibleState }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    const ok = await mb.write(() => mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { body: text }));
    setBusy(false);
    if (ok) setText("");
  }
  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <label>
        <span className="sr-only">Reply to {mb.view.childName}</span>
        <textarea
          className="mb-textarea"
          value={text}
          maxLength={MB_LIMITS.parentText}
          placeholder={`Write back to ${mb.view.childName}…`}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="mb-compose-row">
        <button type="button" className="mb-btn mb-btn--primary" disabled={busy || !text.trim()} onClick={() => void send()}>
          {busy ? "Saving…" : "Send reply 💌"}
        </button>
      </div>
    </div>
  );
}

/** Guests: what a note looks like (mockup 5), plus where to start. */
export function SampleNoteCard() {
  return (
    <div className="mb-card mb-card--sample">
      <div className="mb-lbl">Sample Mom&apos;s Note</div>
      <p className="mb-note-text">{SAMPLE_NOTE_TEXT}</p>
      <Link href="/bible/read/genesis/1" className="mb-link text-xs">
        See a full sample in Genesis 1 →
      </Link>
    </div>
  );
}
