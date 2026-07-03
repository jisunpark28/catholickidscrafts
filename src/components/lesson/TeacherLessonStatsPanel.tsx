"use client";

import type { TeacherLessonStats } from "@/lib/lesson-kit/teacher-stats";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function TeacherLessonStatsPanel() {
  const [stats, setStats] = useState<TeacherLessonStats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    void fetch("/api/program/teacher-stats")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load stats");
        return r.json() as Promise<TeacherLessonStats>;
      })
      .then(setStats)
      .catch(() => setError("Could not load lesson stats"));
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("teacher-lesson-refresh", onRefresh);
    return () => window.removeEventListener("teacher-lesson-refresh", onRefresh);
  }, [load]);

  if (error) {
    return (
      <section className="mt-10 border-t border-[var(--color-border)] pt-8">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mt-10 border-t border-[var(--color-border)] pt-8">
        <p className="text-sm text-[var(--color-muted)]">Loading lesson stats…</p>
      </section>
    );
  }

  return (
    <section className="mt-10 border-t border-[var(--color-border)] pt-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Lesson activity</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Week of {stats.weekLabel} (UTC). Opens count each time a lesson link is run in class or at
        home.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Kit opens this week
          </h3>
          <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{stats.weekTotalOpens}</p>
          {stats.kitOpens.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No kits yet.{" "}
              <Link href="/program" className="font-semibold text-[var(--color-link)]">
                Copy a template
              </Link>{" "}
              or assign one for this week.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.kitOpens.map((kit) => (
                <li
                  key={kit.kitId}
                  className="flex flex-wrap items-center justify-between gap-2 border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-ink)]">{kit.title}</p>
                    {!kit.isPersonal ? (
                      <p className="text-xs text-[var(--color-muted)]">Template</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-[var(--color-ink)]">
                      {kit.weekOpens}
                    </span>
                    <Link
                      href={`/lesson/${kit.shareSlug}`}
                      className="font-semibold text-[var(--color-link)]"
                    >
                      Run
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Student completions
          </h3>
          {stats.students.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Add students above to track who finished at-home lessons.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.students.map((student) => (
                <li
                  key={student.subProfileId}
                  className="border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-[var(--color-ink)]">{student.displayName}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {student.completionsTotal} lesson
                      {student.completionsTotal === 1 ? "" : "s"} finished
                    </p>
                  </div>

                  {student.thisWeekAssignment ? (
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      This week:{" "}
                      <Link
                        href={`/lesson/${student.thisWeekAssignment.shareSlug}/family`}
                        className="font-semibold text-[var(--color-link)]"
                      >
                        {student.thisWeekAssignment.kitTitle}
                      </Link>
                      {student.thisWeekAssignment.completed ? (
                        <span className="ml-1 font-semibold text-green-800">· Done</span>
                      ) : (
                        <span className="ml-1">· Not done</span>
                      )}
                      {student.thisWeekAssignment.note
                        ? ` · ${student.thisWeekAssignment.note}`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--color-muted)]">No assignment this week.</p>
                  )}

                  {student.recentCompletions.length > 0 ? (
                    <ul className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-muted)]">
                      {student.recentCompletions.map((c) => (
                        <li key={`${c.shareSlug}-${c.completedAt}`}>
                          <Link
                            href={`/lesson/${c.shareSlug}/family`}
                            className="font-semibold text-[var(--color-link)]"
                          >
                            {c.kitTitle}
                          </Link>
                          {" · "}
                          {formatShortDate(c.completedAt)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
