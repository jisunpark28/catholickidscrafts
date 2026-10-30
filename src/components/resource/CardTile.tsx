"use client";

import { cardPrintPath, cardShareTargets, cardThumbSrc, type CardListItem } from "@/lib/resource/card-meta";
import { shareCardPng } from "@/lib/resource/card-download-client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PlusLockDialog } from "./PlusLockDialog";

type Props = {
  card: Pick<CardListItem, "id" | "title" | "cat" | "ref" | "when" | "date">;
  isPlus: boolean;
  /** Today's featured card: free for everyone (Open / Print / Share unlocked). */
  isFree?: boolean;
  level?: 1 | 2;
  siteUrl: string;
  /** Selected in the Cards grid (orange border). */
  selected?: boolean;
  /** Grid: select in the side panel. Search results: omit and Open links to the card page. */
  onOpen?: () => void;
  openHref?: string;
  /** Small type badge on the image (search results). */
  typeBadge?: React.ReactNode;
};

const pillBtn =
  "inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const ghostBtn =
  "inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#e7e3de] bg-white px-2 py-1.5 text-xs font-medium text-[#1c1c1c] no-underline transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

function shortDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Card tile in the same shape as sheet tiles: image · ID · title · date/verse · Open / Print / Share. */
export function CardTile({
  card,
  isPlus,
  isFree = false,
  level = 1,
  siteUrl,
  selected = false,
  onOpen,
  openHref,
  typeBadge,
}: Props) {
  const unlocked = isPlus || isFree;
  const [lockOpen, setLockOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [canNative, setCanNative] = useState(false);
  useEffect(() => setCanNative(typeof navigator.share === "function"), []);
  const shareRef = useRef<HTMLDivElement>(null);
  const share = cardShareTargets(card, siteUrl);

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !shareRef.current?.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [shareOpen]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share.url);
      setMsg("Link copied");
    } catch {
      setMsg(share.url);
    }
    setShareOpen(false);
  };
  const nativeShare = async () => {
    try {
      await shareCardPng(card, share);
    } catch {
      /* cancelled */
    }
    setShareOpen(false);
  };

  const dateLine = [card.date ? shortDate(card.date) : card.when, card.ref].filter(Boolean).join(" · ");
  const image = (
    <span className="relative block overflow-hidden rounded-lg bg-[#fbf7f1]">
      <Image
        src={cardThumbSrc(card.id)}
        alt={card.title}
        width={432}
        height={540}
        unoptimized
        className="block h-auto w-full"
        loading="lazy"
      />
      {typeBadge ? <span className="absolute left-1.5 top-1.5">{typeBadge}</span> : null}
      <span
        className={`absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm ${
          isPlus ? "bg-[#d35400] text-white" : isFree ? "bg-[#e6f4ea] text-[#1e7b34]" : "bg-white/95 text-[#d35400]"
        }`}
      >
        {isPlus ? "PLUS ✓" : isFree ? "FREE" : "🔒 PLUS"}
      </span>
    </span>
  );
  const openEl = (cls: string, children: React.ReactNode, label?: string) =>
    onOpen ? (
      <button type="button" onClick={onOpen} className={cls} aria-label={label} aria-pressed={selected}>
        {children}
      </button>
    ) : (
      <Link href={openHref ?? "#"} className={cls} aria-label={label}>
        {children}
      </Link>
    );

  return (
    <div
      className={`flex h-full flex-col rounded-xl bg-white text-left ${
        selected ? "border-2 border-[#d35400] p-[5px]" : "border border-[#e7e3de] p-1.5"
      }`}
    >
      {openEl("block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]", image, `Open ${card.title}`)}
      <div className="px-1 pt-2">
        <div className="text-xs font-bold tracking-wide text-[#d35400]">{card.id}</div>
        <div className="truncate text-sm font-bold text-[#1c1c1c]" title={card.title}>
          {card.title}
        </div>
        <div className="truncate text-xs text-[#6b7280]">{card.cat}</div>
        {dateLine ? <div className="truncate text-xs text-[#6b7280]">{dateLine}</div> : null}
      </div>
      <div className="mt-auto px-1 pb-1 pt-2.5">
        {/* Narrow tiles (4-up beside the detail panel): Open on its own row, Print + Share below. */}
        <div className="grid grid-cols-2 gap-1.5">
          {unlocked ? (
            openEl(`${pillBtn} col-span-2 bg-[#d35400] text-white hover:bg-[#b8470a]`, "Open")
          ) : (
            // Same locked look as sheet tiles; the picture itself still opens the free preview.
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setLockOpen(true)}
              className={`${pillBtn} col-span-2 cursor-pointer bg-[#e7e3de] text-[#6b7280]`}
            >
              Open
            </button>
          )}
          {unlocked ? (
            <>
              <a href={cardPrintPath(card.id)} target="_blank" rel="noopener" className={ghostBtn}>
                🖨 Print
              </a>
              <div className="relative min-w-0" ref={shareRef}>
                <button
                  type="button"
                  className={ghostBtn}
                  aria-expanded={shareOpen}
                  onClick={() => setShareOpen((v) => !v)}
                >
                  🔗 Share
                </button>
                {shareOpen ? (
                  <div className="absolute bottom-full right-0 z-20 mb-1 w-40 rounded-xl border border-[#e8e0d6] bg-white p-1.5 text-sm shadow-[0_8px_24px_rgba(28,28,28,0.12)]">
                    <button type="button" onClick={copy} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-[#fff6ef]">
                      Copy link
                    </button>
                    {share.links.map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="block rounded-lg px-2 py-1.5 text-[#1c1c1c] no-underline hover:bg-[#fff6ef]"
                        onClick={() => setShareOpen(false)}
                      >
                        {l.label}
                      </a>
                    ))}
                    {canNative ? (
                      <button type="button" onClick={nativeShare} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-[#fff6ef]">
                        More…
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <button type="button" aria-haspopup="dialog" onClick={() => setLockOpen(true)} className={`${ghostBtn} cursor-pointer text-[#9ca3af]`}>
                🖨 Print
              </button>
              <button type="button" aria-haspopup="dialog" onClick={() => setLockOpen(true)} className={`${ghostBtn} cursor-pointer text-[#9ca3af]`}>
                🔗 Share
              </button>
            </>
          )}
        </div>
        {unlocked ? (
          msg ? (
            <p role="status" className="m-0 mt-1.5 break-all text-xs text-[#6b7280]">
              {msg}
            </p>
          ) : null
        ) : (
          <p className="m-0 mt-1.5 text-[11px] leading-snug text-[#6b7280]">
            🔒 Plus members only ·{" "}
            <Link href="/subscribe" className="font-semibold text-[#d35400] hover:underline">
              Get Plus
            </Link>
          </p>
        )}
      </div>
      <PlusLockDialog open={lockOpen} onClose={() => setLockOpen(false)} level={level} />
    </div>
  );
}
