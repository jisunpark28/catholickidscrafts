"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { loadMassDayForTyping } from "@/lib/load-mass-day-typing";
import { universalisMassPageUrlClient } from "@/lib/universalis-client";
import type { UniversalisMassDay } from "@/lib/universalis-parse";
import { typingDraftKey } from "@/lib/typing-draft-keys";

const DEFAULT_UNIVERSALIS_MASS_URL = universalisMassPageUrlClient();
import { todayUniversalis, toDateKey } from "@/lib/dates";
import type { ReadingKind } from "@/types/mass";
import Link from "next/link";

const READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "first_reading", label: "First Reading" },
  { kind: "second_reading", label: "Second Reading" },
  { kind: "psalm", label: "Psalm" },
  { kind: "gospel", label: "Gospel" },
];

export function BibleTypingMode() {
  const today = useMemo(() => toDateKey(todayUniversalis()), []);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [day, setDay] = useState<UniversalisMassDay | null>(null);
  const massPageUrl = day?.pageUrl ?? DEFAULT_UNIVERSALIS_MASS_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stickerError, setStickerError] = useState("");
  const [stickerSaved, setStickerSaved] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const loadToday = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDay(await loadMassDayForTyping(today));
    } catch (e) {
      setDay(null);
      setError(e instanceof Error ? e.message : "Could not load readings");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  useEffect(() => {
    setStickerSaved(false);
    setNeedsSignIn(false);
    setStickerError("");
  }, [today, readingKind]);

  const unlockSticker = useCallback(
    async (accuracy: number) => {
      setStickerError("");
      setNeedsSignIn(false);
      const res = await fetch("/api/gospel/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey: today, typingAccuracy: accuracy }),
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
    },
    [today],
  );

  const completionMessage = stickerSaved ? (
    <p>Your praise sticker for today was added to My Reading Calendar.</p>
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

  const reading = day?.readings.find((r) => r.kind === readingKind);
  const readingText = reading?.text?.trim() ?? "";
  const availableKinds = useMemo(() => {
    if (!day) return READING_OPTIONS.map((o) => o.kind);
    return READING_OPTIONS.filter((o) =>
      day.readings.some((r) => r.kind === o.kind),
    ).map((o) => o.kind);
  }, [day]);

  useEffect(() => {
    if (availableKinds.length > 0 && !availableKinds.includes(readingKind)) {
      setReadingKind(availableKinds[0]!);
    }
  }, [availableKinds, readingKind]);

  const displayDate = day?.liturgicalTitle ?? today;
  const copyrightNotice = day?.copyrightNotice ?? "";

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-muted)]">
        <strong className="text-[var(--color-ink)]">Today&apos;s Bible</strong> loads today&apos;s
        Mass texts from{" "}
        <a
          href={massPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Universalis
        </a>{" "}
        (free JSONP for websites—see{" "}
        <a
          href="https://universalis.com/n-web.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Universalis for webmasters
        </a>
        ). Pick a reading; kids type along with today&apos;s liturgy.
      </p>

      <div className="flex flex-wrap items-end gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          <span className="block text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Today
          </span>
          {displayDate}
        </p>

        <fieldset className="text-sm font-semibold">
          <legend className="mb-1">Reading</legend>
          <div className="flex flex-wrap gap-2">
            {READING_OPTIONS.map((opt) => {
              const disabled =
                day !== null && !day.readings.some((r) => r.kind === opt.kind);
              const active = readingKind === opt.kind;
              return (
                <button
                  key={opt.kind}
                  type="button"
                  disabled={disabled || loading}
                  onClick={() => setReadingKind(opt.kind)}
                  className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                    active
                      ? "border-[var(--color-accent)] bg-white text-[var(--color-ink)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] disabled:opacity-40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <a
          href={reading?.externalUrl ?? massPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[var(--color-accent)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-surface)]"
        >
          Open on Universalis ↗
        </a>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-muted)]">
          Loading today&apos;s readings from Universalis…
        </p>
      )}
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {reading && readingText.length > 0 && (
        <>
          <PassageTypingGame
            key={`${today}-${reading.kind}`}
            title={reading.label}
            text={readingText}
            draftKey={typingDraftKey.massReading(today, reading.kind)}
            accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
            onStickerUnlock={unlockSticker}
            completionMessage={completionMessage}
            appearance="bible"
          />
          {stickerError && <p className="text-sm text-red-600">{stickerError}</p>}
          {copyrightNotice.length > 0 && (
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              {copyrightNotice}
            </p>
          )}
        </>
      )}

      {reading && !readingText.length && !loading && !error && (
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Could not load text for this reading. Open{" "}
            <a
              href={reading.externalUrl ?? massPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
            >
              Universalis
            </a>{" "}
            for today.
          </p>
        </div>
      )}
    </div>
  );
}
