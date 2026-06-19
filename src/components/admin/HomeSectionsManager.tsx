"use client";

import type { HomeSection, HomeSectionItem } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SectionWithItems = HomeSection & { items: HomeSectionItem[] };

type Props = { initialSections: SectionWithItems[] };

export function HomeSectionsManager({ initialSections }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/admin/home-sections");
    if (res.ok) setSections(await res.json());
  }

  async function addSection() {
    const title = window.prompt("New section title (e.g. Bible Reading)");
    if (!title?.trim()) return;
    setError("");
    const res = await fetch("/api/admin/home-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), sortOrder: sections.length }),
    });
    if (!res.ok) {
      setError("Could not create section");
      return;
    }
    setMessage("Section added");
    await refresh();
  }

  async function deleteSection(id: string, title: string) {
    if (!window.confirm(`Delete section "${title}" and all its pills?`)) return;
    await fetch(`/api/admin/home-sections/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function updateSection(id: string, patch: Partial<HomeSection>) {
    await fetch(`/api/admin/home-sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await refresh();
  }

  async function addItem(sectionId: string) {
    const title = window.prompt("Pill label (shown on home)");
    if (!title?.trim()) return;
    const href = window.prompt("Link path (e.g. /resources?period=easter)");
    if (!href?.trim()) return;
    await fetch("/api/admin/home-section-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, title: title.trim(), href: href.trim() }),
    });
    await refresh();
  }

  async function updateItem(id: string, patch: Partial<HomeSectionItem>) {
    await fetch(`/api/admin/home-section-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await refresh();
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this pill?")) return;
    await fetch(`/api/admin/home-section-items/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Home sections</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Sections and pills on the home page (English labels). Daily Mass toggle is separate in
            Site text → <code className="text-xs">home.daily_mass.label</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void addSection()}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          + Add section
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-8 space-y-10">
        {sections.map((section) => (
          <div key={section.id} className="border border-[var(--color-border)] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <label className="block text-xs font-bold uppercase text-[var(--color-muted)]">
                  Section title
                </label>
                <input
                  className="w-full border border-[var(--color-border)] px-3 py-2"
                  value={section.title}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((s) => (s.id === section.id ? { ...s, title: e.target.value } : s)),
                    )
                  }
                  onBlur={(e) => void updateSection(section.id, { title: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={section.published}
                    onChange={(e) => void updateSection(section.id, { published: e.target.checked })}
                  />
                  Published
                </label>
              </div>
              <button
                type="button"
                onClick={() => void deleteSection(section.id, section.title)}
                className="text-sm font-semibold text-red-700"
              >
                Delete section
              </button>
            </div>

            <ul className="mt-6 space-y-4">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 border border-[var(--color-border)] p-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="text-xs font-bold text-[var(--color-muted)]">Pill label</label>
                    <input
                      className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
                      value={item.title}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? {
                                  ...s,
                                  items: s.items.map((i) =>
                                    i.id === item.id ? { ...i, title: e.target.value } : i,
                                  ),
                                }
                              : s,
                          ),
                        )
                      }
                      onBlur={(e) => void updateItem(item.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--color-muted)]">Link (href)</label>
                    <input
                      className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
                      value={item.href}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? {
                                  ...s,
                                  items: s.items.map((i) =>
                                    i.id === item.id ? { ...i, href: e.target.value } : i,
                                  ),
                                }
                              : s,
                          ),
                        )
                      }
                      onBlur={(e) => void updateItem(item.id, { href: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.published}
                        onChange={(e) => void updateItem(item.id, { published: e.target.checked })}
                      />
                      Published
                    </label>
                    <button
                      type="button"
                      onClick={() => void deleteItem(item.id)}
                      className="text-sm text-red-700"
                    >
                      Delete pill
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => void addItem(section.id)}
              className="mt-4 border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
            >
              + Add pill
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
