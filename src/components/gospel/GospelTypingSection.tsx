"use client";

import { GospelReadingRecorder } from "@/components/gospel/GospelReadingRecorder";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { loadMassDayForTyping } from "@/lib/load-mass-day-typing";
import { typingDraftKey } from "@/lib/typing-draft-keys";
import { universalisMassPageUrlClient } from "@/lib/universalis-client";
import type { UniversalisMassDay } from "@/lib/universalis-parse";
import type { ReadingKind } from "@/types/mass";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const GOSPEL_READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "gospel", label: "Gospel" },
  { kind: "first_reading", label: "1st Reading" },
  { kind: "second_reading", label: "2nd Reading" },
];

type Props = {
  todayDate: string;
  focusDate: string;
  onCompleted: (dateKey: string) => void;
};

export function GospelTypingSection({ todayDate, focusDate, onCompleted }: Props) {
  const [day, setDay] = useState<UniversalisMassDay | null>(null);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stickerError, setStickerError] = useState("");
  const [stickerSaved, setStickerSaved] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const canType = focusDate === todayDate;
  const readingsDateKey = day?.date ?? todayDate;

  const loadToday = useCallback(async () => {
    if (!canType) return;
    setLoading(true);
    setError("");
    try {
      setDay(await loadMassDayForTyping(todayDate));
    } catch (e) {
      setDay(null);
      setError(e instanceof Error ? e.message : "Could not load readings");
    } finally {
      setLoading(false);
    }
  }, [canType, todayDate]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  useEffect(() => {
    setStickerSaved(false);
    setNeedsSignIn(false);
    setStickerError("");
  }, [todayDate, readingKind, readingsDateKey]);

  const availableKinds = useMemo(() => {
    if (!day) return GOSPEL_READING_OPTIONS.map((o) => o.kind);
    return GOSPEL_READING_OPTIONS.filter((o) =>
      day.readings.some((r) => r.kind === o.kind && r.text?.trim()),
    ).map((o) => o.kind);
  }, [day]);

  useEffect(() => {
    if (availableKinds.length > 0 && !availableKinds.includes(readingKind)) {
      setReadingKind(availableKinds[0]!);
    }
  }, [availableKinds, readingKind]);

  const reading = day?.readings.find((r) => r.kind === readingKind);
  const readingText = reading?.text?.trim() ?? "";

  const unlockSticker = useCallback(
    async (accuracy: number) => {
      setStickerError("");
      setNeedsSignIn(false);
      const res = await fetch("/api/gospel/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey: todayDate, typingAccuracy: accuracy }),
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
      onCompleted(todayDate);
    },
    [todayDate, onCompleted],
  );

  const completionMessage = stickerSaved ? (
    <p>
      Your praise sticker for today was added to My Reading Calendar (
      {reading?.label ?? "reading"}).
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

  return (
    <HubTypingWidth className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Today&apos;s Readings
      </h2>

      {canType && loading && (
        <p className="text-sm text-[var(--color-muted)]">Loading today&apos;s readings…</p>
      )}
      {canType && error && (
        <p className={`${HOME_HUB_PANEL_CLASS} bg-white text-sm text-[var(--color-ink)]`}>
          {error} Open{" "}
          <a
            href={universalisMassPageUrlClient()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-link)]"
          >
            Universalis
          </a>{" "}
          for today&apos;s readings.
        </p>
      )}

      {canType && day && !loading && !error && (
        <>
          <div className="flex w-full max-w-full items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-2">
              {GOSPEL_READING_OPTIONS.map((opt) => {
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
            <GospelReadingRecorder storageKey={`${readingsDateKey}:${readingKind}`} />
          </div>

          {readingText ? (
            <PassageTypingGame
              key={`${readingsDateKey}-${readingKind}`}
              text={readingText}
              title={reading?.label ?? "Typing practice"}
              draftKey={typingDraftKey.gospelReading(readingsDateKey, readingKind)}
              accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
              onStickerUnlock={unlockSticker}
              completionMessage={completionMessage}
              hideInstructions
              appearance="gospel"
            />
          ) : (
            <p className={`${HOME_HUB_PANEL_CLASS} bg-white`}>
              No text is available for this reading today. Try another reading or open{" "}
              <a
                href={day.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--color-link)]"
              >
                Universalis
              </a>
              .
            </p>
          )}

          {stickerError && <p className="text-sm text-red-600">{stickerError}</p>}
          {day.copyrightNotice && (
            <p className="text-xs text-[var(--color-muted)]">{day.copyrightNotice}</p>
          )}
        </>
      )}
    </HubTypingWidth>
  );
}
