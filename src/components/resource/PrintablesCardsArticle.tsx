"use client";

import { SignInGatedLink } from "@/components/SignInGatedLink";
import { SaintStoryPanel } from "@/components/seo/SaintStoryPanel";
import { cardPrintPath, type CardListItem } from "@/lib/resource/card-meta";
import { getCardGroup, type CardGroupId } from "@/lib/resource/card-groups";
import type { CardRelatedWorksheet } from "@/lib/resource/card-related";
import { cardTalk } from "@/lib/seo/card-talk";
import type { SaintStoryViewData } from "@/lib/seo/saint-story-view";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CardActions } from "./CardActions";
import { CardTile } from "./CardTile";
import { PlusLockButton } from "./PlusLockDialog";
import { RelatedWorksheet } from "./RelatedWorksheet";

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
  /** Browse group from ?group= ("" = all cards). */
  initialGroup?: CardGroupId | "";
  /** Printed captions of non-saint cards keyed by id (for the family talk panel). */
  captions?: Record<string, string>;
  /** Related worksheet per non-saint card id (existing data only). */
  relatedWorksheets?: Record<string, CardRelatedWorksheet>;
  /** Saint Report Worksheet, shown on every saint card. */
  saintWorksheet?: CardRelatedWorksheet | null;
};

const PAGE = 24;

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
 * Every card opens the shared SaintStoryPanel layout (saints: story + Fact Box; others: caption + short facts),
 * plus a related worksheet when existing data links one. The open card is the ?card= URL param.
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
  initialGroup = "",
  captions = {},
  relatedWorksheets = {},
  saintWorksheet = null,
}: Props) {
  const q = initialQ.trim();
  const group = getCardGroup(initialGroup);
  const [shown, setShown] = useState(PAGE);
  // The open card lives in the URL (?card=), so "Try this" links, Back and shared links all agree.
  const searchParams = useSearchParams();
  const selectedId = searchParams ? searchParams.get("card") : initialCardId;

  /** Open/close a card with a real history entry (Next syncs useSearchParams with pushState). */
  function setSelectedId(id: string | null) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "cards");
    if (id) url.searchParams.set("card", id);
    else url.searchParams.delete("card");
    window.history.pushState(null, "", url.toString());
    if (id) window.scrollTo({ top: 0 });
  }

  const list = useMemo(() => {
    const feat = new Map(featuredIds.map((id, i) => [id, i]));
    return cards
      .filter((c) => (!group || c.groups?.includes(group.id)) && matches(c, q))
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
  }, [cards, q, featuredIds, group]);

  const selected = selectedId
    ? list.find((c) => c.id === selectedId) ?? cards.find((c) => c.id === selectedId) ?? null
    : null;

  if (selected) {
    const clear = isPlus || selected.id === freeCardId;
    const saint = saintStories[selected.id] ?? null;
    const caption = captions[selected.id];
    const talk =
      !saint && caption != null
        ? cardTalk({
            id: selected.id,
            cat: selected.cat,
            set: selected.set,
            title: selected.title,
            text: caption,
            ref: selected.ref,
            when: selected.when,
          })
        : null;
    const printLabel = saint ? "Print / Save Saint Card" : "Print / Save Card";
    const printSaveCls =
      "flex w-full items-center justify-center gap-1.5 rounded-full border border-[#c9773a] bg-white px-3 py-1.5 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-[#fff8f0]";
    const actions = (
      <div className="space-y-2">
        {clear ? (
          <SignInGatedLink
            href={cardPrintPath(selected.id)}
            target="_blank"
            rel="noopener"
            className={printSaveCls}
          >
            <span aria-hidden="true">🖨️</span> {printLabel}
          </SignInGatedLink>
        ) : (
          <PlusLockButton
            requireSignIn
            level={level}
            className={`${printSaveCls} cursor-pointer text-[#9ca3af]`}
            title="Print and save need Plus (this week’s free card stays open)"
          >
            <span aria-hidden="true">🖨️</span> {printLabel}
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
    const backButton = (
      <button
        type="button"
        onClick={() => setSelectedId(null)}
        className="text-sm font-medium text-[#335599] hover:text-[#9d451d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9773a]"
      >
        ← {group ? group.label : "All cards"}
      </button>
    );
    const related = saint ? saintWorksheet : (relatedWorksheets[selected.id] ?? null);
    const afterQuestions = related ? <RelatedWorksheet item={related} /> : null;

    if (saint) {
      return (
        <div className="space-y-4">
          {backButton}
          <SaintStoryPanel
            story={saint}
            canPreview={clear}
            actions={actions}
            afterQuestions={afterQuestions}
            showNewsletter
            showHubLink
          />
        </div>
      );
    }

    // Non-saint cards use the same layout as saint cards (image + actions left, facts right).
    const groupHref = group ? `/resource?view=cards&group=${group.id}${level === 2 ? "&level=2" : ""}` : null;
    return (
      <div className="space-y-4">
        {backButton}
        <SaintStoryPanel
          story={{
            id: selected.id,
            title: selected.title,
            set: selected.set,
            when: selected.when && selected.when !== "—" ? selected.when : null,
            text: talk?.caption ?? caption ?? selected.title,
            ref: selected.ref ?? null,
            h1: talk?.h1 ?? selected.title,
            questions: talk?.questions ?? [],
            factBox: null,
            showStory: false,
            slug: "",
          }}
          canPreview={clear}
          actions={actions}
          whenLabel={talk?.whenLabel ?? "When"}
          facts={talk?.facts ?? []}
          imageKind="picture card for kids"
          hubLink={{
            href: groupHref ?? `/resource?view=cards${level === 2 ? "&level=2" : ""}`,
            label: group ? `← All ${group.label}` : "← All cards",
          }}
          newsletterSource="resource-cards"
          afterQuestions={afterQuestions}
          showNewsletter
          showHubLink
        />
      </div>
    );
  }

  return (
    <section aria-label="Cards gallery" className="space-y-4">
      <header>
        <h2 className="m-0 font-serif text-xl font-bold text-[#1c1c1c] sm:text-2xl">{group ? group.label : "All cards"}</h2>
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
