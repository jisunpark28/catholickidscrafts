"use client";

import {
  SIGNED_OUT_SESSION,
  type HeaderSessionResponse,
  type SiteSessionResponse,
} from "@/lib/header-session";
import { hasSessionMarker } from "@/lib/session-marker";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Per-user header data for the cookie-free site layout. The server renders the signed-out
 * version (so pages can be static); the browser then loads the real session ONCE per page
 * load from /api/auth/session. Display only: every protected page and API still checks the
 * signed session cookies on the server.
 */
type SiteSessionState = {
  /** False until we know whether someone is signed in (account slot shows a placeholder). */
  ready: boolean;
  session: HeaderSessionResponse;
  /** Server-computed paid-Plus flag; only shows Plus-only sidebar items. */
  paidPlus: boolean;
  refresh: () => Promise<void>;
};

const SiteSessionContext = createContext<SiteSessionState>({
  ready: false,
  session: SIGNED_OUT_SESSION,
  paidPlus: false,
  refresh: async () => {},
});

/** Fired after an in-page sign-in or a change to the family's children (no full reload). */
const SESSION_CHANGED_EVENT = "ckc:session-changed";

export function notifySessionChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

/**
 * One-time check per browser for sessions that began before the marker cookie existed:
 * the response sets the marker when signed in, so later page loads skip guests entirely.
 */
const PROBE_KEY = "ckc.sessionProbe.v1";

function probeDone(): boolean {
  try {
    return window.localStorage.getItem(PROBE_KEY) === "1";
  } catch {
    return true; // storage blocked: rely on the marker only
  }
}

function markProbeDone(): void {
  try {
    window.localStorage.setItem(PROBE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function SiteSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<HeaderSessionResponse>(SIGNED_OUT_SESSION);
  const [paidPlus, setPaidPlus] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as SiteSessionResponse;
      setSession({ family: data.family ?? null, reader: data.reader ?? null });
      setPaidPlus(data.paidPlus === true);
      markProbeDone();
    } catch {
      setSession(SIGNED_OUT_SESSION);
      setPaidPlus(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (hasSessionMarker() || !probeDone()) {
      void refresh();
    } else {
      setReady(true);
    }
    const onChanged = () => void refresh();
    window.addEventListener(SESSION_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, onChanged);
  }, [refresh]);

  const value = useMemo(() => ({ ready, session, paidPlus, refresh }), [ready, session, paidPlus, refresh]);
  return <SiteSessionContext.Provider value={value}>{children}</SiteSessionContext.Provider>;
}

export function useSiteSession(): SiteSessionState {
  return useContext(SiteSessionContext);
}
