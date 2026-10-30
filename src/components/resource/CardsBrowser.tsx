"use client";

import { cardThumbSrc, type CardListItem } from "@/lib/resource/card-meta";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardActions } from "./CardActions";
import { CardTile } from "./CardTile";

type Sort = "calendar" | "number" | "az";

type Props = {
  cards: CardListItem[];
  isPlus: boolean;
  siteUrl: string;
  /** Cards for this Sunday (shown first in Calendar sort). */
  featuredIds: string[];
  initialQ: string;
  initialCardId: string | null;
  /** Season filter from the shared Resource bar ("" = all). */
  season: string;
  /** "★ This Sunday" in the shared bar: only this Sunday's card(s). */
  onlySunday: boolean;
};

const PAGE = 24;

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

/** Cards tab: 4-column grid + sticky detail panel (Download PNG 4:5 / Share, Plus). */
export function CardsBrowser({
  cards,
  isPlus,
  siteUrl,
  featuredIds,
  initialQ,
  initialCardId,
  season,
  onlySunday,
}: Props) {
  const [sort, setSort] = useState<Sort>("calendar");
  const [shown, setShown] = useState(PAGE);
  const q = initialQ.trim();

  // Shared-bar filters (search, This Sunday, Season) narrow the set.
  const searched = useMemo(() => {
    const sundayIds = new Set(featuredIds);
    return cards.filter(
      (c) =>
        matches(c, q) &&
        (!onlySunday || sundayIds.has(c.id)) &&
        (!season || (c.seasons ?? []).includes(season as NonNullable<CardListItem["seasons"]>[number])),
    );
  }, [cards, q, onlySunday, season, featuredIds]);

  const list = useMemo(() => {
    const rows = searched.slice();
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
  }, [searched, sort, featuredIds]);

  const [selectedId, setSelectedId] = useState<string | null>(initialCardId);
  const selected =
    list.find((c) => c.id === selectedId) ?? cards.find((c) => c.id === selectedId) ?? list[0] ?? null;

  // Keep ?card= in the address bar so a view can be bookmarked or shared. Old ?cat= links (category chips
  // were removed) still load the full grid; the stale param is just dropped.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "cards");
    url.searchParams.delete("cat");
    if (selectedId) url.searchParams.set("card", selectedId);
    else url.searchParams.delete("card");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [selectedId]);

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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
        <div className="min-w-0">
          <div className="mb-3 flex justify-end">
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

          {list.length ? (
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, shown).map((c) => (
                <li key={c.id}>
                  <CardTile
                    card={c}
                    isPlus={isPlus}
                    siteUrl={siteUrl}
                    selected={selected?.id === c.id}
                    onOpen={() => pick(c.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
              No cards match. Try a saint, feast or prayer name.
            </p>
          )}

          {shown < list.length ? (
            <p className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="rounded-full border border-[#e7e3de] bg-white px-4 py-2 font-semibold text-[#d35400] hover:bg-[#fffdfb]"
              >
                Load more
              </button>
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
              <div className="mt-3">
                <CardActions card={selected} isPlus={isPlus} siteUrl={siteUrl} />
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
