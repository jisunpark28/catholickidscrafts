"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TopicForm = { title: string; bigIdea: string; ageNote: string; accentColor: string; cardBackColor: string };

export function LiturgyQaTopicEditor({ slug, initial }: { slug: string; initial: TopicForm }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/liturgy-qa/topics/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMsg(res.ok ? "Saved" : typeof data.error === "string" ? data.error : "Save failed");
    if (res.ok) router.refresh();
  }

  const field = (key: keyof TopicForm, label: string, long = false) => (
    <label className="block text-sm font-semibold">
      {label}
      {long ? (
        <textarea value={form[key]} rows={2} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal" />
      ) : (
        <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal" />
      )}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {field("title", "Page title")}
      {field("bigIdea", "Big idea", true)}
      {field("ageNote", "Age note")}
      <div className="grid grid-cols-2 gap-3">
        {field("accentColor", "Accent colour (#RRGGBB)")}
        {field("cardBackColor", "Card back colour (#RRGGBB)")}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save header"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
