"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mbFetch } from "./mb-fetch";
import "@/styles/moms-bible.css";

export const INVITE_STORAGE_KEY = "ckc_mb_invite";

/** Reads the invite token from #fragment (or this tab's storage after sign-in) and accepts it. */
export function InviteAcceptClient({ signedIn, compact = false }: { signedIn: boolean; compact?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const fromHash = window.location.hash.slice(1);
      if (fromHash) {
        window.sessionStorage.setItem(INVITE_STORAGE_KEY, fromHash);
        history.replaceState(null, "", window.location.pathname);
      }
      setToken(fromHash || window.sessionStorage.getItem(INVITE_STORAGE_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  if (!token) {
    return compact ? null : (
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        This page needs the full invite link. Open the link you were sent again.
      </p>
    );
  }

  if (!signedIn) {
    return (
      <div className="mt-6 rounded-2xl border border-[#f3d9bf] bg-[#fff3e6] p-5 text-center">
        <p className="text-sm text-[var(--color-ink)]">
          First sign in or create your own free parent account. Then come back to your account page to accept.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/account/login" className="mb-btn mb-btn--primary">
            Sign in
          </Link>
          <Link href="/account/signup" className="mb-btn mb-btn--ghost">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function accept() {
    setState("busy");
    const res = await mbFetch<{ children: string[] }>("/api/moms-bible/invites/accept", "POST", { token });
    try {
      window.sessionStorage.removeItem(INVITE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      setState("error");
      setMessage(res.error);
      return;
    }
    setState("done");
    setMessage(`You're linked to ${res.data.children.join(" and ")}'s Bible. Open any chapter to leave a note.`);
  }

  return (
    <div className={`${compact ? "" : "mt-6 "}rounded-2xl border border-[#f3d9bf] bg-[#fff3e6] p-5 text-center`}>
      {state === "done" ? (
        <>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{message}</p>
          <Link href="/bible/psalms" className="mb-btn mb-btn--primary mt-3 inline-block">
            Open the Bible
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--color-ink)]">You have an invite to join your child&apos;s Bible.</p>
          <button type="button" className="mb-btn mb-btn--primary mt-3" disabled={state === "busy"} onClick={() => void accept()}>
            {state === "busy" ? "Joining…" : "Accept invite"}
          </button>
          {state === "error" && (
            <p className="mb-error mt-2" role="alert">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
