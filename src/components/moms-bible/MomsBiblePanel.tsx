"use client";

import type { BibleReaderSegment } from "@/components/bible/BibleChapterReadClient";
import { SITUATION_GROUPS, getSituation } from "@/data/moms-bible/situations";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { MB_COLORS, MB_COLOR_INFO, MB_LIMITS, MB_STICKERS, stickerLabel, type MbColorKey, type MbStickerKey } from "@/lib/moms-bible/constants";
import type { MbNoteDto } from "@/lib/moms-bible/types";
import { clip, ownerVerseMap, ownerVerseTexts } from "@/lib/moms-bible/verse-text";
import Link from "next/link";
import { useMemo, useState } from "react";
import { mbFetch } from "./mb-fetch";
import type { MomsBibleState } from "./useMomsBible";
import "@/styles/moms-bible.css";

type VerseInfo = { chapter: number; verse: number; ref: string; id?: string; text: string };

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

const PLUS_HREF = "/subscribe";

function useVerseIndex(segments: readonly BibleReaderSegment[], refBookName: string) {
  return useMemo(() => {
    const map = new Map<string, VerseInfo>();
    const order: VerseInfo[] = [];
    for (const s of segments) {
      const owners = ownerVerseMap(s.verseMarkers, s.verseLabels);
      const texts = ownerVerseTexts(normalizePassageText(s.text), s.verseMarkers, owners);
      for (const l of s.verseLabels) {
        if (l.continued || l.douay) continue;
        const info: VerseInfo = {
          chapter: s.douayChapter,
          verse: l.verse,
          ref: `${refBookName} ${l.ref}`,
          id: l.id,
          text: texts.get(l.verse) ?? "",
        };
        map.set(`${s.douayChapter}:${l.verse}`, info);
        order.push(info);
      }
    }
    return { map, order };
  }, [segments, refBookName]);
}

function scrollToVerse(id?: string) {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function MomsBiblePanel({ mb, bookSlug, refBookName, segments, initialSituation }: Props) {
  const { view } = mb;
  const verses = useVerseIndex(segments, refBookName);
  const roleOf = (parentId: string | null) => view.authors.find((a) => a.parentId === parentId)?.roleLabel ?? "Parent";
  const visibleNotes = view.notes.filter((n) => !mb.showTabs || !mb.activeAuthor || n.authorParentId === mb.activeAuthor);
  const letters = visibleNotes.filter((n) => n.startVerse === null);
  const verseNotes = visibleNotes.filter((n) => n.startVerse !== null);
  const isParent = view.viewer === "parent";
  const tabAuthors = isParent
    ? view.authors
    : view.authors.filter((a) => view.notes.some((n) => n.authorParentId === a.parentId) || view.highlights.some((h) => h.authorParentId === a.parentId));

  return (
    <aside className="bible-reader__notes mb-panel" aria-labelledby="mb-panel-title">
      <div className="mb-panel__head">
        <h2 id="mb-panel-title" className="mb-panel__title">
          <span aria-hidden>💌</span> {isParent ? "Mom's Bible" : "Notes for you"}
        </h2>
        {!isParent && (
          <span className="mb-seeds" title="Seeds: chapters where you answered a note">
            <span aria-hidden>🌱</span> {view.seeds}
          </span>
        )}
      </div>

      {isParent && view.children.length > 1 && (
        <label className="mb-switcher">
          <span className="sr-only">Whose Bible</span>
          <select value={view.childId} onChange={(e) => void mb.switchChild(e.target.value)} disabled={mb.loading}>
            {view.children.map((c) => (
              <option key={c.id} value={c.id}>
                Viewing {c.displayName}&apos;s Bible
              </option>
            ))}
          </select>
        </label>
      )}
      {isParent && view.children.length === 1 && (
        <p className="mb-panel__sub">Viewing {view.childName}&apos;s Bible</p>
      )}

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
            </button>
          ))}
        </div>
      )}

      {isParent && !view.familyPass && (
        <div className="mb-card mb-card--lock">
          <p className="font-semibold">🔒 New notes and highlights need Plus</p>
          <p className="mt-1 text-xs">
            Everything already written stays here to read. {view.childName} can still answer notes waiting for a reply.
          </p>
          <Link href={PLUS_HREF} className="mb-btn mb-btn--primary mt-2 inline-block">
            See Plus
          </Link>
        </div>
      )}

      {isParent && (
        <ParentTools mb={mb} bookSlug={bookSlug} verses={verses} initialSituation={initialSituation ?? null} />
      )}

      {letters.map((n) => (
        <NoteCard key={n.id} note={n} mb={mb} roleLabel={roleOf(n.authorParentId)} verse={null} />
      ))}
      {verseNotes.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          mb={mb}
          roleLabel={roleOf(n.authorParentId)}
          verse={verses.map.get(`${n.chapter}:${n.startVerse}`) ?? null}
          endVerse={n.endVerse !== n.startVerse ? verses.map.get(`${n.chapter}:${n.endVerse}`) ?? null : null}
        />
      ))}

      {!isParent && letters.length + verseNotes.length === 0 && (
        <div className="mb-card mb-card--empty">
          <p>No notes in this chapter yet.</p>
          {view.highlights.length > 0 && <p className="mt-1 text-xs">Look for the coloured verses: they were marked just for you.</p>}
        </div>
      )}
    </aside>
  );
}

