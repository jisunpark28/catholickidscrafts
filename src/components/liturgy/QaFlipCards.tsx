"use client";

import type { PublicQaCard } from "@/lib/liturgy-qa";
import { fredoka } from "@/components/liturgy/fredoka";
import { useState } from "react";

type Props = {
  cards: PublicQaCard[];
  /** "prayer": front shows the when-note, back shows the full prayer text (scrolls). */
  variant?: "qa" | "prayer";
  cardBackColor?: string;
};

export function QaFlipCards({ cards, variant = "qa", cardBackColor }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul className={`${fredoka.variable} qa-grid ${variant === "prayer" ? "qa-grid--prayer" : ""}`} role="list">
      {cards.map((card) => {
        const flipped = open.has(card.id);
        const color = card.cardColor || "#FFE3CC";
        return (
          <li key={card.id}>
            <div className={`qa-card ${flipped ? "is-flipped" : ""}`} style={{ "--qa-p": color, "--qa-back": cardBackColor ?? "#fff" } as React.CSSProperties}>
              <div className="qa-inner">
                <button
                  type="button"
                  className="qa-face qa-front"
                  aria-expanded={flipped}
                  aria-controls={`qa-back-${card.id}`}
                  onClick={() => toggle(card.id)}
                  tabIndex={flipped ? -1 : 0}
                >
                  <span className="qa-ill">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt={card.altText} loading="lazy" />
                    ) : (
                      <span className="qa-emoji" aria-hidden>
                        {card.iconFallback || "✨"}
                      </span>
                    )}
                  </span>
                  <span className="qa-q">{card.question}</span>
                  {variant === "prayer" && card.tryThis && <span className="qa-when">{card.tryThis}</span>}
                  <span className="qa-hint">{variant === "prayer" ? "Tap to pray ↻" : "Tap to flip ↻"}</span>
                </button>
                <div className="qa-face qa-back" id={`qa-back-${card.id}`}>
                  <p className="qa-back-q">{card.question}</p>
                  <div className={variant === "prayer" ? "qa-prayer-text" : "qa-answer"} tabIndex={flipped && variant === "prayer" ? 0 : -1}>
                    {card.answer}
                  </div>
                  {variant === "qa" && card.tryThis && <p className="qa-chip">✋ Try this: {card.tryThis}</p>}
                  <button
                    type="button"
                    className="qa-hint qa-flip-back"
                    aria-expanded={flipped}
                    aria-controls={`qa-back-${card.id}`}
                    onClick={() => toggle(card.id)}
                    tabIndex={flipped ? 0 : -1}
                  >
                    ↺ Flip back
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
