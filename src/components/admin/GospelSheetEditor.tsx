"use client";

import type { GospelSheetInput, GospelSheetLevel } from "@/lib/gospel-sheet";
import { WEEKLY_COLORS } from "@/lib/weekly-content";
import { useRouter } from "next/navigation";
import { useState } from "react";

function emptyLevel(): GospelSheetLevel {
  return { title: "", story: "", keyLine: "", heartTitle: "", heartIntro: "", heartLabelA: "", heartLabelB: "", questions: ["", ""], actions: ["", "", ""], prayer: "" };
}

const inputClass = "mt-1 w-full border border-[var(--color-border)] px-3 py-2";

type LevelKey = "level1" | "level2";

const LEVEL_HINTS: Record<LevelKey, { heartA: string; heartB: string; heart: string }> = {
  level1: { heartA: "Top half label", heartB: "Bottom half label", heart: "Heart split top / bottom; kids draw inside." },
  level2: { heartA: "Left half label", heartB: "Right half label", heart: "Heart split left / right with 3 write-in lines each." },
};

export function GospelSheetEditor({ id, initial }: { id?: string; initial?: GospelSheetInput }) {
  const router = useRouter();
  const [form, setForm] = useState<GospelSheetInput>(
    initial ?? {
      sundayDate: "",
      liturgicalName: "",
      gospelRef: "",
      usccbUrl: "",
      color: "green",
      published: false,
      featured: false,
      levels: { level1: emptyLevel(), level2: emptyLevel() },
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof GospelSheetInput>(key: K, value: GospelSheetInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setLevel(level: LevelKey, patch: Partial<GospelSheetLevel>) {
    setForm((f) => ({ ...f, levels: { ...f.levels, [level]: { ...f.levels[level], ...patch } } }));
  }

  function setListItem(level: LevelKey, field: "questions" | "actions", index: number, value: string) {
    const list = [...form.levels[level][field]];
    list[index] = value;
    setLevel(level, { [field]: list } as Partial<GospelSheetLevel>);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(id ? `/api/admin/gospel-sheets/${id}` : "/api/admin/gospel-sheets", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/weekly");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!id || !window.confirm("Delete this sheet?")) return;
    const res = await fetch(`/api/admin/gospel-sheets/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/weekly");
      router.refresh();
    } else setError("Delete failed");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Sunday date
          <input type="date" required className={inputClass} value={form.sundayDate} onChange={(e) => set("sundayDate", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Liturgical name
          <input required className={inputClass} placeholder="30th Sunday in Ordinary Time" value={form.liturgicalName} onChange={(e) => set("liturgicalName", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Gospel reference
          <input required className={inputClass} placeholder="Matthew 22:34-40" value={form.gospelRef} onChange={(e) => set("gospelRef", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          USCCB readings URL (screen only, never printed)
          <input type="url" className={inputClass} placeholder="https://bible.usccb.org/bible/readings/102526.cfm" value={form.usccbUrl} onChange={(e) => set("usccbUrl", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Liturgical color
          <select className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)}>
            {Object.keys(WEEKLY_COLORS).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-6 text-sm font-semibold">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature on homepage
          </label>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Write the story in your own words. Don&apos;t paste NRSV/NABRE Bible text; it is copyrighted.
      </p>

      {(["level1", "level2"] as const).map((lk, i) => {
        const lv = form.levels[lk];
        return (
          <fieldset key={lk} className="space-y-3 border border-[var(--color-border)] bg-white p-4">
            <legend className="px-1 text-lg font-bold">Level {i + 1}</legend>
            <label className="block text-sm font-semibold">
              Sheet title
              <input required className={inputClass} value={lv.title} onChange={(e) => setLevel(lk, { title: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              Today&apos;s story (original retelling)
              <textarea required rows={i === 0 ? 3 : 5} className={inputClass} value={lv.story} onChange={(e) => setLevel(lk, { story: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              {i === 0 ? "Key line to trace" : "Key line to copy"}
              <input required className={inputClass} value={lv.keyLine} onChange={(e) => setLevel(lk, { keyLine: e.target.value })} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Heart activity title
                <input required className={inputClass} value={lv.heartTitle} onChange={(e) => setLevel(lk, { heartTitle: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">
                Heart instructions
                <input className={inputClass} value={lv.heartIntro} onChange={(e) => setLevel(lk, { heartIntro: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">
                {LEVEL_HINTS[lk].heartA}
                <input required className={inputClass} value={lv.heartLabelA} onChange={(e) => setLevel(lk, { heartLabelA: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">
                {LEVEL_HINTS[lk].heartB}
                <input required className={inputClass} value={lv.heartLabelB} onChange={(e) => setLevel(lk, { heartLabelB: e.target.value })} />
              </label>
            </div>
            <p className="text-xs text-[var(--color-muted)]">{LEVEL_HINTS[lk].heart}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {lv.questions.map((q, qi) => (
                <label key={qi} className="block text-sm font-semibold">
                  Question {qi + 1}
                  <input className={inputClass} value={q} onChange={(e) => setListItem(lk, "questions", qi, e.target.value)} />
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {lv.actions.map((a, ai) => (
                <label key={ai} className="block text-sm font-semibold">
                  This week I will… #{ai + 1}
                  <input className={inputClass} value={a} onChange={(e) => setListItem(lk, "actions", ai, e.target.value)} />
                </label>
              ))}
            </div>
            <label className="block text-sm font-semibold">
              Prayer
              <input className={inputClass} value={lv.prayer} onChange={(e) => setLevel(lk, { prayer: e.target.value })} />
            </label>
          </fieldset>
        );
      })}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className="bg-[var(--color-accent)] px-5 py-2 font-bold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save sheet"}
        </button>
        {form.sundayDate ? (
          <a href={`/print/${form.sundayDate}?level=1`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--color-link)]">
            Preview saved sheet ↗
          </a>
        ) : null}
        {id ? (
          <button type="button" onClick={remove} className="ml-auto text-sm text-red-700 underline">
            Delete sheet
          </button>
        ) : null}
      </div>
    </form>
  );
}
