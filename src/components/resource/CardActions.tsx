"use client";

import { cardDownloadPath, cardFileName, cardSharePath } from "@/lib/resource/card-meta";
import Link from "next/link";
import { useState } from "react";

type Props = {
  card: { id: string; title: string };
  isPlus: boolean;
  /** Absolute site origin for share links (server-provided, e.g. https://catholickidscrafts.com). */
  siteUrl: string;
  /** Compact = bundle column (stacked buttons, no share chips). */
  compact?: boolean;
};

const btnBase =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const chip =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium no-underline transition";
const plusTag = "rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white";

async function fetchCardBlob(id: string, inline: boolean): Promise<Blob> {
  const res = await fetch(`${cardDownloadPath(id)}${inline ? "?inline=1" : ""}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = "Could not get this card. Please try again.";
    if (res.status === 401) msg = "Please sign in again to download cards.";
    else if (res.status === 402) msg = "Card downloads are a Plus feature.";
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error && res.status !== 402) msg = j.error;
    } catch {
      /* not JSON */
    }
    throw new Error(msg);
  }
  return res.blob();
}

/** Download PNG (4:5) + Share for one card. Plus-only; the API re-checks Plus on every request. */
export function CardActions({ card, isPlus, siteUrl, compact = false }: Props) {
  const [busy, setBusy] = useState<"" | "download" | "share">("");
  const [msg, setMsg] = useState<string>("");

  const shareUrl = `${siteUrl.replace(/\/$/, "")}${cardSharePath(card.id)}`;
  const shareText = `${card.title} — a Little Light picture card from Catholic Kids Crafts`;
  const enc = encodeURIComponent;

  const download = async () => {
    setBusy("download");
    setMsg("");
    try {
      const blob = await fetchCardBlob(card.id, false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cardFileName(card);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
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
      // Phones: share the PNG itself when the browser allows files; otherwise the link.
      let data: ShareData = { title: card.title, text: shareText, url: shareUrl };
      try {
        const blob = await fetchCardBlob(card.id, true);
        const file = new File([blob], cardFileName(card), { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) data = { ...data, files: [file] };
      } catch (e) {
        if (e instanceof Error && /sign in|Plus/.test(e.message)) throw e;
      }
      await navigator.share(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMsg(e instanceof Error ? e.message : "Share failed.");
    } finally {
      setBusy("");
    }
  };

  const shareLinks = [
    { label: "Messages", icon: "💬", href: `sms:?&body=${enc(`${shareText} ${shareUrl}`)}` },
    { label: "WhatsApp", icon: "", href: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}` },
    { label: "Facebook", icon: "", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` },
    { label: "Email", icon: "✉", href: `mailto:?subject=${enc(card.title)}&body=${enc(`${shareText}\n${shareUrl}`)}` },
  ];

  if (!isPlus) {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Card downloads are a Plus feature"
            className={`${btnBase} ${compact ? "min-w-[8.5rem] flex-1" : "w-full"} cursor-not-allowed border border-[#e7e3de] bg-[#f3f1ee] font-medium text-[#9ca3af]`}
          >
            🔒 Download PNG (4:5) <span className={plusTag}>PLUS</span>
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Sharing cards is a Plus feature"
            className={`${btnBase} ${compact ? "min-w-[8.5rem] flex-1" : "w-full"} cursor-not-allowed border border-[#e7e3de] bg-[#f3f1ee] font-medium text-[#9ca3af]`}
          >
            🔒 Share <span className={plusTag}>PLUS</span>
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
        {compact ? (
          <Link
            href="/subscribe"
            className="inline-flex rounded-full bg-[#d35400] px-5 py-2 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
          >
            Unlock with Plus
          </Link>
        ) : (
          <div className="rounded-xl border border-[#f1d9c4] bg-[#fff6ef] p-3.5">
            <div className="flex items-start gap-2.5">
              <span aria-hidden className="text-xl leading-none">
                🔒
              </span>
              <div className="min-w-0 flex-1 text-xs text-[#4b5563]">
                <p className="m-0 text-sm font-bold text-[#1c1c1c]">Cards are a Plus feature</p>
                <p className="m-0 mt-0.5">
                  Join Plus to download every card as a PNG (4:5) and share it with families.
                </p>
              </div>
            </div>
            <Link
              href="/subscribe"
              className="mt-3 flex w-full justify-center rounded-full bg-[#d35400] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
            >
              Unlock with Plus
            </Link>
          </div>
        )}
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
          {busy === "download" ? "Preparing…" : "⬇ Download PNG (4:5)"}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={busy !== ""}
          className={`${btnBase} min-w-[8.5rem] flex-1 border-2 border-[#d35400] bg-white text-[#d35400] hover:bg-[#fff6ef] disabled:opacity-70`}
        >
          {busy === "share" ? "Sharing…" : "🔗 Share"}
        </button>
      </div>
      {compact ? null : (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={copyLink} className={`${chip} border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]`}>
            🔗 Copy link
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
