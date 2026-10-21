"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { MEMO_BODY_MAX } from "@/lib/bible-memos/passage-memos";
import {
  FREE_JOURNAL_LIMIT,
  JOURNAL_COLOR,
  JOURNAL_PREFIX,
  journalDraftKey,
  type FaithJournalState,
  type JournalEntry,
} from "@/lib/daily-mass/faith-journal-shared";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

type Props = {
  dateKey: string;
  gospelLabel?: string;
  readHref: string;
  questions: string[];
  lookFor: string;
  lookColorHex: string;
  journal: FaithJournalState;
};

type Notice = "saved" | "signin" | "plus" | "noanchor" | "error" | null;

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const NOTE_COLORS = ["#fff3b0", "#d9f2e3", "#e8defa"];
const NOTE_TILT = ["-rotate-[1.5deg]", "rotate-[1.2deg]", "-rotate-[0.6deg]"];

function readDraft(dateKey: string): string {
  try {
    return localStorage.getItem(journalDraftKey(dateKey)) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(dateKey: string, text: string) {
  try {
    if (text.trim()) localStorage.setItem(journalDraftKey(dateKey), text);
    else localStorage.removeItem(journalDraftKey(dateKey));
  } catch {
    /* private mode */
  }
}

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

/** First sentence of the "Look for this at Mass" prompt, for the small chip. */
function firstSentence(text: string): string {
  const m = /^[\s\S]*?[.!?](?=\s|$)/.exec(text.trim());
  return (m ? m[0] : text).trim();
}

/** Daily Mass "Our Faith Journal": one question of the week and one line to save what the child said. */
export function FaithJournalBanner({ dateKey, gospelLabel, readHref, questions, lookFor, lookColorHex, journal }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const baseId = useId();
  const [qIdx, setQIdx] = useState(0);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>(journal.entries);
  const [total, setTotal] = useState(journal.total);
  const [justUsedLast, setJustUsedLast] = useState(false);

  useEffect(() => {
    setText(readDraft(dateKey));
  }, [dateKey]);

  const isFree = journal.signedIn && !journal.paid;
  const freeLeft = Math.max(0, FREE_JOURNAL_LIMIT - total);
  const question = questions[qIdx % Math.max(1, questions.length)] ?? "";

  function onText(v: string) {
    setText(v);
    if (notice && notice !== "plus" && notice !== "signin") setNotice(null);
    writeDraft(dateKey, v);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || saving) return;
    writeDraft(dateKey, text);
    if (!journal.signedIn) return setNotice("signin");
    if (isFree && freeLeft <= 0) return setNotice("plus");
    if (!journal.anchor) return setNotice("noanchor");
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/bible/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...journal.anchor,
          body: `${JOURNAL_PREFIX}${text.trim()}`,
          color: JOURNAL_COLOR,
          visibility: "FAMILY",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { memo?: { id: string; createdAt: string; authorName: string } };
      if (res.status === 401) return setNotice("signin");
      if (res.status === 403) {
        if (isFree) setTotal((n) => Math.max(n, FREE_JOURNAL_LIMIT));
        return setNotice("plus");
      }
      if (!res.ok || !data.memo) return setNotice("error");
      const saved: JournalEntry = { id: data.memo.id, text: text.trim(), createdAt: data.memo.createdAt, authorName: data.memo.authorName };
      setEntries((list) => [saved, ...list].slice(0, 3));
      setTotal((n) => n + 1);
      setJustUsedLast(isFree && freeLeft === 1);
      writeDraft(dateKey, "");
      setText("");
      setNotice("saved");
    } catch {
      setNotice("error");
    } finally {
      setSaving(false);
    }
  }

  const plusLink = (
    <Link href="/subscribe" className={`font-extrabold text-[#2e7d32] ${FOCUS}`}>
      {t("daily_mass.journal.plus", "Keep every entry with Plus")} <span aria-hidden>→</span>
    </Link>
  );
  const draftKept = t("daily_mass.journal.draft_kept", "Your draft is kept on this device.");

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="dm-journal relative overflow-hidden rounded-[20px] border border-[#f5d9bf] bg-[linear-gradient(135deg,#fff3e6,#fff8f1_60%,#fffaf4)] p-4 shadow-[0_12px_28px_-18px_rgba(211,84,0,0.45)] sm:rounded-3xl sm:px-[22px] sm:py-5"
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#ffe1c4] opacity-50" />

      <div className="relative flex flex-wrap items-center gap-2.5">
        <h2 id={`${baseId}-title`} className="m-0 text-[0.9375em] font-extrabold tracking-[0.02em] text-[#b84a00]">
          <span aria-hidden>✍️ </span>
          {t("daily_mass.journal.title", "Our Faith Journal")}
        </h2>
        {gospelLabel ? (
          <span className="whitespace-nowrap rounded-full border border-[#f5d9bf] bg-white px-2.5 py-0.5 text-[0.78em] font-bold text-[#b84a00] sm:ml-auto">
            {gospelLabel} ·{" "}
            <Link href={readHref} className={`text-[#d35400] ${FOCUS}`}>
              {t("daily_mass.journal.read", "Read")} <span aria-hidden>→</span>
              <span className="sr-only"> {t("daily_mass.journal.read_sr", "today's Gospel")}</span>
            </Link>
          </span>
        ) : null}
      </div>

      <div className="relative mb-3.5 mt-3 flex flex-wrap items-start gap-x-3 gap-y-2">
        <p aria-live="polite" className="dm-ink m-0 min-w-0 basis-full text-[1.3em] font-extrabold sm:flex-1 sm:basis-0 leading-snug text-[#1c1c1c] sm:text-[1.55em]">
          <span aria-hidden className="text-[#f0b98a]">“</span>
          {question}
          <span aria-hidden className="text-[#f0b98a]">”</span>
        </p>
        {questions.length > 1 ? (
          <div className="flex flex-none gap-1.5 pt-0.5 max-sm:order-2">
            <button
              type="button"
              aria-label={t("daily_mass.journal.prev", "Previous question")}
              onClick={() => setQIdx((i) => (i - 1 + questions.length) % questions.length)}
              className={`grid h-8 w-8 place-items-center rounded-full border border-[#f5d9bf] bg-white text-lg font-extrabold leading-none text-[#d35400] hover:bg-[#fff1e3] ${FOCUS}`}
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              aria-label={t("daily_mass.journal.next", "Next question")}
              onClick={() => setQIdx((i) => (i + 1) % questions.length)}
              className={`grid h-8 w-8 place-items-center rounded-full border border-[#f5d9bf] bg-white text-lg font-extrabold leading-none text-[#d35400] hover:bg-[#fff1e3] ${FOCUS}`}
            >
              <span aria-hidden>›</span>
            </button>
          </div>
        ) : null}
        <div className="min-w-0 max-sm:order-1 max-sm:flex-1 sm:basis-full">
          <span className="dm-card inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#e8a46d] bg-white px-2.5 py-0.5 text-[0.78em] text-[#4b5563]">
            <span aria-hidden className="h-2.5 w-2.5 flex-none rounded-full border border-black/10" style={{ background: lookColorHex }} />
            <span>
              <b className="font-semibold">{t("daily_mass.family.look_for", "Look for this at Mass")}:</b> {firstSentence(lookFor)}
            </span>
          </span>
        </div>
      </div>

      <form onSubmit={save} className="dm-card relative flex items-center gap-2.5 rounded-2xl border-[1.5px] border-[#f0d4bb] bg-white py-1.5 pl-3.5 pr-1.5 shadow-[inset_0_-2px_0_#fde7d6] focus-within:border-[#d35400]">
        <label htmlFor={`${baseId}-input`} className="sr-only">
          {t("daily_mass.journal.input_label", "What your child said about today's Gospel")}
        </label>
        <input
          id={`${baseId}-input`}
          type="text"
          value={text}
          maxLength={MEMO_BODY_MAX - JOURNAL_PREFIX.length}
          onChange={(e) => onText(e.target.value)}
          placeholder={t("daily_mass.journal.placeholder", "Write what your child said…")}
          autoComplete="off"
          className="dm-ink h-9 min-w-0 flex-1 border-0 bg-[repeating-linear-gradient(transparent_0_30px,#f6dcc4_30px_31px)] text-base leading-[31px] text-[#1c1c1c] outline-none placeholder:italic placeholder:text-[#b9a796]"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className={`flex-none rounded-xl bg-[#d35400] px-3.5 py-2.5 text-[0.9375em] font-extrabold text-white hover:bg-[#b84a00] disabled:opacity-60 sm:px-[18px] ${FOCUS}`}
        >
          {saving ? t("daily_mass.journal.saving", "Saving…") : t("daily_mass.journal.save", "Save")} <span aria-hidden>✍️</span>
        </button>
      </form>

      <div role="status" className="relative">
        {notice === "saved" ? (
          <>
            <p className="m-0 mt-2 text-[0.875em] font-extrabold text-[#2e7d32]">{t("daily_mass.journal.saved", "Saved to your Faith Journal ✓")}</p>
            {justUsedLast ? (
              <p className="dm-muted m-0 mt-1 text-[0.8em] text-[#6b7280]">
                {t("daily_mass.journal.last_used", "That was your last free entry.")} {plusLink}
              </p>
            ) : null}
          </>
        ) : null}
        {notice === "signin" ? (
          <p className="m-0 mt-2 text-[0.8125em] text-[#4b5563]">
            <span aria-hidden>🔒 </span>
            <Link href="/account/login" className={`font-extrabold text-[#d35400] ${FOCUS}`}>
              {t("daily_mass.journal.signin", "Sign in to save to your Faith Journal")}
            </Link>
            . {draftKept}
          </p>
        ) : null}
        {notice === "plus" ? (
          <p className="m-0 mt-2 text-[0.8125em] text-[#4b5563]">
            <span aria-hidden>⭐ </span>
            {t("daily_mass.journal.used_up", "You've used your 4 free entries.")} {plusLink} {draftKept}
          </p>
        ) : null}
        {notice === "noanchor" ? (
          <p className="m-0 mt-2 text-[0.8125em] text-[#b91c1c]">
            {t("daily_mass.journal.no_passage", "We couldn't link today's Gospel, so this can't be saved yet.")} {draftKept}
          </p>
        ) : null}
        {notice === "error" ? (
          <p className="m-0 mt-2 text-[0.8125em] text-[#b91c1c]">{t("daily_mass.journal.error", "Could not save. Please try again.")}</p>
        ) : null}
        {/* Free counter stays hidden until it matters. */}
        {isFree && !notice && freeLeft === 1 ? (
          <p className="dm-muted m-0 mt-2 text-[0.78em] text-[#6b7280]">{t("daily_mass.journal.last_free", "Last free entry")}</p>
        ) : null}
        {isFree && !notice && freeLeft === 0 ? (
          <p className="dm-muted m-0 mt-2 text-[0.78em] text-[#6b7280]">
            {t("daily_mass.journal.used_up", "You've used your 4 free entries.")} {plusLink}
          </p>
        ) : null}
      </div>

      {journal.signedIn && total > 0 ? (
        <div className="relative mt-3.5 flex flex-wrap items-center gap-2.5">
          {entries.length ? (
            <ul aria-label={t("daily_mass.journal.recent", "Recent entries")} className="m-0 hidden min-w-0 flex-1 list-none gap-2.5 p-0 pb-1.5 pt-1 sm:flex">
              {entries.map((e, i) => (
                <li
                  key={e.id}
                  className={`w-[170px] flex-none rounded-[4px_4px_14px_4px] px-2.5 pb-2.5 pt-2 text-[0.78em] leading-snug text-[#1c1c1c] shadow-[0_6px_12px_-8px_rgba(0,0,0,0.35)] ${NOTE_TILT[i % 3]}`}
                  style={{ background: NOTE_COLORS[i % 3] }}
                >
                  <span className="mb-0.5 block text-[0.85em] font-bold text-[#7c5a2a]">
                    {e.authorName} · {shortDate(e.createdAt)}
                  </span>
                  <span className="line-clamp-2">“{e.text}”</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href="/account/memos"
            className={`flex-none rounded-full border border-[#f5d9bf] bg-white px-3.5 py-1.5 text-[0.84em] font-extrabold text-[#d35400] no-underline ${FOCUS}`}
          >
            <span aria-hidden>📔 </span>
            {t("daily_mass.journal.open_all", "My Faith Journal")} ({total}) <span aria-hidden>→</span>
          </Link>
        </div>
      ) : null}
    </section>
  );
}
