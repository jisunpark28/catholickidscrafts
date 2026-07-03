"use client";

import { LessonBigButton } from "@/components/lesson/LessonUi";
import { formatWeekLabel } from "@/lib/lesson-kit/week";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ParishData = {
  parish: {
    name: string;
    role: string;
    inviteCode?: string;
    memberCount: number;
    weekOpens: number;
    kits: { id: string; title: string; shareSlug: string; published: boolean; opens: number }[];
    plans: {
      id: string;
      weekStart: string;
      title: string;
      notes: string;
      lessonKit: { id: string; title: string; shareSlug: string } | null;
    }[];
  } | null;
};

type Template = { id: string; title: string };

export function ParishDashboard() {
  const [data, setData] = useState<ParishData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [planTitle, setPlanTitle] = useState("");
  const [planKitId, setPlanKitId] = useState("");
  const [copied, setCopied] = useState(false);
  const [addingKit, setAddingKit] = useState<string | null>(null);

  const load = useCallback(() => {
    void fetch("/api/program/parish")
      .then((r) => r.json())
      .then((json: ParishData) => setData(json));
    void fetch("/api/program/kits")
      .then((r) => r.json())
      .then((json: { templates: Template[] }) => setTemplates(json.templates ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyInvite = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const addParishKit = async (sourceId: string) => {
    setAddingKit(sourceId);
    try {
      await fetch("/api/program/parish/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      load();
    } finally {
      setAddingKit(null);
    }
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;
    await fetch("/api/program/parish/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: planTitle.trim(),
        lessonKitId: planKitId || null,
      }),
    });
    setPlanTitle("");
    setPlanKitId("");
    load();
  };

  if (!data) return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;
  if (!data.parish) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No parish linked.{" "}
        <Link href="/program/join" className="font-semibold text-[var(--color-link)]">
          Join with code
        </Link>{" "}
        or{" "}
        <Link href="/program/parish/setup" className="font-semibold text-[var(--color-link)]">
          create a parish
        </Link>
      </p>
    );
  }

  const { parish } = data;
  const isDre = parish.role === "DRE";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-ink)]">{parish.name}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {parish.memberCount} members · {parish.weekOpens} recent opens · {parish.kits.length} parish kits
        </p>
        {isDre && parish.inviteCode ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              Invite code: <span className="tracking-widest">{parish.inviteCode}</span>
            </span>
            <button
              type="button"
              onClick={() => void copyInvite(parish.inviteCode!)}
              className="text-sm font-semibold text-[var(--color-link)]"
            >
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        ) : null}
      </div>

      {isDre ? (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[var(--color-ink)]">Add parish kit from template</h3>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={addingKit === t.id}
                onClick={() => void addParishKit(t.id)}
                className="border border-[var(--color-border)] px-3 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
              >
                {addingKit === t.id ? "…" : `+ ${t.title}`}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-lg font-bold text-[var(--color-ink)]">Parish lesson kits</h3>
        <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-white">
          {parish.kits.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[var(--color-muted)]">No parish kits yet.</li>
          ) : (
            parish.kits.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="font-semibold text-[var(--color-ink)]">{k.title}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--color-muted)]">{k.opens} opens</span>
                  <Link href={`/lesson/${k.shareSlug}`} className="font-semibold text-[var(--color-link)]">
                    Run
                  </Link>
                  {isDre ? (
                    <Link href={`/program/kit/${k.id}`} className="font-semibold text-[var(--color-link)]">
                      Edit
                    </Link>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-[var(--color-ink)]">This season&apos;s plan</h3>
        <ul className="space-y-2">
          {parish.plans.map((p) => (
            <li key={p.id} className="border border-[var(--color-border)] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                {formatWeekLabel(p.weekStart)}
              </p>
              <p className="font-semibold text-[var(--color-ink)]">{p.title}</p>
              {p.lessonKit ? (
                <Link
                  href={`/lesson/${p.lessonKit.shareSlug}`}
                  className="text-sm font-semibold text-[var(--color-link)]"
                >
                  {p.lessonKit.title}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
        {isDre ? (
          <form onSubmit={(e) => void savePlan(e)} className="mt-4 flex flex-wrap gap-2">
            <input
              type="text"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="Week title (e.g. Advent week 2)"
              className="min-w-[12rem] flex-1 border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            <select
              value={planKitId}
              onChange={(e) => setPlanKitId(e.target.value)}
              className="border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <option value="">Kit (optional)</option>
              {parish.kits.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.title}
                </option>
              ))}
            </select>
            <LessonBigButton type="submit" className="!min-h-0 !w-auto !px-4 !py-2 !text-sm">
              Save week
            </LessonBigButton>
          </form>
        ) : null}
      </section>
    </div>
  );
}
