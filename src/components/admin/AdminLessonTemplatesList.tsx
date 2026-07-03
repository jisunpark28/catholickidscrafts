"use client";

import type { LessonKitDto } from "@/lib/lesson-kit/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Props = {
  initialTemplates: LessonKitDto[];
};

export function AdminLessonTemplatesList({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    void fetch("/api/admin/lesson-templates")
      .then((r) => r.json())
      .then((json: { templates: LessonKitDto[] }) => setTemplates(json.templates ?? []));
  }, []);

  const createTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/lesson-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const json = (await res.json()) as { kit?: { id: string }; error?: unknown };
      if (!res.ok || !json.kit) {
        throw new Error("Could not create template");
      }
      setTitle("");
      router.push(`/admin/lesson-templates/${json.kit.id}/edit`);
    } catch {
      setError("Could not create template");
    } finally {
      setPending(false);
    }
  };

  const remove = async (kit: LessonKitDto) => {
    if (
      !window.confirm(
        `Delete "${kit.title}"? Teachers who assigned this template may lose the assignment link.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/lesson-templates/${kit.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete template");
      return;
    }
    refresh();
  };

  return (
    <div>
      <form onSubmit={(e) => void createTemplate(e)} className="mt-6 flex flex-wrap items-end gap-3">
        <label className="block min-w-[16rem] flex-1">
          <span className="text-xs font-semibold text-[var(--color-muted)]">New template title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="Advent warm-up"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create & edit"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-8 space-y-3">
        {templates.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">No templates yet. Create one above.</li>
        ) : (
          templates.map((kit) => (
            <li
              key={kit.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-border)] bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-[var(--color-ink)]">{kit.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {kit.stepCount} steps
                  {kit.gradeBand ? ` · ${kit.gradeBand}` : ""}
                  {kit.liturgicalPeriod ? ` · ${kit.liturgicalPeriod}` : ""}
                  {" · "}
                  {kit.published ? (
                    <span className="font-semibold text-green-800">Published</span>
                  ) : (
                    <span className="font-semibold text-amber-700">Draft</span>
                  )}
                  {" · "}
                  <span className="font-mono">{kit.shareSlug}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={`/admin/lesson-templates/${kit.id}/edit`}
                  className="font-semibold text-[var(--color-link)]"
                >
                  Edit
                </Link>
                <Link
                  href={`/lesson/${kit.shareSlug}`}
                  className="font-semibold text-[var(--color-link)]"
                  target="_blank"
                >
                  Run
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(kit)}
                  className="font-semibold text-[var(--color-muted)] hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
