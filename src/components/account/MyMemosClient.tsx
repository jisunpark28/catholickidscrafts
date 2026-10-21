"use client";

import { MEMO_BODY_MAX, formatMemoDate, type PassageMemoDto } from "@/lib/bible-memos/passage-memos";
import { PLUS_PRICE_LABEL } from "@/lib/subscription/plan-copy";
import Link from "next/link";
import { useMemo, useState } from "react";

export type MyMemo = PassageMemoDto & { bookName: string; bookOrder: number };

type Sort = "newest" | "bible";

const btnPrimary =
  "rounded-full bg-[#d9580f] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#c04d0c] disabled:opacity-60";
const btnGhost =
  "rounded-full border border-[#e3d9cc] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--color-ink)] hover:border-[#d9580f]";
const field =
  "rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-ink)] focus:border-[#d9580f] focus:outline-none";

function ref(m: MyMemo) {
  return m.startVerse === m.endVerse
    ? `${m.bookName} ${m.chapter}:${m.startVerse}`
    : `${m.bookName} ${m.chapter}:${m.startVerse}–${m.endVerse}`;
}

function MemoCard({
  memo,
  paid,
  onSaved,
  onDeleted,
}: {
  memo: MyMemo;
  paid: boolean;
  onSaved: (m: PassageMemoDto) => void;
  onDeleted: (id: string) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");
  const [text, setText] = useState(memo.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const edited = memo.updatedAt !== memo.createdAt;

  async function save() {
    const body = text.trim();
    if (!body) return setError("Write a memo first.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/memos/${encodeURIComponent(memo.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json().catch(() => ({}))) as { memo?: PassageMemoDto; error?: string };
      if (!res.ok || !data.memo) {
        setError(res.status === 403 ? "Editing memos needs Plus." : data.error ?? "Could not save memo.");
        return;
      }
      onSaved(data.memo);
      setMode("view");
    } catch {
      setError("Could not save memo.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/memos/${encodeURIComponent(memo.id)}`, { method: "DELETE" });
      if (res.ok) onDeleted(memo.id);
      else setError("Could not delete memo.");
    } catch {
      setError("Could not delete memo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[var(--color-ink)]">{ref(memo)}</span>
        <span className="text-xs text-[var(--color-muted)]">
          {edited ? `Edited ${formatMemoDate(memo.updatedAt)}` : formatMemoDate(memo.createdAt)}
        </span>
      </div>
      <blockquote className="mt-2 line-clamp-2 rounded-r-lg border-l-4 border-[#e8b04b] bg-[#fffaeb] px-3 py-1.5 text-sm italic text-[var(--color-ink)]">
        “{memo.quotedText}”
      </blockquote>
      {mode === "edit" ? (
        <div className="mt-2">
          <label htmlFor={`memo-${memo.id}`} className="sr-only">
            Memo
          </label>
          <textarea
            id={`memo-${memo.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MEMO_BODY_MAX}
            rows={4}
            autoFocus
            className="w-full rounded-xl border border-[#d9580f] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9580f]/30"
          />
          <div className="flex justify-between text-xs text-[var(--color-muted)]">
            <span>Last edited {formatMemoDate(memo.updatedAt)}</span>
            <span>
              {text.length} / {MEMO_BODY_MAX}
            </span>
          </div>
          {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy} className={btnPrimary} onClick={() => void save()}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                setText(memo.body);
                setError("");
                setMode("view");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{memo.body}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/bible/read/${memo.bookSlug}/${memo.chapter}`}
              className="text-sm font-semibold text-[var(--color-link)] hover:underline"
            >
              Open in Bible →
            </Link>
            <span className="flex gap-2">
              {paid ? (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    setText(memo.body);
                    setMode("edit");
                  }}
                >
                  Edit
                </button>
              ) : (
                <Link href="/subscribe" className={`${btnGhost} text-[var(--color-muted)]`} title="Editing memos needs Plus">
                  <span aria-hidden>🔒</span> Edit
                </Link>
              )}
              <button type="button" className={`${btnGhost} text-red-600`} onClick={() => setMode("confirm")}>
                Delete
              </button>
            </span>
          </div>
          {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
          {mode === "confirm" && (
            <div role="alertdialog" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
              Delete this memo? This can&apos;t be undone.
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  autoFocus
                  disabled={busy}
                  className="rounded-full bg-red-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60"
                  onClick={() => void remove()}
                >
                  Delete memo
                </button>
                <button type="button" className={btnGhost} onClick={() => setMode("view")}>
                  Keep
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </li>
  );
}

export function MyMemosClient({ initialMemos, paid }: { initialMemos: MyMemo[]; paid: boolean }) {
  const [memos, setMemos] = useState(initialMemos);
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const books = useMemo(() => {
    const m = new Map<string, { name: string; order: number }>();
    for (const x of memos) m.set(x.bookSlug, { name: x.bookName, order: x.bookOrder });
    return [...m.entries()].sort((a, b) => a[1].order - b[1].order);
  }, [memos]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = memos.filter(
      (m) => (!book || m.bookSlug === book) && (!q || m.body.toLowerCase().includes(q)),
    );
    list.sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.bookOrder - b.bookOrder || a.chapter - b.chapter || a.startVerse - b.startVerse,
    );
    const out: { slug: string; name: string; order: number; items: MyMemo[] }[] = [];
    for (const m of list) {
      let g = out.find((x) => x.slug === m.bookSlug);
      if (!g) out.push((g = { slug: m.bookSlug, name: m.bookName, order: m.bookOrder, items: [] }));
      g.items.push(m);
    }
    if (sort === "bible") out.sort((a, b) => a.order - b.order);
    return out;
  }, [memos, query, book, sort]);

  const n = memos.length;

  return (
    <div className="max-w-3xl">
      <Link href="/account" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Family account
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">My memos</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Private to your family account · {n} {n === 1 ? "memo" : "memos"}
      </p>

      {!paid && n > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f5c58a] bg-[#fff4e5] px-4 py-3 text-sm text-[var(--color-ink)]">
          <span>Your Plus plan has ended. You can still view and delete your memos.</span>
          <Link href="/subscribe" className={btnPrimary}>
            Renew Plus · {PLUS_PRICE_LABEL}/month
          </Link>
        </div>
      )}

      {n === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center">
          <div className="text-3xl text-[#d9580f]" aria-hidden>
            ✎
          </div>
          <h2 className="mt-2 text-lg font-bold text-[var(--color-ink)]">No memos yet</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Select verses on a Bible chapter page to save a private family memo.
          </p>
          <Link href="/bible/gospel" className={`${btnPrimary} mt-4 inline-block px-5 py-2`}>
            Open the Bible
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="memo-search">
              Search memos
            </label>
            <input
              id="memo-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memos…"
              className={`${field} min-w-[12rem] flex-1`}
            />
            <label className="sr-only" htmlFor="memo-book">
              Book
            </label>
            <select id="memo-book" value={book} onChange={(e) => setBook(e.target.value)} className={field}>
              <option value="">All books</option>
              {books.map(([slug, b]) => (
                <option key={slug} value={slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="memo-sort">
              Sort
            </label>
            <select id="memo-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
              <option value="newest">Newest first</option>
              <option value="bible">Bible order</option>
            </select>
          </div>

          {groups.length === 0 && (
            <p className="mt-6 text-sm text-[var(--color-muted)]">No memos match your search.</p>
          )}
          {groups.map((g) => (
            <section key={g.slug} className="mt-6">
              <h2 className="border-b border-[var(--color-border)] pb-1 text-base font-bold text-[var(--color-ink)]">
                {g.name} <span className="text-sm font-normal text-[var(--color-muted)]">({g.items.length})</span>
              </h2>
              <ul className="mt-3 space-y-3">
                {g.items.map((m) => (
                  <MemoCard
                    key={m.id}
                    memo={m}
                    paid={paid}
                    onSaved={(u) => setMemos((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)))}
                    onDeleted={(id) => setMemos((list) => list.filter((x) => x.id !== id))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
