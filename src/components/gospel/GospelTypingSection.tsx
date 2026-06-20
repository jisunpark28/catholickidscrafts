"use client";

import { PassageTypingGame } from "@/components/PassageTypingGame";
import { HOME_HUB_NARROW_CONTENT_CLASS, HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import type { UniversalisMassDay } from "@/lib/universalis";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  const gospelText = useMemo(() => {
    const reading = day?.readings.find((r) => r.kind === "gospel");
    return reading?.text?.trim() ?? "";
  }, [day]);

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
    <section className={`${HOME_HUB_NARROW_CONTENT_CLASS} space-y-4`}>
      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Today&apos;s Gospel
      </h2>

      {!canType && (
        <p className={`${HOME_HUB_PANEL_CLASS} bg-white`}>
          Typing is available for today only ({todayDate}). Select today on your calendar or come
          back on that day.
        </p>
      )}

      {canType && loading && (
        <p className="text-sm text-[var(--color-muted)]">Loading today&apos;s Gospel…</p>
      )}
      {canType && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {canType && gospelText && (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            {day?.liturgicalTitle ?? todayDate} · Text from{" "}
            <a
              href={day?.pageUrl ?? "https://universalis.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
            >
              Universalis
            </a>
          </p>
          <PassageTypingGame
            text={gospelText}
            title="Type today's Gospel"
            accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
            onComplete={signedIn ? onComplete : undefined}
            completionMessage={
              signedIn ? (
                <p>Your praise sticker for today was added to My Reading Calendar.</p>
              ) : (
                <p>
                  <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
                    Sign in
                  </Link>{" "}
                  to save this sticker on your calendar.
                </p>
              )
            }
          />
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {day?.copyrightNotice && (
            <p className="text-xs text-[var(--color-muted)]">{day.copyrightNotice}</p>
          )}
        </>
      )}
    </section>
  );
}
