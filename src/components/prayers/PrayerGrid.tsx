"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fredoka } from "@/components/liturgy/fredoka";
import { QaFlipCard } from "@/components/liturgy/QaFlipCards";
import { PrayerCarousel } from "@/components/prayers/PrayerCarousel";
import { RosaryCard } from "@/components/prayers/RosaryCard";
import type { PublicQaCard } from "@/lib/liturgy-qa";
import { prayerCoverSrc, qaPrayerCoverSrc } from "@/lib/prayers/prayer-art";
import { CAROUSEL_PRAYERS, getCarouselPrayer, type CarouselPrayer } from "@/lib/prayers/prayer-phrases";
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
  const [open, setOpen] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => setOpen(getCarouselPrayer(prayerParam())?.slug ?? null);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);

  const current = getCarouselPrayer(open);
  const currentCard = current ? items.find((it) => it.kind === "prayer" && it.prayer.slug === current.slug) : null;
  const liveImage = currentCard && currentCard.kind === "prayer" ? currentCard.card?.imageUrl ?? null : null;

  return (
    <>
      <ul className={`${fredoka.variable} qa-grid qa-grid--prayer`} role="list">
        {items.map((it) => {
          if (it.kind === "rosary") return <RosaryCard key="rosary" />;
          if (it.kind === "qa") {
            const localCover = !it.card.imageUrl ? qaPrayerCoverSrc(it.card.question) : null;
            const card = localCover ? { ...it.card, imageUrl: localCover } : it.card;
            return <QaFlipCard key={it.card.id} card={card} variant="prayer" cardBackColor={cardBackColor} />;
          }
          const { prayer, card } = it;
          const src = card?.imageUrl || prayerCoverSrc(prayer);
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
                      setOpen(prayer.slug);
                    }}
                  >
                    <span className="qa-ill">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={card?.altText || ""} loading="lazy" />
                      ) : (
                        <span className="qa-emoji" aria-hidden>
                          {card?.iconFallback || "🙏"}
                        </span>
                      )}
                    </span>
                    <span className="qa-q">{card?.question || prayer.title}</span>
                    {card?.tryThis ? <span className="qa-when">{card.tryThis}</span> : null}
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
          onOpen={(slug) => setOpen(getCarouselPrayer(slug)?.slug ?? null)}
        />
      ) : null}
    </>
  );
}