// ───────────────────────── Parent: palette, verse note, chapter letter ─────────────────────────

function SituationSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="mb-field">
      <span className="mb-field__label">Moment (optional)</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {SITUATION_GROUPS.map((g) => (
          <optgroup key={g.title} label={`${g.emoji} ${g.title}`}>
            {g.situations.map((s) => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function AlsoSendTo({ mb, value, onChange }: { mb: MomsBibleState; value: string[]; onChange: (v: string[]) => void }) {
  if (mb.view.siblings.length === 0) return null;
  return (
    <fieldset className="mb-also">
      {mb.view.siblings.map((c) => (
        <label key={c.id} className="mb-also__item">
          <input
            type="checkbox"
            checked={value.includes(c.id)}
            onChange={(e) => onChange(e.target.checked ? [...value, c.id] : value.filter((x) => x !== c.id))}
          />{" "}
          Also send to {c.displayName}
        </label>
      ))}
    </fieldset>
  );
}

function ParentTools({
  mb,
  bookSlug,
  verses,
  initialSituation,
}: {
  mb: MomsBibleState;
  bookSlug: string;
  verses: { map: Map<string, VerseInfo>; order: VerseInfo[] };
  initialSituation: string | null;
}) {
  const { view, selected } = mb;
  const [body, setBody] = useState("");
  const [endVerse, setEndVerse] = useState<number | null>(null);
  const [situation, setSituation] = useState(getSituation(initialSituation) ? initialSituation! : "");
  const [also, setAlso] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letter, setLetter] = useState("");
  const locked = !view.familyPass;
  const info = selected ? verses.map.get(`${selected.chapter}:${selected.verse}`) ?? null : null;
  const meId = view.authors.find((a) => a.isMe)?.parentId;
  const mine = selected
    ? view.highlights.find((h) => h.chapter === selected.chapter && h.verse === selected.verse && h.authorParentId === meId)
    : undefined;
  const chapters = [...new Set(verses.order.map((v) => v.chapter))];

  const rangeChoices = info
    ? verses.order.filter((v) => v.chapter === info.chapter && v.verse > info.verse).slice(0, 12)
    : [];

  async function run(fn: () => Promise<{ ok: boolean; error?: string; status?: number }>) {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return false;
    }
    await mb.refresh();
    return true;
  }

  async function mark(next: { color?: MbColorKey | null; star?: boolean; underline?: boolean }) {
    if (!selected) return;
    await run(() =>
      mbFetch("/api/moms-bible/highlights", "PUT", {
        childId: view.childId,
        book: bookSlug,
        chapter: selected.chapter,
        verse: selected.verse,
        color: next.color !== undefined ? next.color : mine?.color ?? null,
        star: next.star ?? mine?.star ?? false,
        underline: next.underline ?? mine?.underline ?? false,
        situationKey: situation || undefined,
        alsoChildIds: also.length ? also : undefined,
      }),
    );
  }

  async function saveNote() {
    if (!selected) return;
    const ok = await run(() =>
      mbFetch("/api/moms-bible/notes", "POST", {
        childId: view.childId,
        book: bookSlug,
        chapter: selected.chapter,
        startVerse: selected.verse,
        endVerse: endVerse ?? selected.verse,
        body,
        color: mine?.color ?? null,
        situationKey: situation || undefined,
        alsoChildIds: also.length ? also : undefined,
      }),
    );
    if (ok) {
      setBody("");
      setEndVerse(null);
    }
  }

  async function saveLetter() {
    const ok = await run(() =>
      mbFetch("/api/moms-bible/notes", "POST", {
        childId: view.childId,
        book: bookSlug,
        chapter: chapters[0],
        startVerse: null,
        body: letter,
        situationKey: situation || undefined,
        alsoChildIds: also.length ? also : undefined,
      }),
    );
    if (ok) {
      setLetter("");
      setLetterOpen(false);
    }
  }

  return (
    <>
      {!selected && (
        <p className="mb-hint">Tap a verse number to highlight it or leave a note for {view.childName}.</p>
      )}
      {selected && info && (
        <div className="mb-card mb-card--tools">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{info.ref}</p>
            <button type="button" className="mb-x" aria-label="Close" onClick={() => mb.setSelected(null)}>
              ×
            </button>
          </div>
          <div className="mb-palette" role="group" aria-label="Highlight">
            {MB_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={busy || locked}
                className={`mb-swatch ${MB_COLOR_INFO[c].className}${mine?.color === c ? " mb-swatch--on" : ""}`}
                aria-pressed={mine?.color === c}
                title={MB_COLOR_INFO[c].label}
                onClick={() => void mark({ color: mine?.color === c ? null : c })}
              >
                <span className="sr-only">{MB_COLOR_INFO[c].label}</span>
              </button>
            ))}
            <button
              type="button"
              disabled={busy || locked}
              className={`mb-chip${mine?.star ? " mb-chip--on" : ""}`}
              aria-pressed={Boolean(mine?.star)}
              onClick={() => void mark({ star: !mine?.star })}
            >
              ⭐ Star
            </button>
            <button
              type="button"
              disabled={busy || locked}
              className={`mb-chip${mine?.underline ? " mb-chip--on" : ""}`}
              aria-pressed={Boolean(mine?.underline)}
              onClick={() => void mark({ underline: !mine?.underline })}
            >
              <span className="underline decoration-dashed">U</span> Underline
            </button>
            {mine && (
              <button
                type="button"
                disabled={busy}
                className="mb-chip"
                onClick={() => void mark({ color: null, star: false, underline: false })}
              >
                Clear
              </button>
            )}
          </div>

          {!locked && (
            <div className="mt-3 space-y-2">
              <label className="mb-field">
                <span className="mb-field__label">Note or prayer for {view.childName}</span>
                <textarea
                  value={body}
                  maxLength={MB_LIMITS.parentText}
                  rows={4}
                  placeholder="When you feel sad, remember…"
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              {rangeChoices.length > 0 && (
                <label className="mb-field">
                  <span className="mb-field__label">Through verse</span>
                  <select value={endVerse ?? ""} onChange={(e) => setEndVerse(e.target.value ? Number(e.target.value) : null)}>
                    <option value="">Just this verse</option>
                    {rangeChoices.map((v) => (
                      <option key={v.verse} value={v.verse}>
                        {v.ref}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <SituationSelect value={situation} onChange={setSituation} />
              <AlsoSendTo mb={mb} value={also} onChange={setAlso} />
              <button type="button" className="mb-btn mb-btn--primary" disabled={busy || !body.trim()} onClick={() => void saveNote()}>
                {busy ? "Saving…" : "Leave note"}
              </button>
            </div>
          )}
        </div>
      )}

      {!locked && (
        <div className="mb-card mb-card--letter-compose">
          {!letterOpen ? (
            <button type="button" className="mb-btn mb-btn--ghost w-full" onClick={() => setLetterOpen(true)}>
              ✉️ Write a letter for this chapter
            </button>
          ) : (
            <div className="space-y-2">
              <label className="mb-field">
                <span className="mb-field__label">Chapter letter to {view.childName}</span>
                <textarea
                  value={letter}
                  maxLength={MB_LIMITS.parentText}
                  rows={5}
                  placeholder={`Dear ${view.childName}, …`}
                  onChange={(e) => setLetter(e.target.value)}
                />
              </label>
              {!selected && <SituationSelect value={situation} onChange={setSituation} />}
              {!selected && <AlsoSendTo mb={mb} value={also} onChange={setAlso} />}
              <div className="flex gap-2">
                <button type="button" className="mb-btn mb-btn--primary" disabled={busy || !letter.trim()} onClick={() => void saveLetter()}>
                  {busy ? "Saving…" : "Save letter"}
                </button>
                <button type="button" className="mb-btn mb-btn--ghost" onClick={() => setLetterOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mb-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

// ───────────────────────── Note card (both views) ─────────────────────────

function NoteCard({
  note,
  mb,
  roleLabel,
  verse,
  endVerse,
}: {
  note: MbNoteDto;
  mb: MomsBibleState;
  roleLabel: string;
  verse: VerseInfo | null;
  endVerse?: VerseInfo | null;
}) {
  const { view } = mb;
  const isParent = view.viewer === "parent";
  const isLetter = note.startVerse === null;
  const mineNote = isParent && view.authors.find((a) => a.isMe)?.parentId === note.authorParentId;
  const replied = Boolean(note.childRepliedAt);
  const canChildReply = !isParent && (view.familyPass || !replied);
  const [composerOpen, setComposerOpen] = useState(!replied);
  const [sticker, setSticker] = useState<MbStickerKey | null>(null);
  const [text, setText] = useState("");
  const [more, setMore] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorClass = note.color ? MB_COLOR_INFO[note.color].className : "";
  const quote = verse ? clip([verse.text, endVerse?.text].filter(Boolean).join(" … ")) : "";

  async function act(fn: () => ReturnType<typeof mbFetch>) {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return false;
    }
    await mb.refresh();
    return true;
  }

  async function sendReply() {
    const ok = await act(() =>
      mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { stickerKey: sticker, body: text.trim() || null }),
    );
    if (ok) {
      setSticker(null);
      setText("");
      setComposerOpen(false);
    }
  }

  async function addMore() {
    const ok = await act(() => mbFetch(`/api/moms-bible/notes/${note.id}/items`, "POST", { body: more }));
    if (ok) setMore("");
  }

  return (
    <article className={`mb-card mb-note ${isLetter ? "mb-note--letter" : ""}`}>
      <header className="mb-note__head">
        <p className="mb-note__ref">
          {isLetter ? `✉️ ${roleLabel}'s letter · ${note.ref}` : note.ref}
        </p>
        {verse?.id && (
          <button type="button" className="mb-link" onClick={() => scrollToVerse(verse.id)}>
            Open →
          </button>
        )}
      </header>
      {quote && <blockquote className={`mb-quote ${colorClass ? `mb-hl ${colorClass}` : ""}`}>“{quote}”</blockquote>}
      {note.situationKey && getSituation(note.situationKey) && (
        <p className="mb-tag">
          {getSituation(note.situationKey)!.emoji} {getSituation(note.situationKey)!.title}
        </p>
      )}

      <ul className="mb-thread">
        {note.items.map((i) => {
          const fromChild = i.authorKind === "CHILD";
          return (
            <li key={i.id} className={`mb-item ${fromChild ? "mb-item--child" : "mb-item--parent"}`}>
              {i.kind === "STICKER" && i.stickerKey ? (
                <span className="mb-sticker-chip">{stickerLabel(i.stickerKey, roleLabel)}</span>
              ) : (
                <p className="mb-item__body">{i.body}</p>
              )}
              <span className="mb-item__who">
                {fromChild ? (isParent ? view.childName : "You") : i.authorParentId ? roleOfItem(view, i.authorParentId) : roleLabel}
              </span>
              {i.mine && (
                <button
                  type="button"
                  className="mb-x"
                  aria-label="Delete"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Delete this?")) void act(() => mbFetch(`/api/moms-bible/items/${i.id}`, "DELETE"));
                  }}
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {replied ? (
        <p className="mb-stamp mb-stamp--shared" aria-label="Shared together">
          🌱 Shared Together
        </p>
      ) : isParent ? (
        <p className="mb-pill">💛 Waiting for {view.childName}</p>
      ) : null}

      {canChildReply && !composerOpen && (
        <button type="button" className="mb-btn mb-btn--ghost mt-2 w-full" onClick={() => setComposerOpen(true)}>
          Add another reply…
        </button>
      )}
      {canChildReply && composerOpen && (
        <div className="mb-reply">
          <div className="mb-stickers" role="group" aria-label="Stickers">
            {(Object.keys(MB_STICKERS) as MbStickerKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sticker === k}
                className={`mb-chip${sticker === k ? " mb-chip--on" : ""}`}
                onClick={() => setSticker(sticker === k ? null : k)}
              >
                {stickerLabel(k, roleLabel)}
              </button>
            ))}
          </div>
          <label className="mb-field">
            <span className="sr-only">Your reply</span>
            <textarea
              rows={3}
              value={text}
              maxLength={MB_LIMITS.childText}
              placeholder={`Write back to ${roleLabel} (optional)`}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)]">
              {[...text].length}/{MB_LIMITS.childText}
            </span>
            <button type="button" className="mb-btn mb-btn--primary" disabled={busy || (!sticker && !text.trim())} onClick={() => void sendReply()}>
              {busy ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      )}

      {mineNote && view.familyPass && (
        <div className="mt-2 flex gap-2">
          <input
            className="mb-input"
            value={more}
            maxLength={MB_LIMITS.parentText}
            placeholder="Add more…"
            onChange={(e) => setMore(e.target.value)}
          />
          <button
            type="button"
            className="mb-btn mb-btn--ghost"
            disabled={busy || !more.trim()}
            onClick={() => void addMore()}
          >
            Add
          </button>
        </div>
      )}
      {mineNote && (
        <button
          type="button"
          className="mb-link mt-2 text-xs"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Delete this note and its replies?")) void act(() => mbFetch(`/api/moms-bible/notes/${note.id}`, "DELETE"));
          }}
        >
          Delete note
        </button>
      )}
      {error && (
        <p className="mb-error" role="alert">
          {error}
          {/Plus/.test(error) && (
            <>
              {" "}
              <Link href={PLUS_HREF}>See Plus</Link>
            </>
          )}
        </p>
      )}
    </article>
  );
}

function roleOfItem(view: MomsBibleState["view"], parentId: string): string {
  const a = view.authors.find((x) => x.parentId === parentId);
  if (!a) return "Parent";
  return a.isMe ? "You" : a.roleLabel;
}
