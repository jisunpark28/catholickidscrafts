"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  slug: string;
  title: string;
  liturgicalName: string;
  sundayLabel: string;
  gospelRef: string;
  groupInquiryHref: string | null;
  /** False until RESEND_API_KEY, EMAIL_FROM and MAILING_ADDRESS are set: skip straight to the Plus line. */
  emailEnabled: boolean;
  /** "1 / 6" label shown when rendered as a carousel slide. */
  position?: string;
};

const PAGE_W = 816; // 8.5in at 96dpi
const PAGE_H = 1056; // 11in
const EMAIL_STATE_KEY = "ckc.sheetEmail"; // "subscribed" | "dismissed"

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

/** Homepage hero: this Sunday's sheet, one big Print button, then an inline email opt-in. */
export function SundaySheetHero({ slug, title, liturgicalName, sundayLabel, gospelRef, groupInquiryHref, emailEnabled, position }: Props) {
  const [level, setLevel] = useState<1 | 2>(1);
  const [printed, setPrinted] = useState(false);
  const [emailState, setEmailState] = useState<string | null>(null);
  const [scale, setScale] = useState(0.4);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const awaitingReturn = useRef(false);

  const src = `/print/${slug}?level=${level}&embed=1`;

  useEffect(() => {
    setEmailState(readEmailState());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w <= 0) return; // hidden slide: keep last scale
      const max = window.innerWidth < 640 ? 170 : 330; // desktop: fills the equal-height card // smaller on phones so Print stays high
      setScale(Math.min(w, max) / PAGE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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

  const onPrint = useCallback(() => {
    const frameWin = frameRef.current?.contentWindow;
    if (isMobileDevice() || !frameWin) {
      awaitingReturn.current = true;
      window.open(`/print/${slug}?level=${level}&autoprint=1`, "_blank", "noopener");
      return;
    }
    const done = () => setPrinted(true);
    frameWin.addEventListener("afterprint", done, { once: true });
    frameWin.focus();
    frameWin.print();
    // Some browsers block in print() and never fire afterprint on the frame.
    window.setTimeout(done, 500);
  }, [slug, level]);

  const choose = (value: "subscribed" | "dismissed") => {
    writeEmailState(value);
    setEmailState(value);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
      <div ref={wrapRef} className="w-full lg:w-[46%] lg:shrink-0">
        <div
          className="mx-auto -rotate-2 overflow-hidden rounded-xl border border-[#e7e3de] bg-white shadow-[0_14px_26px_-10px_rgba(0,0,0,0.3)]"
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

      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-4 lg:pr-6">
        <p className="text-sm font-semibold text-[#d35400]">
          {position ? `${position} · ` : null}This Sunday · {sundayLabel}
        </p>
        <h3 className="text-2xl font-bold leading-tight text-[#1c1c1c] sm:text-3xl">
          {title}
        </h3>
        <p className="text-base text-[#4b5563]">
          {liturgicalName} · {gospelRef}
        </p>

        <div role="radiogroup" aria-label="Level" className="flex gap-2">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={level === n}
              onClick={() => setLevel(n)}
              className={`rounded-full border px-4 py-2 text-base font-semibold ${
                level === n ? "border-[#1c1c1c] bg-[#1c1c1c] text-white" : "border-[#e7e3de] bg-white text-[#1c1c1c]"
              }`}
            >
              Level {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="w-full rounded-full bg-[#2e7d32] px-8 py-4 text-xl font-bold shadow-[0_8px_16px_-8px_rgba(46,125,50,0.6)] text-white hover:bg-[#256628] sm:w-auto sm:self-start"
        >
          🖨 Print this week&apos;s sheet
        </button>

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
