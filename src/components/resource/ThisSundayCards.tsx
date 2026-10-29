import { cardKindLabel, cardSharePath, cardThumbSrc, type PictureCard } from "@/lib/resource/card-meta";
import Image from "next/image";
import Link from "next/link";
import { CardActions } from "./CardActions";

type Props = {
  primary: PictureCard;
  more: PictureCard[];
  totalCards: number;
  isPlus: boolean;
  siteUrl: string;
  /** e.g. "Nov 1" — shown in the meta line. */
  dateLabel?: string;
};

/** "This Sunday" bundle: the Sunday's picture card (locked for free, Download/Share for Plus). */
export function ThisSundayCards({ primary, more, totalCards, isPlus, siteUrl, dateLabel }: Props) {
  const others = more.slice(0, 2).map((c) => c.title);
  const rest = totalCards - 1 - others.length;
  return (
    <section
      aria-label="This Sunday's picture card"
      className="flex flex-col gap-4 rounded-2xl border border-[#e8e0d6] bg-white p-4 sm:flex-row"
    >
      <Link href={cardSharePath(primary.id)} className="block w-40 shrink-0 self-center sm:self-start" tabIndex={-1}>
        <span className="block overflow-hidden rounded-xl border border-[#eee8e1] bg-[#fbf7f1]">
          <Image
            src={cardThumbSrc(primary.id)}
            alt={`${primary.title} picture card`}
            width={432}
            height={540}
            unoptimized
            className="block h-auto w-full"
          />
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#d35400]">Cards</p>
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {isPlus ? "PLUS ✓" : "🔒 PLUS"}
          </span>
        </div>
        <h2 className="m-0 mt-0.5 text-lg font-bold text-[#1c1c1c]">
          <Link href={cardSharePath(primary.id)} className="text-inherit no-underline hover:underline">
            {primary.title}
          </Link>
        </h2>
        <p className="m-0 mt-0.5 text-sm text-[#6b7280]">
          {[cardKindLabel(primary.cat), dateLabel, "PNG 4:5"].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 max-w-md">
          <CardActions card={primary} isPlus={isPlus} siteUrl={siteUrl} compact />
        </div>
        <p className="m-0 mt-3 text-xs text-[#6b7280]">
          <Link href="/resource?view=cards" className="text-[#d35400] no-underline hover:underline">
            + {others.length ? `${others.join(", ")} and ` : ""}
            {rest} more cards
          </Link>
        </p>
      </div>
    </section>
  );
}
