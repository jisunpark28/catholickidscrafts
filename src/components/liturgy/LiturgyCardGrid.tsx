import type { LiturgyCard } from "@/lib/liturgy-cards";
import { isTeachersPayTeachersUrl } from "@/lib/tpt";

type Props = {
  cards: LiturgyCard[];
};

function cardClass(): string {
  return "block aspect-square w-full rounded-2xl border border-dashed border-[#d9d3cb] bg-white";
}

export function LiturgyCardGrid({ cards }: Props) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 pt-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4 lg:pt-10">
      {cards.map((card) => {
        const image = card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null;

        if (!card.href) {
          return (
            <div key={card.id} className={`${cardClass()} overflow-hidden`} aria-hidden>
              {image}
            </div>
          );
        }

        const external = card.href.startsWith("http");
        return (
          <a
            key={card.id}
            href={card.href}
            className={`${cardClass()} overflow-hidden`}
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
            {image}
          </a>
        );
      })}
    </div>
  );
}
