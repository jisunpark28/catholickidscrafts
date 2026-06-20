"use client";

import { PassageTypingGame } from "@/components/PassageTypingGame";
import { HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import type { UniversalisMassDay } from "@/lib/universalis";
import type { ReadingKind } from "@/types/mass";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const GOSPEL_READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "gospel", label: "Gospel" },
  { kind: "first_reading", label: "1st Reading" },
  { kind: "second_reading", label: "2nd Reading" },
];

type Props = {
  signedIn: boolean;
  todayDate: string;
  focusDate: string;
  onCompleted: (dateKey: string) => void;
};

export function GospelTypingSection({
  signedIn,
  todayDate,
  focusDate,
  onCompleted,
}: Props) {
  const [day, setDay] = useState<UniversalisMassDay | null>(null);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const canType = focusDate === todayDate;

  const loadToday = useCallback(async () => {
    if (!canType) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/universalis-readings/${todayDate}`);
      const text = await res.text();
      let data: UniversalisMassDay & { error?: string };
      try {
        data = text ? (JSON.parse(text) as typeof data) : ({} as typeof data);
      } catch {
        throw new Error("Could not load readings");
      }
      if (!res.ok) throw new Error(data.error ?? "Could not load readings");
      setDay(data);
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

  const onComplete = useCallback(
    async (accuracy: number) => {
      if (!signedIn) return;
      setSaveError("");
      const res = await fetch("/api/gospel/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey: todayDate, typingAccuracy: accuracy }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveError(data.error ?? "Could not save sticker");
        return;
      }
      onCompleted(todayDate);
    },
    [signedIn, todayDate, onCompleted],
  );

  return (
    <HubTypingWidth className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Today&apos;s Readings
      </h2>

      {!canType && (
        <p className={`${HOME_HUB_PANEL_CLASS} bg-white`}>
          Typing is available for today only ({todayDate}). Select today on your calendar or come
          back on that day.
        </p>
      )}

      {canType && loading && (
        <p className="text-sm text-[var(--color-muted)]">Loading today&apos;s readings…</p>
      )}
      {canType && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {canType && day && !loading && !error && (
        <>
          <fieldset className="text-sm font-semibold">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Choose a reading
            </legend>
            <div className="flex flex-wrap gap-2">
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
            <p className="mt-2 text-xs font-normal text-[var(--color-muted)]">
              Type any reading with {Math.round(BIBLE_STICKER_ACCURACY_THRESHOLD * 100)}% accuracy
              to earn today&apos;s praise sticker.
            </p>
          </fieldset>

          {readingText ? (
            <PassageTypingGame
              key={`${todayDate}-${readingKind}`}
              text={readingText}
              title={reading?.label ?? "Typing practice"}
              accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
              onComplete={signedIn ? onComplete : undefined}
              completionMessage={
                signedIn ? (
                  <p>
                    Your praise sticker for today was added to My Reading Calendar (
                    {reading?.label ?? "reading"}).
                  </p>
                ) : (
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
                )
              }
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

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {day.copyrightNotice && (
            <p className="text-xs text-[var(--color-muted)]">{day.copyrightNotice}</p>
          )}
        </>
      )}
    </HubTypingWidth>
  );
}
