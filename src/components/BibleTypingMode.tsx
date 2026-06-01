"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { toDateKey } from "@/lib/dates";
import type { MassDay, ReadingKind } from "@/types/mass";

const READING_OPTIONS: { kind: ReadingKind; label: string }[] = [
  { kind: "first_reading", label: "First Reading" },
  { kind: "second_reading", label: "Second Reading" },
  { kind: "gospel", label: "Gospel" },
];

export function BibleTypingMode() {
  const today = useMemo(() => toDateKey(new Date()), []);
  const [date, setDate] = useState(today);
  const [readingKind, setReadingKind] = useState<ReadingKind>("gospel");
  const [mass, setMass] = useState<MassDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMass = useCallback(async (dateKey: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/mass/${dateKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load readings");
      setMass(data as MassDay);
    } catch (e) {
      setMass(null);
      setError(e instanceof Error ? e.message : "Could not load readings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMass(date);
  }, [date, loadMass]);

  const reading = mass?.readings.find((r) => r.kind === readingKind);
  const availableKinds = useMemo(() => {
    if (!mass) return READING_OPTIONS.map((o) => o.kind);
    return READING_OPTIONS.filter((o) => mass.readings.some((r) => r.kind === o.kind)).map(
      (o) => o.kind,
    );
  }, [mass]);

  useEffect(() => {
    if (availableKinds.length > 0 && !availableKinds.includes(readingKind)) {
      setReadingKind(availableKinds[0]!);
    }
  }, [availableKinds, readingKind]);

  return (
    <div className="space-y-6">
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
              const disabled = mass !== null && !mass.readings.some((r) => r.kind === opt.kind);
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
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]">Loading readings…</p>}
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {mass && !loading && !error && (
        <p className="text-sm text-[var(--color-muted)]">{mass.liturgicalTitle}</p>
      )}

      {reading && (
        <PassageTypingGame
          key={`${date}-${reading.kind}`}
          title={reading.label}
          text={reading.text}
        />
      )}
    </div>
  );
}
