import type { LiturgyCard } from "@/lib/liturgy-cards";
import { isTeachersPayTeachersUrl } from "@/lib/tpt";

type Props = {
  cards: LiturgyCard[];
  /** Drop the default top padding (used when the grid sits under a section header). */
  compact?: boolean;
};

function cardClass(): string {
  return "relative block aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-[#d9d3cb] bg-white";
}

function CardInner({ card }: { card: LiturgyCard }) {
  return (
    <>
      {card.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : card.title ? (
        <span className="flex h-full w-full items-center justify-center bg-[#faf6f0] p-4 text-center text-sm font-semibold text-[var(--color-ink)]">
          {card.title}
        </span>
      ) : null}
      {card.badge && (
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)] shadow-sm">
          {card.badge}
        </span>
      )}
      {card.title && card.imageUrl && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-sm font-semibold leading-snug text-white">
          {card.title}
        </span>
      )}
    </>
  );
}

export function LiturgyCardGrid({ cards, compact = false }: Props) {
  return (
    <div
      className={`mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4 ${
        compact ? "pt-4" : "pt-6 lg:pt-10"
      }`}
    >
      {cards.map((card) => {
        if (!card.href) {
          return (
            <div key={card.id} className={cardClass()} aria-hidden={!card.title}>
              <CardInner card={card} />
            </div>
          );
        }

        const external = card.href.startsWith("http");
        return (
          <a
            key={card.id}
            href={card.href}
            className={cardClass()}
            aria-label={card.title || "Open link"}
            {...(external
              ? {
                  target: "_blank",
                  rel: isTeachersPayTeachersUrl(card.href)
                    ? "noopener noreferrer sponsored"
                    : "noopener noreferrer",
                }
              : {})}
          >
            <CardInner card={card} />
          </a>
        );
      })}
    </div>
  );
}