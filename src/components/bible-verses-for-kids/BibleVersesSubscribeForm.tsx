"use client";

import { useState } from "react";

/** Friday Sunday-Mass newsletter opt-in (same /api/subscribe + subscribers table). */
export function BibleVersesSubscribeForm() {
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
        body: JSON.stringify({ email, consent, source: "bible-verses-for-kids" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
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
      className="rounded-2xl border border-[#f0d9b8] bg-white/80 p-4 text-sm sm:p-5"
      aria-label="Catholic parenting newsletter"
    >
      <p className="font-[Georgia,serif] text-base font-bold text-[#1f2937]">
        Get weekly Catholic parenting and scripture prompts
      </p>
      <p className="mt-1 text-[#4b5563]">
        The same Friday Sunday-Mass sheet email — free, and you can unsubscribe anytime.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="bv-email">
          Email
        </label>
        <input
          id="bv-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-[#c9773a] px-5 py-2 font-bold text-white hover:bg-[#b5662e] disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-[#374151]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>
          Yes, email me free weekly Catholic parenting and scripture prompts from Catholic Kids Crafts. I can
          unsubscribe at any time.
        </span>
      </label>
      {status === "error" ? <p className="mt-2 text-red-700">{message}</p> : null}
    </form>
  );
}
