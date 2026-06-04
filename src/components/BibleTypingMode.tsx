"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { livingWithChristReadingUrl } from "@/lib/scripture-links";
import type { LwcMassDay } from "@/lib/living-with-christ";
import { toDateKey } from "@/lib/dates";
import type { ReadingKind } from "@/types/mass";

const READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "first_reading", label: "First Reading" },
  { kind: "second_reading", label: "Second Reading" },
  { kind: "psalm", label: "Psalm" },
  { kind: "gospel", label: "Gospel" },
];

export function BibleTypingMode() {
  const today = useMemo(() => toDateKey(new Date()), []);
  const [date, setDate] = useState(today);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [day, setDay] = useState<LwcMassDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReadings = useCallback(async (dateKey: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/lwc-readings/${dateKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load readings");
      setDay(data as LwcMassDay);
    } catch (e) {
      setDay(null);
      setError(e instanceof Error ? e.message : "Could not load readings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReadings(date);
  }, [date, loadReadings]);

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

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-muted)]">
        Readings load from{" "}
        <a
          href={livingWithChristReadingUrl(date)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          readings.livingwithchrist.ca
        </a>{" "}
        for the date you pick (Canada).
      </p>

      <div className="flex flex-wrap items-end gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="text-sm font-semibold">
          Mass date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block border border-[var(--color-border)] bg-white px-3 py-2"
          />
        </label>

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
          href={reading?.externalUrl ?? livingWithChristReadingUrl(date)}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[var(--color-accent)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-surface)]"
        >
          Open on Living with Christ ↗
        </a>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-muted)]">
          Loading readings from Living with Christ…
        </p>
      )}
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {day && !loading && !error && (
        <p className="text-sm text-[var(--color-muted)]">{day.liturgicalTitle}</p>
      )}

      {reading && readingText.length > 0 && (
        <PassageTypingGame
          key={`${date}-${reading.kind}`}
          title={reading.label}
          text={readingText}
        />
      )}

      {reading && !readingText.length && !loading && !error && (
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Could not load text for this reading. Open{" "}
            <a
              href={reading.externalUrl ?? livingWithChristReadingUrl(date)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
            >
              Living with Christ
            </a>{" "}
            for this date.
          </p>
        </div>
      )}
    </div>
  );
}
