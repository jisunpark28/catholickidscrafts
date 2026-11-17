"use client";

import { SignInGatedLink } from "@/components/SignInGatedLink";
import { SaintStoryPanel } from "@/components/seo/SaintStoryPanel";
import {
  cardLockedPreviewSrc,
  cardPrintPath,
  cardThumbSrc,
  type CardListItem,
} from "@/lib/resource/card-meta";
import type { SaintStoryViewData } from "@/lib/seo/saint-story-view";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CardActions } from "./CardActions";
import { CardTile } from "./CardTile";
import { LockedPreview } from "./LockedPreview";
import { PlusLockButton } from "./PlusLockDialog";

type Props = {
  cards: CardListItem[];
  isPlus: boolean;
  freeCardId?: string | null;
  level?: 1 | 2;
  siteUrl: string;
  featuredIds: string[];
  initialQ: string;
  initialCardId: string | null;
  /** Full SEO saint stories keyed by card id (server-built). */
  saintStories?: Record<string, SaintStoryViewData>;
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

/**
 * Right pane for Cards mode: gallery of all cards by default; click → detail.
 * Saint cards open the full SEO saint story UI; other cards keep compact detail.
 * Auth: clear preview/download for this week's free card (and Plus); else blur + block right-click via LockedPreview.
 */
export function PrintablesCardsArticle({
  cards,
  isPlus,
  freeCardId = null,
  level = 1,
  siteUrl,
  featuredIds,
  initialQ,
  initialCardId,
  saintStories = {},
}: Props) {
  const q = initialQ.trim();
  const [shown, setShown] = useState(PAGE);
  const [selectedId, setSelectedId] = useState<string | null>(initialCardId);

  const list = useMemo(() => {
    const feat = new Map(featuredIds.map((id, i) => [id, i]));
    return cards
      .filter((c) => matches(c, q))
      .slice()
      .sort((a, b) => {
        const fa = feat.get(a.id) ?? Infinity;
        const fb = feat.get(b.id) ?? Infinity;
        if (fa !== fb) return fa - fb;
        if (a.date && b.date) return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
        if (a.date) return -1;
        if (b.date) return 1;
        return a.id.localeCompare(b.id);
      });
  }, [cards, q, featuredIds]);

  const selected = selectedId
    ? list.find((c) => c.id === selectedId) ?? cards.find((c) => c.id === selectedId) ?? null
    : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "cards");
    if (selectedId) url.searchParams.set("card", selectedId);
    else url.searchParams.delete("card");
    if (q) url.searchParams.set("q", q);
    window.history.replaceState(window.history.state, "", url.toString());
  }, [selectedId, q]);

  if (selected) {
    const clear = isPlus || selected.id === freeCardId;
    const saint = saintStories[selected.id] ?? null;
    const printSaveCls =
      "flex w-full items-center justify-center gap-1.5 rounded-full border border-[#c9773a] bg-white px-3 py-1.5 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-[#fff8f0]";
    const saintActions = (
      <div className="space-y-2">
        {clear ? (
          <SignInGatedLink
            href={cardPrintPath(selected.id)}
            target="_blank"
            rel="noopener"
            className={printSaveCls}
          >
            <span aria-hidden="true">🖨️</span> Print / Save Saint Card
          </SignInGatedLink>
        ) : (
          <PlusLockButton
            requireSignIn
            level={level}
            className={`${printSaveCls} cursor-pointer text-[#9ca3af]`}
            title="Print and save need Plus (this week’s free card stays open)"
          >
            <span aria-hidden="true">🖨️</span> Print / Save Saint Card
          </PlusLockButton>
        )}
        <CardActions
          card={selected}
          isPlus={isPlus}
          isFree={selected.id === freeCardId}
          level={level}
          siteUrl={siteUrl}
          compact
        />
      </div>
    );
    const compactActions = (
      <CardActions
        card={selected}
        isPlus={isPlus}
        isFree={selected.id === freeCardId}
        level={level}
        siteUrl={siteUrl}
      />
    );

    if (saint) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm font-medium text-[#335599] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
          >
            ← All cards
          </button>
          <SaintStoryPanel
            story={saint}
            canPreview={clear}
            actions={saintActions}
            showNewsletter
            showHubLink
          />
        </div>
      );
    }

    return (
      <article aria-label="Card detail" className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="text-sm font-medium text-[#335599] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
        >
          ← All cards
        </button>
        <div className="rounded-[20px] border border-[#e8d9cd] bg-[#fffdfa] p-4 sm:p-5">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">
            Card · {selected.cat}
            {selected.id === freeCardId ? (
              <>
                <span aria-hidden> · </span>
                <span className="text-[#1e7b34]">This week · free</span>
              </>
            ) : null}
          </p>
          <h2 className="m-0 mt-1 font-serif text-2xl font-bold text-[#1c1c1c]">{selected.title}</h2>
          {subtitle(selected) ? <p className="m-0 mt-1 text-xs text-[#6b7280]">{subtitle(selected)}</p> : null}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#eee8e1] bg-[#fbf7f1]">
            {clear ? (
              <Image
                key={selected.id}
                src={cardThumbSrc(selected.id)}
                alt={`${selected.title} picture card`}
                width={432}
                height={540}
                unoptimized
                className="mx-auto block h-auto max-h-[420px] w-auto"
              />
            ) : (
              <LockedPreview label={`${selected.title}: unlock with Plus`}>
                <Image
                  key={selected.id}
                  src={cardLockedPreviewSrc(selected.id)}
                  alt=""
                  width={216}
                  height={270}
                  unoptimized
                  draggable={false}
                  className="mx-auto block h-auto max-h-[420px] w-auto"
                />
              </LockedPreview>
            )}
          </div>
          <div className="mt-4">{compactActions}</div>
        </div>
      </article>
    );
  }

  return (
    <section aria-label="Cards gallery" className="space-y-4">
      <header>
        <h2 className="m-0 font-serif text-xl font-bold text-[#1c1c1c] sm:text-2xl">All cards</h2>
        {q ? <p className="mb-0 mt-1 text-sm text-[#6b5c50]">Results for “{q}”</p> : null}
      </header>

      {list.length ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-4">
          {list.slice(0, shown).map((c) => (
            <li key={c.id}>
              <CardTile
                card={c}
                isPlus={isPlus}
                isFree={c.id === freeCardId}
                level={level}
                siteUrl={siteUrl}
                selected={false}
                onOpen={() => setSelectedId(c.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#e8d9cd] bg-[#fff3e6] px-5 py-4 text-sm text-[#6b5c50]">
          No cards match. Try a saint, feast, or prayer name.
        </p>
      )}

      {shown < list.length ? (
        <p className="text-center text-sm">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="rounded-full border border-[#e7e3de] bg-white px-4 py-2 font-semibold text-[#c9773a] hover:bg-[#fffdfb]"
          >
            Load more
          </button>
        </p>
      ) : null}
    </section>
  );
}
