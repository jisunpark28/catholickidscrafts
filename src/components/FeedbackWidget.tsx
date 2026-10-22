"use client";

import { FEEDBACK_CATEGORIES, FEEDBACK_EMAIL_MAX, FEEDBACK_MESSAGE_MAX, type FeedbackCategory } from "@/lib/feedback";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/** Floating "💬 Feedback" button (bottom-right, every page) that opens an accessible modal form. */
export function FeedbackWidget() {
  const pathname = usePathname() ?? "/";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState<FeedbackCategory>(FEEDBACK_CATEGORIES[0].id);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const uid = useId();

  // Close on browser back/navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Printable sheets (and their embedded previews) stay clean.
  if (pathname.startsWith("/print")) return null;

  const hint = FEEDBACK_CATEGORIES.find((c) => c.id === category)?.hint ?? "";

  function open() {
    if (status === "sent") {
      setStatus("idle");
      setMessage("");
    }
    setError("");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setStatus("error");
      setError("Please write a message.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, email, pagePath: pathname, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const field = "mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-base text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[#d35400]";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Feedback"
        className="fixed right-2 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#e7d9c8] bg-white/95 text-lg sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-sm font-bold text-[var(--color-ink)] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.35)] backdrop-blur hover:border-[#d35400] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] print:hidden sm:right-5"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <span aria-hidden>💬</span>
        <span className="hidden sm:inline">&nbsp;Feedback</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        onClose={() => triggerRef.current?.focus()}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(100vw-1.5rem,32rem)] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-[#efe6da] bg-white p-0 text-[var(--color-ink)] shadow-2xl backdrop:bg-black/40 print:hidden"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id={`${uid}-title`} className="text-xl font-bold">
              <span aria-hidden>💬</span> Feedback
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close feedback form"
              className="-mr-2 -mt-1 rounded-full px-3 py-1 text-2xl leading-none text-[var(--color-muted)] hover:bg-[#f6efe6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
            >
              ×
            </button>
          </div>

          {status === "sent" ? (
            <div role="status" className="mt-4">
              <p className="font-semibold text-green-800">Thank you! Your message was sent.</p>
              <button
                type="button"
                onClick={close}
                className="mt-4 rounded-full bg-[#d35400] px-5 py-2 font-bold text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-4 space-y-4">
              <div>
                <label htmlFor={`${uid}-cat`} className="text-sm font-semibold">
                  Category
                </label>
                <select
                  id={`${uid}-cat`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  aria-describedby={hint ? `${uid}-hint` : undefined}
                  className={field}
                >
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {hint ? (
                  <p id={`${uid}-hint`} className="mt-1 text-xs text-[var(--color-muted)]">
                    {hint}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={`${uid}-msg`} className="text-sm font-semibold">
                  Message <span className="font-normal text-[var(--color-muted)]">(required)</span>
                </label>
                <textarea
                  id={`${uid}-msg`}
                  required
                  aria-required="true"
                  rows={5}
                  maxLength={FEEDBACK_MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={field}
                />
              </div>

              <div>
                <label htmlFor={`${uid}-email`} className="text-sm font-semibold">
                  Email <span className="font-normal text-[var(--color-muted)]">(optional)</span>
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="email"
                  maxLength={FEEDBACK_EMAIL_MAX}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={`${uid}-email-hint`}
                  className={field}
                />
                <p id={`${uid}-email-hint`} className="mt-1 text-xs text-[var(--color-muted)]">
                  For replies and to hear when your new card is ready.
                </p>
              </div>

              {/* Honeypot for bots; hidden from people and screen readers. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>

              {status === "error" && error ? (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-[var(--color-border)] px-5 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-full bg-[#d35400] px-6 py-2 font-bold text-white disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
