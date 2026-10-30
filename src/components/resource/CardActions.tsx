"use client";

import { saveCardPng, shareCardPng } from "@/lib/resource/card-download-client";
import { cardSharePath } from "@/lib/resource/card-meta";
import { useState } from "react";
import { PlusLockDialog } from "./PlusLockDialog";

type Props = {
  card: { id: string; title: string };
  isPlus: boolean;
  /** Today's featured card: free for everyone (the download API agrees). */
  isFree?: boolean;
  /** Absolute site origin for share links (server-provided, e.g. https://catholickidscrafts.com). */
  siteUrl: string;
  /** Compact = bundle column (stacked buttons, no share chips). */
  compact?: boolean;
  level?: 1 | 2;
};

const btnBase =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const chip =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium no-underline transition";
const plusTag = "rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white";

/** Download PNG (4:5) + Share for one card. Plus, or today's free card; the API re-checks on every request. */
export function CardActions({ card, isPlus, isFree = false, siteUrl, compact = false, level = 1 }: Props) {
  const [busy, setBusy] = useState<"" | "download" | "share">("");
  const [msg, setMsg] = useState<string>("");
  const [lockOpen, setLockOpen] = useState(false);

  const shareUrl = `${siteUrl.replace(/\/$/, "")}${cardSharePath(card.id)}`;
  const shareText = `${card.title} \u2014 a Little Light picture card from Catholic Kids Crafts`;
  const enc = encodeURIComponent;

  const download = async () => {
    setBusy("download");
    setMsg("");
    try {
      await saveCardPng(card);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy("");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMsg("Link copied.");
    } catch {
      setMsg(shareUrl);
    }
  };

  const share = async () => {
    setMsg("");
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    setBusy("share");
    try {
      await shareCardPng(card, { url: shareUrl, text: shareText });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Share failed.");
    } finally {
      setBusy("");
    }
  };

  const shareLinks = [
    { label: "Messages", icon: "\u{1F4AC}", href: `sms:?&body=${enc(`${shareText} ${shareUrl}`)}` },
    { label: "WhatsApp", icon: "", href: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}` },
    { label: "Facebook", icon: "", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` },
    { label: "Email", icon: "\u2709", href: `mailto:?subject=${enc(card.title)}&body=${enc(`${shareText}\n${shareUrl}`)}` },
  ];

  if (!isPlus && !isFree) {
    // Locked look stays; a click opens the small Plus popup (no inline Plus box).
    const lockedBtn = `${btnBase} ${compact ? "min-w-[8.5rem] flex-1" : "w-full"} cursor-pointer border border-[#e7e3de] bg-[#f3f1ee] font-medium text-[#9ca3af]`;
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-haspopup="dialog"
            title="Card downloads are a Plus feature"
            onClick={() => setLockOpen(true)}
            className={lockedBtn}
          >
            {"\u{1F512}"} Download PNG (4:5) <span className={plusTag}>PLUS</span>
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            title="Sharing cards is a Plus feature"
            onClick={() => setLockOpen(true)}
            className={lockedBtn}
          >
            {"\u{1F512}"} Share <span className={plusTag}>PLUS</span>
          </button>
        </div>
        {compact ? null : (
          <div className="flex flex-wrap gap-1.5" aria-hidden>
            {["Copy link", ...shareLinks.map((l) => l.label)].map((l) => (
              <span key={l} className={`${chip} border-[#eceae6] bg-[#f7f6f4] text-[#9ca3af]`}>
                {l}
              </span>
            ))}
          </div>
        )}
        <PlusLockDialog open={lockOpen} onClose={() => setLockOpen(false)} level={level} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          disabled={busy !== ""}
          className={`${btnBase} min-w-[8.5rem] flex-1 bg-[#d35400] text-white hover:bg-[#b8470a] disabled:opacity-70`}
        >
          {busy === "download" ? "Preparing\u2026" : "\u2B07 Download PNG (4:5)"}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={busy !== ""}
          className={`${btnBase} min-w-[8.5rem] flex-1 border-2 border-[#d35400] bg-white text-[#d35400] hover:bg-[#fff6ef] disabled:opacity-70`}
        >
          {busy === "share" ? "Sharing\u2026" : "\u{1F517} Share"}
        </button>
      </div>
      {compact ? null : (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={copyLink} className={`${chip} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}>
            {"\u{1F517}"} Copy link
          </button>
          {shareLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`${chip} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}
            >
              {l.icon ? <span aria-hidden>{l.icon}</span> : null}
              {l.label}
            </a>
          ))}
        </div>
      )}
      {msg ? (
        <p role="status" className="m-0 break-all text-xs text-[#6b7280]">
          {msg}
        </p>
      ) : null}
    </div>
  );
}