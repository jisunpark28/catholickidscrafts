"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

export type TypingWordRow = {
  id: string;
  word: string;
  hint: string;
  sortOrder: number;
  published: boolean;
};

type Props = { initialItems: TypingWordRow[] };

function parseBulkLines(text: string): { word: string; hint: string }[] {
  const lines = text.split(/\r?\n/);
  const out: { word: string; hint: string }[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    let word = line;
    let hint = "";

    if (line.includes("|")) {
      const [w, ...rest] = line.split("|");
      word = w?.trim() ?? "";
      hint = rest.join("|").trim();
    } else if (line.includes("\t")) {
      const [w, h] = line.split("\t");
      word = w?.trim() ?? "";
      hint = h?.trim() ?? "";
    } else if (line.includes(",")) {
      const idx = line.indexOf(",");
      word = line.slice(0, idx).trim();
      hint = line.slice(idx + 1).trim();
    }

    if (word.length > 0) out.push({ word, hint });
  }

  return out;
}

export function TypingWordsManager({ initialItems }: Props) {
  const [items, setItems] = useState<TypingWordRow[]>(initialItems);
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.word.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q),
    );
  }, [items, filter]);

  const refreshFromServer = useCallback(async () => {
    const res = await fetch("/api/admin/typing-words");
    if (!res.ok) return;
    const data = (await res.json()) as TypingWordRow[];
    setItems(data);
  }, []);

  async function addOne(nextWord: string, nextHint: string) {
    const w = nextWord.trim();
    if (!w) return false;

    const res = await fetch("/api/admin/typing-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: w, hint: nextHint.trim(), published: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not add word");
    }
    setItems((prev) =>
      [...prev, data as TypingWordRow].sort((a, b) =>
        a.sortOrder !== b.sortOrder
          ? a.sortOrder - b.sortOrder
          : a.word.localeCompare(b.word),
      ),
    );
    return true;
  }

  async function handleQuickAdd(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const added = word.trim();
      await addOne(added, hint);
      setWord("");
      setHint("");
      setMessage(`Added “${added}”.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkAdd() {
    const parsed = parseBulkLines(bulkText);
    if (parsed.length === 0) {
      setError("Paste at least one word (one per line).");
      return;
    }

    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/typing-words/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: parsed.map((row) => ({ word: row.word, hint: row.hint, published: true })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Bulk add failed");
      }

      await refreshFromServer();
      setBulkText("");
      setMessage(
        `Added ${data.created} word(s). ${data.skipped > 0 ? `${data.skipped} already existed or were duplicates.` : ""}`.trim(),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk add failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteWord(id: string, label: string) {
    if (!confirm(`Delete “${label}”?`)) return;
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/typing-words/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMessage(`Deleted “${label}”.`);
  }

  async function patchWord(id: string, patch: Partial<Pick<TypingWordRow, "hint" | "published">>) {
    setError("");
    const res = await fetch(`/api/admin/typing-words/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setError("Update failed");
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Words appear in Word mode at{" "}
        <a
          href="/play/typing"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Play → Typing
        </a>
        . Add one at a time or paste many lines—no need to open Edit for each word.
      </p>

      <form
        onSubmit={(e) => void handleQuickAdd(e)}
        className="border border-[var(--color-border)] bg-white p-4"
      >
        <p className="text-sm font-bold text-[var(--color-ink)]">Quick add</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-[140px] flex-1 text-sm font-semibold">
            Word
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
              placeholder="e.g. Eucharist"
              maxLength={64}
              disabled={busy}
              autoFocus
            />
          </label>
          <label className="min-w-[180px] flex-[2] text-sm font-semibold">
            Hint (optional)
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
              placeholder="Short clue for kids"
              maxLength={200}
              disabled={busy}
            />
          </label>
          <button
            type="submit"
            disabled={busy || !word.trim()}
            className="bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      <div className="border border-[var(--color-border)] bg-white p-4">
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className="text-sm font-bold text-[var(--color-ink)]"
        >
          {showBulk ? "▼" : "▶"} Bulk add (paste many words)
        </button>
        {showBulk && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-[var(--color-muted)]">
              One word per line. Optional hint after a comma, tab, or pipe:{" "}
              <code className="text-[var(--color-ink)]">Grace, God&apos;s gift</code> or{" "}
              <code className="text-[var(--color-ink)]">Mary|Mother of Jesus</code>. Lines starting
              with # are ignored.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              disabled={busy}
              className="w-full border border-[var(--color-border)] px-3 py-2 font-mono text-sm"
              placeholder={"Faith\nHope, trust in God\nCharity|love of God and neighbor"}
            />
            <button
              type="button"
              disabled={busy || !bulkText.trim()}
              onClick={() => void handleBulkAdd()}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-bold hover:bg-white disabled:opacity-50"
            >
              Add all lines
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-semibold">
          Search
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="ml-2 border border-[var(--color-border)] px-3 py-1.5 text-sm"
            placeholder="Filter list…"
          />
        </label>
        <p className="text-sm text-[var(--color-muted)]">
          {items.length} word{items.length === 1 ? "" : "s"}
          {filter.trim() ? ` · showing ${filtered.length}` : ""}
        </p>
      </div>

      <div className="overflow-x-auto border border-[var(--color-border)] bg-white">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead className="bg-[var(--color-surface)] text-left">
            <tr>
              <th className="border-b border-[var(--color-border)] p-3">Word</th>
              <th className="border-b border-[var(--color-border)] p-3">Hint</th>
              <th className="border-b border-[var(--color-border)] p-3 w-24">Live</th>
              <th className="border-b border-[var(--color-border)] p-3 w-28" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-[var(--color-muted)]">
                  {items.length === 0
                    ? "No words yet. Use Quick add or Bulk add above."
                    : "No matches for your search."}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="group">
                  <td className="border-b border-[var(--color-border)] p-3 font-medium">
                    {item.word}
                  </td>
                  <td className="border-b border-[var(--color-border)] p-3">
                    <input
                      defaultValue={item.hint}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next !== item.hint) void patchWord(item.id, { hint: next });
                      }}
                      className="w-full border border-transparent px-2 py-1 hover:border-[var(--color-border)] focus:border-[var(--color-accent)]"
                      placeholder="Optional hint"
                      maxLength={200}
                    />
                  </td>
                  <td className="border-b border-[var(--color-border)] p-3">
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={item.published}
                        onChange={(e) => void patchWord(item.id, { published: e.target.checked })}
                      />
                      On
                    </label>
                  </td>
                  <td className="border-b border-[var(--color-border)] p-3 text-right">
                    <button
                      type="button"
                      onClick={() => void deleteWord(item.id, item.word)}
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                    <Link
                      href={`/admin/typing-words/${item.id}/edit`}
                      className="ml-3 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-link)]"
                    >
                      More
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
