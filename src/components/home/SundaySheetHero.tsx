"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  slug: string;
  title: string;
  liturgicalName: string;
  sundayLabel: string;
  gospelRef: string;
  /**
   * Print page without query, e.g. `/print/resource/a-ot30` (auto weekly)
   * or `/print/2026-10-25` (legacy DB featured fallback).
   */
  printBasePath: string;
  /** Page whose absolute URL "Copy Link" copies, e.g. the sheet's worksheet page or "/". */
  shareHref: string;
  groupInquiryHref: string | null;
  /** False until RESEND_API_KEY, EMAIL_FROM and MAILING_ADDRESS are set: skip straight to the Plus line. */
  emailEnabled: boolean;
};

const PAGE_W = 816; // 8.5in at 96dpi
const PAGE_H = 1056; // 11in
const EMAIL_STATE_KEY = "ckc.sheetEmail"; // "subscribed" | "dismissed"
/** Same sign-in page as the header's "Sign in" (Google family sign-in). */
const SIGN_IN_HREF = "/account/login";

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || iPadOS;
}

function readEmailState(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_STATE_KEY);
  } catch {
    return null;
  }
}

function writeEmailState(value: "subscribed" | "dismissed") {
  try {
    window.localStorage.setItem(EMAIL_STATE_KEY, value);
  } catch {
    /* private mode */
  }
}

/** Preview width in CSS px: small on phones so Print stays near the top, roomier on wide screens. */
function previewWidth(): number {
  if (window.innerWidth < 640) return 220;
  if (window.innerWidth >= 1536) return 300;
  return 262;
}

