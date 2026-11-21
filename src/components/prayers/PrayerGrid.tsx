"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSiteSession } from "@/components/SiteSessionProvider";
import { fredoka } from "@/components/liturgy/fredoka";
import { LearnGateDialog } from "@/components/learn/LearnGateDialog";
import { QaFlipCard } from "@/components/liturgy/QaFlipCards";
import { PrayerCarousel } from "@/components/prayers/PrayerCarousel";
import { RosaryCard } from "@/components/prayers/RosaryCard";
import type { PublicQaCard } from "@/lib/liturgy-qa";
import { isHeaderSignedIn } from "@/lib/header-session";
import { prayerCoverSrc, prayerTileSrc, qaPrayerTileSrc } from "@/lib/prayers/prayer-art";
import { CAROUSEL_PRAYERS, getCarouselPrayer, type CarouselPrayer } from "@/lib/prayers/prayer-phrases";
import { signInPath } from "@/lib/sign-in-callback";
import "@/styles/prayer-carousel.css";

type Item =
  | { kind: "prayer"; prayer: CarouselPrayer; card: PublicQaCard | null }
  | { kind: "qa"; card: PublicQaCard }
  | { kind: "rosary" };

const norm = (s: string) => s.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
/** Admin card titles that name a carousel prayer differently. */
const ALIASES: Record<string, string> = {
  "blessing before a meal": "grace-before-meals",
  "thanksgiving after a meal": "grace-after-meals",
  "prayer to the holy spirit": "come-holy-spirit",
  "sub tuum praesidium": "sub-tuum",
};

/** Live prayer cards (admin) first, in their order; the live card's picture and note stay on its prayer. */
function buildItems(cards: PublicQaCard[]): Item[] {
  const used = new Set<string>();
  const items: Item[] = cards.map((card) => {
    const q = norm(card.question);
    const prayer = CAROUSEL_PRAYERS.find((p) => !used.has(p.slug) && (norm(p.title) === q || ALIASES[q] === p.slug));
    if (!prayer) return { kind: "qa", card };
    used.add(prayer.slug);
    return { kind: "prayer", prayer, card };
  });
  for (const prayer of CAROUSEL_PRAYERS) if (!used.has(prayer.slug)) items.push({ kind: "prayer", prayer, card: null });
  const at = items.findIndex((it) => it.kind === "prayer" && it.prayer.slug === "hail-mary");
  items.splice(at >= 0 ? at + 1 : items.length, 0, { kind: "rosary" });
  return items;
}

const prayerParam = () => new URLSearchParams(window.location.search).get("prayer");

/** /prayers grid: every prayer opens full screen (?prayer=<slug>); the Rosary keeps #rosary. */
export function PrayerGrid({ cards, cardBackColor }: { cards: PublicQaCard[]; cardBackColor?: string }) {
  const items = useMemo(() => buildItems(cards), [cards]);
  const { ready, session } = useSiteSession();
  const signedIn = ready && isHeaderSignedIn(session);
  const [open, setOpen] = useState<string | null>(null);
  const [gate, setGate] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const show = useCallback((slug: string | null) => {
    if (!slug || !getCarouselPrayer(slug)) {
      setOpen(null);
      setGate(null);
      return;
    }
    if (!ready) return;
    if (signedIn) {
      setGate(null);
      setOpen(slug);
    } else {
      setOpen(null);
      setGate(slug);
    }
  }, [ready, signedIn]);

  useEffect(() => {
    const sync = () => show(prayerParam());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [show]);

  const remember = (slug: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("prayer", slug);
    history.pushState(history.state, "", url.pathname + url.search + url.hash);
  };

  const close = useCallback(() => {
    setOpen(null);
    setGate(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("prayer")) {
      url.searchParams.delete("prayer");
      history.pushState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    requestAnimationFrame(() => opener.current?.focus());
  }, []);

  const current = getCarouselPrayer(open);
  const currentCard = current ? items.find((it) => it.kind === "prayer" && it.prayer.slug === current.slug) : null;
  const liveImage = currentCard && currentCard.kind === "prayer" ? currentCard.card?.imageUrl ?? null : null;

  return (
    <>
      <ul className={`${fredoka.variable} qa-grid qa-grid--prayer`} role="list">
        {items.map((it) => {
          if (it.kind === "rosary") return <RosaryCard key="rosary" signedIn={signedIn} sessionReady={ready} />;
          if (it.kind === "qa") {
            const tile = qaPrayerTileSrc(it.card.question);
            const card = { ...it.card, imageUrl: tile };
            return <QaFlipCard key={it.card.id} card={card} variant="prayer" cardBackColor={cardBackColor} />;
          }
          const { prayer, card } = it;
          const src = prayerTileSrc(prayer.slug);
          return (
            <li key={prayer.slug}>
              <div className="qa-card" data-qa-card={prayer.slug} style={{ "--qa-p": card?.cardColor || "#FFE3CC" } as React.CSSProperties}>
                <div className="qa-inner">
                  <button
                    type="button"
                    className="qa-face qa-front"
                    aria-haspopup="dialog"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      remember(prayer.slug);
                      show(prayer.slug);
                    }}
                  >
                    <span className="qa-ill qa-ill--rosary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </span>
                    <span className="qa-q">{card?.question || prayer.title}</span>
                    <span className="qa-when">{card?.tryThis || ""}</span>
                    <span className="qa-hint">Tap to pray →</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {current ? (
        <PrayerCarousel
          key={current.slug}
          prayer={current}
          liveImage={liveImage}
          onClose={close}
          onOpen={(slug) => {
            const next = getCarouselPrayer(slug)?.slug ?? null;
            if (!next) return;
            remember(next);
            show(next);
          }}
        />
      ) : null}
      {gate && getCarouselPrayer(gate) ? (
        <LearnGateDialog
          title={getCarouselPrayer(gate)!.title}
          message="Sign up to learn and practice this prayer."
          imageSrc={prayerCoverSrc(getCarouselPrayer(gate)!) ?? prayerTileSrc(gate)}
          imageAlt=""
          signInHref={signInPath(`/prayers?prayer=${encodeURIComponent(gate)}`)}
          onClose={close}
        />
      ) : null}
    </>
  );
}
