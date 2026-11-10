"use client";

import { GospelReadingRecorder } from "@/components/gospel/GospelReadingRecorder";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { loadMassDayForTyping } from "@/lib/load-mass-day-typing";
import { typingDraftKey } from "@/lib/typing-draft-keys";
import type { ReadingKind } from "@/types/mass";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "gospel", label: "Gospel" },
  { kind: "first_reading", label: "1st Reading" },
  { kind: "psalm", label: "Psalm" },
  { kind: "second_reading", label: "2nd Reading" },
];

/** Reading texts for one date, as the typing section uses them. */
export type TypingDay = {
  date: string;
  readings: Array<{ kind: ReadingKind | string; label: string; text?: string }>;
  copyrightNotice?: string;
  /** Where the reading text comes from: Universalis (today) or the USCCB readings feed. */
  source: "universalis" | "usccb";
};

type Props = {
  /** Device date. Today's readings come from Universalis, as before. */
  todayDate: string;
  /** Day picked on the calendar; its readings are typed and its sticker is saved. */
  focusDate: string;
  /** Text for `focusDate` from the USCCB readings feed (already loaded by the page), if it has that day. */
  fallbackDay?: TypingDay | null;
  /** Official readings page for `focusDate`, shown when no text is available. */
  usccbUrl: string;
  onCompleted: (dateKey: string) => void;
  /** Optional control (e.g. a collapse arrow) at the right of the section heading. */
  headerEnd?: ReactNode;
};

function hasText(day: TypingDay | null | undefined): day is TypingDay {
  return Boolean(day?.readings.some((reading) => reading.text?.trim()));
}

function shortDate(dateKey: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${dateKey}T12:00:00Z`),
  );
}

export function GospelTypingSection({ todayDate, focusDate, fallbackDay, usccbUrl, onCompleted, headerEnd }: Props) {
  const isToday = focusDate === todayDate;
  const [day, setDay] = useState<TypingDay | null>(isToday ? null : hasText(fallbackDay) ? fallbackDay : null);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [loading, setLoading] = useState(isToday);
  const siteCopy = useSiteCopy();
  const [stickerError, setStickerError] = useState("");
  const [stickerSaved, setStickerSaved] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const loadToday = useCallback(async () => {
    if (!isToday) return;
    setLoading(true);
    try {
      const universalis = await loadMassDayForTyping(todayDate);
      setDay({ date: todayDate, readings: universalis.readings, copyrightNotice: universalis.copyrightNotice, source: "universalis" });
    } catch {
      // Universalis unreachable or still on another day: use the USCCB text for today when the feed has it.
      setDay(hasText(fallbackDay) ? fallbackDay : null);
    } finally {
      setLoading(false);
    }
  }, [fallbackDay, isToday, todayDate]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const readingsDateKey = day?.date ?? focusDate;

  useEffect(() => {
    setStickerSaved(false);
    setNeedsSignIn(false);
    setStickerError("");
  }, [readingKind, readingsDateKey]);

  const availableKinds = useMemo(() => {
    if (!day) return READING_OPTIONS.map((o) => o.kind);
    return READING_OPTIONS.filter((o) => day.readings.some((r) => r.kind === o.kind && r.text?.trim())).map((o) => o.kind);
  }, [day]);

  useEffect(() => {
    if (availableKinds.length > 0 && !availableKinds.includes(readingKind)) {
      setReadingKind(availableKinds[0]!);
    }
  }, [availableKinds, readingKind]);

  const reading = day?.readings.find((r) => r.kind === readingKind && r.text?.trim());
  const readingText = reading?.text?.trim() ?? "";
  // Universalis drafts keep the original key so saved drafts carry over; USCCB text gets its own key.
  const draftKey =
    day?.source === "usccb"
      ? typingDraftKey.gospelReading(readingsDateKey, `${readingKind}:usccb`)
      : typingDraftKey.gospelReading(readingsDateKey, readingKind);

  const unlockSticker = useCallback(
    async (accuracy: number) => {
      setStickerError("");
      setNeedsSignIn(false);
      const res = await fetch("/api/gospel/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey: readingsDateKey, typingAccuracy: accuracy }),
      });
      if (res.status === 401) {
        setNeedsSignIn(true);
        throw new Error("Sign in required");
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const message = data.error ?? "Could not save sticker";
        setStickerError(message);
        throw new Error(message);
      }
      setStickerSaved(true);
      onCompleted(readingsDateKey);
    },
    [readingsDateKey, onCompleted],
  );

  const completionMessage = stickerSaved ? (
    <p>
      Your praise sticker for {readingsDateKey === todayDate ? "today" : shortDate(readingsDateKey)} was added to your
      calendar ({reading?.label ?? "reading"}).
    </p>
  ) : needsSignIn ? (
    <p>
      <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
        Sign in
      </Link>{" "}
      or{" "}
      <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
        Access ID
      </Link>{" "}
      to save this sticker on your calendar.
    </p>
  ) : null;

  const heading = isToday ? "Today's Readings" : `Readings for ${shortDate(focusDate)}`;

  return (
    <HubTypingWidth wide className="space-y-4">
      {headerEnd ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">{heading}</h2>
          {headerEnd}
        </div>
      ) : (
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">{heading}</h2>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="animate-pulse text-sm text-[var(--color-muted)]">Loading readings…</p>
        </div>
      )}

      {!loading && !hasText(day) && (
        <p className={`${HOME_HUB_PANEL_CLASS} bg-white text-sm text-[var(--color-ink)]`}>
          Readings aren&apos;t available for this day yet.{" "}
          <a href={usccbUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-link)]">
            Read on USCCB
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}

      {!loading && hasText(day) && (
        <>
          <div className="flex w-full max-w-full items-end justify-between gap-4">
            <div className="flex min-w-0 flex-wrap gap-2">
              {READING_OPTIONS.map((opt) => {
                const available = availableKinds.includes(opt.kind);
                const active = readingKind === opt.kind;
                return (
                  <button
                    key={opt.kind}
                    type="button"
                    disabled={!available}
                    onClick={() => setReadingKind(opt.kind)}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                      active
                        ? "border-[#dfc9b0] bg-[#f5d4b8] text-[var(--color-ink)] shadow-sm"
                        : "border-[#e8e0d6] bg-white text-[var(--color-muted)] hover:border-[#d9cfc3] disabled:cursor-not-allowed disabled:opacity-40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <GospelReadingRecorder storageKey={`${readingsDateKey}:${readingKind}`} />
              <p className="max-w-[16rem] text-right text-[10px] leading-tight text-[var(--color-muted)]">
                {textFromCopy(siteCopy, "gospel.recorder.note_line1", "Practice reading aloud.")}
                <br />
                {textFromCopy(siteCopy, "gospel.recorder.note_line2", "Recordings stay in this browser and disappear when you leave the page.")}
              </p>
            </div>
          </div>

          {readingText ? (
            <PassageTypingGame
              key={`${readingsDateKey}-${readingKind}-${day.source}`}
              text={readingText}
              title={reading?.label ?? "Typing practice"}
              draftKey={draftKey}
              accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
              onStickerUnlock={unlockSticker}
              completionMessage={completionMessage}
              hideInstructions
              appearance="gospel"
            />
          ) : null}

          {stickerError && <p className="text-sm text-red-600">{stickerError}</p>}
          {day.copyrightNotice && <p className="text-xs text-[var(--color-muted)]">{day.copyrightNotice}</p>}
        </>
      )}
    </HubTypingWidth>
  );
}
