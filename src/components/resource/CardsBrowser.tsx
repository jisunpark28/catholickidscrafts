"use client";

import { CARD_CATEGORIES, cardThumbSrc, type CardListItem } from "@/lib/resource/card-meta";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardActions } from "./CardActions";

type Sort = "calendar" | "number" | "az";

type Props = {
  cards: CardListItem[];
  isPlus: boolean;
  siteUrl: string;
  /** Cards for this Sunday (shown first in Calendar sort). */
  featuredIds: string[];
  initialCat: string;
  initialQ: string;
  initialCardId: string | null;
};

const PAGE = 24;

const chipCls = (on: boolean) =>
  `inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] ${
    on ? "border-[#d35400] bg-[#d35400] text-white" : "border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]"
  }`;

function fullDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function subtitle(c: CardListItem): string {
  return [c.date ? fullDate(c.date) : c.when, c.ref].filter(Boolean).join(" · ");
}

function matches(c: CardListItem, q: string): boolean {
  if (!q) return true;
  const hay = `${c.id} ${c.title} ${c.set} ${c.cat} ${c.when ?? ""} ${c.ref ?? ""}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/** Cards tab: category chips + 4-column grid + sticky detail panel (Download PNG 4:5 / Share, Plus). */
export function CardsBrowser({ cards, isPlus, siteUrl, featuredIds, initialCat, initialQ, initialCardId }: Props) {
  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState<Sort>("calendar");
  const [shown, setShown] = useState(PAGE);
  const q = initialQ.trim();

  const catOf = useMemo(() => new Map(CARD_CATEGORIES.map((c) => [c.slug, c.cat])), []);
  const searched = useMemo(() => cards.filter((c) => matches(c, q)), [cards, q]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of searched) m.set(c.cat, (m.get(c.cat) ?? 0) + 1);
    return m;
  }, [searched]);

  const list = useMemo(() => {
    const wanted = cat ? catOf.get(cat) : null;
    const rows = wanted ? searched.filter((c) => c.cat === wanted) : searched.slice();
    const feat = new Map(featuredIds.map((id, i) => [id, i]));
    if (sort === "az") rows.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "number") rows.sort((a, b) => a.id.localeCompare(b.id));
    else
      rows.sort((a, b) => {
        const fa = feat.get(a.id) ?? Infinity;
        const fb = feat.get(b.id) ?? Infinity;
        if (fa !== fb) return fa - fb;
        if (a.date && b.date) return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
        if (a.date) return -1;
        if (b.date) return 1;
        return a.id.localeCompare(b.id);
      });
    return rows;
  }, [searched, cat, catOf, sort, featuredIds]);

  const [selectedId, setSelectedId] = useState<string | null>(initialCardId);
  const selected =
    list.find((c) => c.id === selectedId) ?? cards.find((c) => c.id === selectedId) ?? list[0] ?? null;

  // Keep ?cat= & ?card= in the address bar so a view can be bookmarked or shared.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "cards");
    if (cat) url.searchParams.set("cat", cat);
    else url.searchParams.delete("cat");
    if (selectedId) url.searchParams.set("card", selectedId);
    else url.searchParams.delete("card");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [cat, selectedId]);

  const panelRef = useRef<HTMLDivElement>(null);
  const pick = (id: string) => {
    setSelectedId(id);
    // Small screens: the panel sits above the grid, so bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section aria-label="Picture cards" className="mt-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 className="m-0 text-xl font-bold text-[#1c1c1c]">Cards · Little Light picture cards</h2>
          <p className="mb-0 mt-1 text-sm text-[#6b7280]">
            Finished 4:5 picture cards for feasts, prayers, saints, sacraments, the Mass, the Bible and sacred art ·{" "}
            {isPlus
              ? "Plus member: download and share any card"
              : "Plus members can download (PNG 4:5) and share every card"}
          </p>
        </div>
        <label className="inline-flex">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort);
              setShown(PAGE);
            }}
            className="rounded-full border border-[#e7e3de] bg-white px-3 py-2 text-sm font-medium text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
          >
            <option value="calendar">Sort: Calendar</option>
            <option value="number">Sort: Card number</option>
            <option value="az">Sort: A–Z</option>
          </select>
        </label>
      </div>

      {q ? (
        <p className="m-0 mb-2 text-sm text-[#4b5563]">
          {searched.length} card{searched.length === 1 ? "" : "s"} for “{q}”
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Card type">
            <button
              type="button"
              className={chipCls(cat === "")}
              aria-pressed={cat === ""}
              onClick={() => {
                setCat("");
                setShown(PAGE);
              }}
            >
              All {searched.length}
            </button>
            {CARD_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={chipCls(cat === c.slug)}
                aria-pressed={cat === c.slug}
                onClick={() => {
                  setCat(c.slug);
                  setShown(PAGE);
                }}
              >
                {c.label} <span className={cat === c.slug ? "text-white/80" : "text-[#6b7280]"}>{counts.get(c.cat) ?? 0}</span>
              </button>
            ))}
          </div>

          {list.length ? (
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, shown).map((c) => {
                const on = selected?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pick(c.id)}
                      aria-pressed={on}
                      className={`block w-full rounded-xl bg-white p-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] ${
                        on ? "border-2 border-[#d35400] p-[5px]" : "border border-[#e7e3de] hover:border-[#d9cfc4]"
                      }`}
                    >
                      <span className="relative block overflow-hidden rounded-lg bg-[#fbf7f1]">
                        <Image
                          src={cardThumbSrc(c.id)}
                          alt={c.title}
                          width={432}
                          height={540}
                          unoptimized
                          className="block h-auto w-full"
                          loading="lazy"
                        />
                        <span
                          className={`absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm ${
                            isPlus ? "bg-[#d35400] text-white" : "bg-white/95 text-[#d35400]"
                          }`}
                        >
                          {isPlus ? "PLUS ✓" : "🔒 PLUS"}
                        </span>
                      </span>
                      <span className="mt-2 block truncate px-1 text-sm font-bold text-[#1c1c1c]">{c.title}</span>
                      <span className="block truncate px-1 pb-1 text-xs text-[#6b7280]">
                        {c.id} · {c.cat}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
              No cards match. Try a saint, feast or prayer name.
            </p>
          )}

          {list.length ? (
            <p className="mt-4 text-center text-sm text-[#6b7280]">
              Showing {Math.min(shown, list.length)} of {list.length}
              {shown < list.length ? (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE)}
                    className="font-semibold text-[#d35400] hover:underline"
                  >
                    Load more
                  </button>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        {selected ? (
          <div ref={panelRef} className="order-first scroll-mt-4 lg:order-none">
            <aside
              aria-label="Card details"
              className="rounded-2xl border border-[#e8e0d6] bg-white p-4 lg:sticky lg:top-4"
            >
              <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#d35400]">
                Card · {selected.cat}
              </p>
              <h3 className="m-0 mt-0.5 text-xl font-bold leading-snug text-[#1c1c1c]">{selected.title}</h3>
              {subtitle(selected) ? (
                <p className="m-0 mt-0.5 text-xs text-[#6b7280]">{subtitle(selected)}</p>
              ) : null}
              <div className="mt-3 overflow-hidden rounded-xl border border-[#eee8e1] bg-[#fbf7f1]">
                <Image
                  key={selected.id}
                  src={cardThumbSrc(selected.id)}
                  alt={`${selected.title} picture card`}
                  width={432}
                  height={540}
                  unoptimized
                  className="block h-auto w-full"
                />
              </div>
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#eee8e1] bg-[#fdfaf7] p-3">
                <span aria-hidden className="mt-0.5 block h-6 w-5 shrink-0 rounded-[3px] border-2 border-[#d35400]" />
                <p className="m-0 text-xs text-[#4b5563]">
                  <span className="font-bold text-[#1c1c1c]">Format: Instagram portrait 4:5</span>
                  <br />
                  PNG · 1080 × 1350 px · one fixed size for phones and social posts
                </p>
              </div>
              <div className="mt-3">
                <CardActions card={selected} isPlus={isPlus} siteUrl={siteUrl} />
              </div>
              {isPlus ? (
                <p className="m-0 mt-3 text-xs text-[#6b7280]">
                  <span className="mr-1 rounded bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">
                    PLUS MEMBER
                  </span>
                  All {cards.length} cards unlocked · each download is the finished 1080×1350 PNG (Instagram 4:5) with
                  the catholickidscrafts.com footer.
                </p>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
