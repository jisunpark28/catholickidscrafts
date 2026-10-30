"use client";

import { saveCardPng, shareCardPng } from "@/lib/resource/card-download-client";
import { cardShareTargets, type PictureCard } from "@/lib/resource/card-meta";
import { useEffect, useRef, useState } from "react";

type Props = {
  card: Pick<PictureCard, "id" | "title">;
  siteUrl: string;
  /** Same classes as the Weekly Sheet column's Print / Open pair. */
  primaryCls: string;
  ghostCls: string;
};

/** ★ This Sunday card column: free "Download" (PNG 4:5) + "Share", styled like the sheet's Print + Open. */
export function SundayCardButtons({ card, siteUrl, primaryCls, ghostCls }: Props) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const share = cardShareTargets(card, siteUrl);

  useEffect(() => setCanNative(typeof navigator.share === "function"), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share.url);
      setMsg("Link copied");
    } catch {
      setMsg(share.url);
    }
    setOpen(false);
  };
  const download = async () => {
    setBusy(true);
    setMsg("");
    try {
      await saveCardPng(card);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  };
  const nativeShare = async () => {
    try {
      await shareCardPng(card, share);
    } catch {
      /* cancelled */
    }
    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} disabled={busy} className={primaryCls}>
          {busy ? "Preparing\u2026" : <>⬇ Download</>}
        </button>
        <div className="relative" ref={ref}>
          <button type="button" className={ghostCls} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            Share
          </button>
          {open ? (
            <div className="absolute bottom-full left-0 z-20 mb-1 w-40 rounded-xl border border-[#e8e0d6] bg-white p-1.5 text-sm shadow-[0_8px_24px_rgba(28,28,28,0.12)]">
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
                  onClick={() => setOpen(false)}
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
      </div>
      {msg ? (
        <p role="status" className="m-0 mt-1.5 break-all text-xs text-[#6b7280]">
          {msg}
        </p>
      ) : null}
    </>
  );
}