/** Homepage "This Sunday" hero: sheet preview, Level toggle, big Print, Save to My Binder and Copy Link. */
export function SundaySheetHero({
  title,
  liturgicalName,
  sundayLabel,
  gospelRef,
  printBasePath,
  shareHref,
  groupInquiryHref,
  emailEnabled,
}: Props) {
  // Loaded once per page load by SiteSessionProvider (the page itself is static and signed-out).
  const { ready: sessionReady, session } = useSiteSession();
  const signedIn = Boolean(session.family);
  const [level, setLevel] = useState<1 | 2>(1);
  const [printed, setPrinted] = useState(false);
  const [emailState, setEmailState] = useState<string | null>(null);
  const [scale, setScale] = useState(262 / PAGE_W);
  const [binderOpen, setBinderOpen] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const awaitingReturn = useRef(false);

  const src = `${printBasePath}?level=${level}&embed=1`;

  useEffect(() => {
    setEmailState(readEmailState());
  }, []);

  useEffect(() => {
    const update = () => setScale(previewWidth() / PAGE_W);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Mobile: the print page opens in a new tab; show the follow-up when the user comes back.
  useEffect(() => {
    const onBack = () => {
      if (awaitingReturn.current && document.visibilityState === "visible") {
        awaitingReturn.current = false;
        setPrinted(true);
      }
    };
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("focus", onBack);
    return () => {
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("focus", onBack);
    };
  }, []);

  useEffect(() => {
    if (!binderOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBinderOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [binderOpen]);

  useEffect(() => {
    if (!copyMsg) return;
    const t = window.setTimeout(() => setCopyMsg(""), 2500);
    return () => window.clearTimeout(t);
  }, [copyMsg]);

  const onPrint = useCallback(() => {
    const frameWin = frameRef.current?.contentWindow;
    if (isMobileDevice() || !frameWin) {
      awaitingReturn.current = true;
      window.open(`${printBasePath}?level=${level}&autoprint=1`, "_blank", "noopener");
      return;
    }
    const done = () => setPrinted(true);
    frameWin.addEventListener("afterprint", done, { once: true });
    frameWin.focus();
    frameWin.print();
    // Some browsers block in print() and never fire afterprint on the frame.
    window.setTimeout(done, 500);
  }, [printBasePath, level]);

  const onCopy = async () => {
    const url = new URL(shareHref, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyMsg("Link copied");
    } catch {
      setCopyMsg(url);
    }
  };

  const choose = (value: "subscribed" | "dismissed") => {
    writeEmailState(value);
    setEmailState(value);
  };

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="shrink-0">
        <div
          className="-rotate-2 overflow-hidden rounded-xl border border-[#e7e3de] bg-white shadow-[0_16px_28px_-12px_rgba(0,0,0,0.32)]"
          style={{ width: PAGE_W * scale, height: PAGE_H * scale }}
        >
          <iframe
            ref={frameRef}
            key={src}
            src={src}
            title={`${title} – Level ${level} preview`}
            tabIndex={-1}
            style={{
              width: PAGE_W,
              height: PAGE_H,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#d35400]">This Sunday · {sundayLabel}</p>
        <h2 id="home-sunday-title" className="text-2xl font-bold leading-tight text-[#1c1c1c] sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm text-[#4b5563]">
          {liturgicalName} · {gospelRef}
        </p>

        <div
          role="radiogroup"
          aria-label="Level"
          className="inline-flex w-max gap-1 rounded-full border border-[#e7e3de] bg-white p-1"
        >
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={level === n}
              onClick={() => setLevel(n)}
              className={`rounded-full px-4 py-1.5 text-[15px] font-bold ${
                level === n ? "bg-[#1c1c1c] text-white" : "bg-transparent text-[#1c1c1c]"
              }`}
            >
              Level {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="w-full rounded-full bg-[#2e7d32] px-6 py-3.5 text-center text-xl font-extrabold text-white shadow-[0_10px_18px_-8px_rgba(46,125,50,0.65)] hover:bg-[#256628]"
        >
          🖨 Print Free Sheet
          <span className="mt-0.5 block text-xs font-semibold opacity-90">No sign-in needed</span>
        </button>

        <div className="relative flex gap-2">
          <button
            type="button"
            onClick={() => setBinderOpen((v) => !v)}
            aria-expanded={binderOpen}
            aria-controls="home-binder-pop"
            className="flex-1 whitespace-nowrap rounded-full border-2 border-[#2e7d32] bg-white px-3 py-2.5 text-sm font-extrabold text-[#2e7d32] hover:bg-[#f1f8f1]"
          >
            📒 Save to My Binder
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 whitespace-nowrap rounded-full border-2 border-[#d8cfc4] bg-white px-3 py-2.5 text-sm font-extrabold text-[#374151] hover:bg-[#faf7f3]"
          >
            🔗 Copy Link
          </button>

          {binderOpen ? (
            <div
              id="home-binder-pop"
              role="dialog"
              aria-label="My Binder"
              className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-[#e7dccf] bg-white p-4 text-sm shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[#1c1c1c]">📒 My Binder is coming soon</p>
                <button
                  type="button"
                  onClick={() => setBinderOpen(false)}
                  className="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-[#6b7280] hover:bg-[#f3f4f6]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {sessionReady && signedIn ? (
                <p className="mt-1 text-[#4b5563]">You&apos;re signed in. Saving sheets will open here soon.</p>
              ) : (
                <>
                  <p className="mt-1 text-[#4b5563]">Sign in with Google to save sheets here when it opens.</p>
                  <Link
                    href={SIGN_IN_HREF}
                    className="mt-3 inline-block rounded-full bg-[#2e7d32] px-5 py-2 font-bold text-white no-underline hover:bg-[#256628]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>
        <p className="min-h-[1.25rem] break-all text-xs font-semibold text-[#2e7d32]" aria-live="polite">
          {copyMsg}
        </p>

        {printed && emailEnabled && !emailState ? <EmailOptIn onDone={choose} /> : null}
        {printed && (emailState || !emailEnabled) ? (
          <p className="text-sm">
            Want seasonal bundles and early access?{" "}
            <Link href="/subscribe" className="font-semibold text-[var(--color-link)]">
              See Plus →
            </Link>
            {groupInquiryHref ? (
              <>
                {" · "}
                <a href={groupInquiryHref} className="text-[var(--color-muted)] underline">
                  Group/parish inquiry
                </a>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EmailOptIn({ onDone }: { onDone: (v: "subscribed" | "dismissed") => void }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage("Please tick the box to agree to receive the email.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source: "home-print" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
      onDone("subscribed");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return <p className="text-sm font-semibold text-green-700">Check your inbox to confirm.</p>;
  }

  return (
    <form
      onSubmit={submit}
      className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm"
      aria-label="Weekly sheet email"
    >
      <p className="font-semibold">Did it print well? Want next week&apos;s sheet in your inbox Friday morning?</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="sheet-email">
          Email
        </label>
        <input
          id="sheet-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-[var(--color-border)] bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-[var(--color-accent)] px-4 py-2 font-bold text-white disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send it to me"}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>
          Yes, email me the free weekly sheet from Catholic Kids Crafts. I can unsubscribe at any time.
        </span>
      </label>
      {status === "error" ? <p className="mt-2 text-red-700">{message}</p> : null}
      <button
        type="button"
        onClick={() => onDone("dismissed")}
        className="mt-2 text-xs text-[var(--color-muted)] underline"
      >
        No thanks
      </button>
    </form>
  );
}
