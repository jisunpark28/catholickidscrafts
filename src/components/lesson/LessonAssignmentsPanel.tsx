"use client";

import { LessonBigButton } from "@/components/lesson/LessonUi";
import { formatWeekLabel } from "@/lib/lesson-kit/week";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SubOption = { id: string; displayName: string };

type Assignment = {
  id: string;
  weekStart: string;
  note: string;
  completedAt: string | null;
  subProfileId: string | null;
  subDisplayName: string | null;
  kit: { id: string; title: string; shareSlug: string };
};

type AssignableKit = { id: string; title: string; shareSlug: string; scope: string };

type Props = {
  subs: SubOption[];
};

export function LessonAssignmentsPanel({ subs }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [kits, setKits] = useState<AssignableKit[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [kitId, setKitId] = useState("");
  const [subId, setSubId] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    void fetch("/api/program/assignments")
      .then((r) => r.json())
      .then((json: { assignments: Assignment[]; assignableKits: AssignableKit[]; weekStart: string }) => {
        setAssignments(json.assignments ?? []);
        setKits(json.assignableKits ?? []);
        setWeekStart(json.weekStart ?? "");
      });
  }, []);

  const notifyStatsRefresh = () => {
    window.dispatchEvent(new Event("teacher-lesson-refresh"));
  };

  useEffect(() => {
    load();
  }, [load]);

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitId) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/program/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonKitId: kitId,
          subProfileId: subId || null,
          note: note.trim(),
        }),
      });
      if (!res.ok) throw new Error("Could not assign");
      setKitId("");
      setSubId("");
      setNote("");
      load();
      notifyStatsRefresh();
    } catch {
      setError("Could not assign lesson");
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/program/assignments/${id}`, { method: "DELETE" });
    load();
    notifyStatsRefresh();
  };

  return (
    <section className="mt-10 border-t border-[var(--color-border)] pt-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Assign to students</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Pick a lesson for {weekStart ? formatWeekLabel(weekStart) : "this week"}. Students see it on the home page when
        they sign in with their Access ID.
      </p>

      <form onSubmit={(e) => void assign(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-[var(--color-muted)]">Lesson</span>
          <select
            value={kitId}
            onChange={(e) => setKitId(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <option value="">Choose a lesson kit</option>
            {kits.map((k) => (
              <option key={k.id} value={k.id}>
                {k.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--color-muted)]">Student (optional)</span>
          <select
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <option value="">All students</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--color-muted)]">Note (optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Finish before Sunday Mass"
          />
        </label>
        {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
        <div className="sm:col-span-2">
          <LessonBigButton type="submit" disabled={pending || !kitId} className="!min-h-0 !max-w-xs !py-2 !text-sm">
            {pending ? "Assigning…" : "Assign for this week"}
          </LessonBigButton>
        </div>
      </form>

      <ul className="mt-6 space-y-2">
        {assignments.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">No assignments this week.</li>
        ) : (
          assignments.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-[var(--color-border)] bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{a.kit.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {a.subDisplayName ? `For ${a.subDisplayName}` : "All students"}
                  {a.note ? ` · ${a.note}` : ""}
                  {a.completedAt ? " · Done" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href={`/lesson/${a.kit.shareSlug}/family`}
                  className="font-semibold text-[var(--color-link)]"
                >
                  Student link
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(a.id)}
                  className="font-semibold text-[var(--color-muted)] hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
