"use client";

import type { PublicQaCard } from "@/lib/liturgy-qa";
import { fredoka } from "@/components/liturgy/fredoka";
import { useRef, useState } from "react";

type Props = {
  cards: PublicQaCard[];
  /** "prayer": front shows the when-note, back shows the full prayer text (scrolls). */
  variant?: "qa" | "prayer";
  cardBackColor?: string;
  /** Grow each card to the answer instead of clipping it. */
  fit?: boolean;
};

export function QaFlipCards({ cards, variant = "qa", cardBackColor, fit = false }: Props) {
  return (
    <ul className={`${fredoka.variable} qa-grid ${variant === "prayer" ? "qa-grid--prayer" : ""} ${fit ? "qa-grid--fit" : ""}`} role="list">
      {cards.map((card) => (
        <QaFlipCard key={card.id} card={card} variant={variant} cardBackColor={cardBackColor} />
      ))}
    </ul>
  );
}

function QaFlipCard({
  card,
  variant,
  cardBackColor,
}: {
  card: PublicQaCard;
  variant: "qa" | "prayer";
  cardBackColor?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const color = card.cardColor || "#FFE3CC";
  const backId = `qa-back-${card.id}`;

  const flip = (next: boolean) => {
    setFlipped(next);
    requestAnimationFrame(() => {
      if (next) backRef.current?.focus();
      else frontRef.current?.focus();
    });
  };

  return (
    <li>
      <div
        className={`qa-card ${flipped ? "is-flipped" : ""}`}
        data-qa-card={card.id}
        data-flipped={flipped ? "true" : "false"}
        style={{ "--qa-p": color, "--qa-back": cardBackColor ?? "#fff" } as React.CSSProperties}
      >
        <div className="qa-inner">
          <button
            ref={frontRef}
            type="button"
            className="qa-face qa-front"
            aria-expanded={flipped}
            aria-controls={backId}
            aria-hidden={flipped}
            inert={flipped ? true : undefined}
            onClick={() => flip(true)}
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
            <span className="sr-only">Show the answer</span>
          </button>
          <div
            ref={backRef}
            className="qa-face qa-back"
            id={backId}
            tabIndex={flipped ? -1 : undefined}
            aria-hidden={!flipped}
            inert={!flipped ? true : undefined}
          >
            <p className="qa-back-q">{card.question}</p>
            <div className={variant === "prayer" ? "qa-prayer-text" : "qa-answer"}>{card.answer}</div>
            {variant === "qa" && card.tryThis && <p className="qa-chip">✋ Try this: {card.tryThis}</p>}
            <button
              type="button"
              className="qa-hint qa-flip-back"
              aria-expanded={flipped}
              aria-controls={backId}
              onClick={() => flip(false)}
            >
              ↺ Flip back
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
