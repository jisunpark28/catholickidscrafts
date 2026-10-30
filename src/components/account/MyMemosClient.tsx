"use client";

import { MemoColorPicker, MemoVisibilityToggle } from "@/components/bible/usePassageMemos";
import {
  MEMO_BODY_MAX,
  MEMO_COLORS,
  filterMemos,
  formatMemoDate,
  memoColor,
  type MemoColor,
  type MemoVisibility,
  type PassageMemoDto,
} from "@/lib/bible-memos/passage-memos";
import { PLUS_FROM_LABEL } from "@/lib/subscription/plan-copy";
import Link from "next/link";
import { useMemo, useState } from "react";

export type MyMemo = PassageMemoDto & { bookName: string; bookOrder: number };
export type MemoViewerInfo = { name: string; isParent: boolean };
export type MemoPerson = { id: string; name: string };

type Sort = "newest" | "bible";

const btnPrimary =
  "rounded-full bg-[#d9580f] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#c04d0c] disabled:opacity-60";
const btnGhost =
  "rounded-full border border-[#e3d9cc] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--color-ink)] hover:border-[#d9580f]";
const field =
  "rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-ink)] focus:border-[#d9580f] focus:outline-none";
const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1 text-sm font-semibold ${
    on ? "border-[#1f2937] bg-[#1f2937] text-white" : "border-[#e3d9cc] bg-white text-[var(--color-ink)] hover:border-[#d9580f]"
  }`;

function ref(m: MyMemo) {
  return m.startVerse === m.endVerse
    ? `${m.bookName} ${m.chapter}:${m.startVerse}`
    : `${m.bookName} ${m.chapter}:${m.startVerse}\u2013${m.endVerse}`;
}

const sharedBadge = (
  <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2 py-0.5 align-middle text-[11px] font-semibold text-[#3730a3]">
    <span aria-hidden>{"\u{1F46A}"}</span> Shared
  </span>
);

function MemoCard({
  memo,
  paid,
  viewer,
  onSaved,
  onDeleted,
}: {
  memo: MyMemo;
  paid: boolean;
  viewer: MemoViewerInfo;
  onSaved: (m: PassageMemoDto) => void;
  onDeleted: (id: string) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");
  const [text, setText] = useState(memo.body);
  const [color, setColor] = useState<MemoColor>(memo.color);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const edited = memo.updatedAt !== memo.createdAt;
  const c = memoColor(memo.color);
  const author = memo.mine ? (viewer.isParent ? `Me (${viewer.name})` : "Me") : memo.authorName;
  const bibleHref = `/bible/read/${memo.bookSlug}/${memo.chapter}`;

  async function patch(data: { body?: string; color?: MemoColor; visibility?: MemoVisibility }) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/memos/${encodeURIComponent(memo.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = (await res.json().catch(() => ({}))) as { memo?: PassageMemoDto; error?: string };
      if (!res.ok || !out.memo) {
        setError(res.status === 403 ? "Editing memos needs Plus." : out.error ?? "Could not save memo.");
        return false;
      }
      onSaved(out.memo);
      return true;
    } catch {
      setError("Could not save memo.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const body = text.trim();
    if (!body) return setError("Write a memo first.");
    if (await patch({ body, color })) setMode("view");
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
    <li className="rounded-2xl border border-[var(--color-border)] border-l-4 bg-white p-4" style={{ borderLeftColor: c.swatch }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[var(--color-ink)]">
          {ref(memo)}
          {memo.visibility === "FAMILY" && sharedBadge}
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          {author} · {edited ? `Edited ${formatMemoDate(memo.updatedAt)}` : formatMemoDate(memo.createdAt)}
        </span>
      </div>
      <blockquote
        className="mt-2 line-clamp-2 border-l-4 px-3 py-1.5 font-serif text-sm italic text-[var(--color-ink)]"
        style={{ background: memoColor(mode === "edit" ? color : memo.color).bg, borderLeftColor: memoColor(mode === "edit" ? color : memo.color).swatch }}
      >
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
          <MemoColorPicker value={color} onChange={setColor} label="Highlight color" name={`color-${memo.id}`} />
          {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} className={btnPrimary} onClick={() => void save()}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                setText(memo.body);
                setColor(memo.color);
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
          {memo.mine ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span title={paid ? undefined : "Changing sharing needs Plus"}>
                <MemoVisibilityToggle
                  size="sm"
                  value={memo.visibility}
                  disabled={busy || !paid}
                  onChange={(v) => void patch({ visibility: v })}
                  onlyMeLabel="Only me"
                  shareLabel="Share with family"
                />
              </span>
              <span className="flex gap-2">
                {paid ? (
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      setText(memo.body);
                      setColor(memo.color);
                      setMode("edit");
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <Link href="/subscribe" className={`${btnGhost} text-[var(--color-muted)]`} title="Editing memos needs Plus">
                    <span aria-hidden>{"\u{1F512}"}</span> Edit
                  </Link>
                )}
                <button type="button" className={`${btnGhost} text-red-600`} onClick={() => setMode("confirm")}>
                  Delete
                </button>
              </span>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--color-muted)]">Read only</span>
              <Link href={bibleHref} className="text-sm font-semibold text-[var(--color-link)] hover:underline">
                Open in Bible →
              </Link>
            </div>
          )}
          {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
          {mode === "confirm" && memo.mine && (
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

export function MyMemosClient({
  initialMemos,
  paid,
  viewer,
  people,
}: {
  initialMemos: MyMemo[];
  paid: boolean;
  viewer: MemoViewerInfo;
  /** Children for the parent's person filter (empty for a child). */
  people: MemoPerson[];
}) {
  const [memos, setMemos] = useState(initialMemos);
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("");
  const [sort, setSort] = useState<Sort>("bible");
  const [person, setPerson] = useState("all");
  const [color, setColor] = useState("all");

  const books = useMemo(() => {
    const m = new Map<string, { name: string; order: number }>();
    for (const x of memos) m.set(x.bookSlug, { name: x.bookName, order: x.bookOrder });
    return [...m.entries()].sort((a, b) => a[1].order - b[1].order);
  }, [memos]);

  const filters = { person: viewer.isParent ? person : "all", color, book, q: query };

  const shown = useMemo(() => filterMemos(memos, filters), [memos, filters.person, color, book, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const list = [...shown];
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
  }, [shown, sort]);

  const n = memos.length;
  const printParams = new URLSearchParams();
  if (filters.person !== "all") printParams.set("person", filters.person);
  if (color !== "all") printParams.set("color", color);
  if (book) printParams.set("book", book);
  if (query.trim()) printParams.set("q", query.trim());
  const qs = printParams.toString();
  const printHref = `/account/memos/print${qs ? `?${qs}` : ""}`;

  return (
    <div className="w-full">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/account" className="font-semibold text-[var(--color-link)] hover:underline">
          Family account
        </Link>
        <span className="mx-1 text-[var(--color-muted)]" aria-hidden>
          ›
        </span>
        <span aria-current="page" className="text-[var(--color-muted)]">
          My memos
        </span>
      </nav>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex flex-wrap items-baseline gap-2 text-3xl text-[var(--color-ink)]">
          My memos
          <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 font-sans text-xs font-normal text-[var(--color-muted)]">
            <span aria-hidden>{"\u{1F464}"}</span> <span className="sr-only">Viewing as </span>
            {viewer.isParent ? `${viewer.name} (parent)` : viewer.name}
          </span>
        </h1>
        {n > 0 && (
          <Link href={printHref} className={`${btnPrimary} inline-flex items-center gap-1`} target="_blank" rel="noopener">
            <span aria-hidden>⬇</span> Export PDF
          </Link>
        )}
      </div>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Your memos + memos your family shared · {shown.length} shown
      </p>

      {!paid && n > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f5c58a] bg-[#fff4e5] px-4 py-3 text-sm text-[var(--color-ink)]">
          <span>Your Plus plan has ended. You can still view and delete your memos.</span>
          <Link href="/subscribe" className={btnPrimary}>
            Get Plus again · {PLUS_FROM_LABEL}
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
            Select verses on a Bible chapter page to save a memo, just for you or shared with your family.
          </p>
          <Link href="/bible/gospel" className={`${btnPrimary} mt-4 inline-block px-5 py-2`}>
            Open the Bible
          </Link>
        </div>
      ) : (
        <>
          {viewer.isParent && (
            <div role="group" aria-label="Filter by person" className="mt-5 flex flex-wrap gap-2">
              {[{ id: "all", name: "All" }, { id: "me", name: "Me" }, ...people].map((p) => (
                <button key={p.id} type="button" aria-pressed={person === p.id} className={chip(person === p.id)} onClick={() => setPerson(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <div role="group" aria-label="Filter by color" className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Color:</span>
            <button type="button" aria-pressed={color === "all"} className={chip(color === "all")} onClick={() => setColor("all")}>
              All
            </button>
            {MEMO_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={color === c.key}
                title={c.label}
                onClick={() => setColor(c.key)}
                className={`h-6 w-6 rounded-full border-2 border-white ${color === c.key ? "shadow-[0_0_0_2px_#1f2937]" : "shadow-[0_0_0_1px_#d1d5db]"}`}
                style={{ background: c.swatch }}
              >
                <span className="sr-only">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
              <option value="bible">Bible order</option>
              <option value="newest">Newest first</option>
            </select>
          </div>

          {groups.length === 0 && (
            <p className="mt-6 text-sm text-[var(--color-muted)]">No memos match these filters.</p>
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
                    viewer={viewer}
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
