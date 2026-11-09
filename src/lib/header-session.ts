export type HeaderSessionChild = { id: string; displayName: string };

export type HeaderSessionResponse = {
  family: {
    email: string;
    displayName: string | null;
    /** Family has Plus (existing entitlement helper). Optional for older payloads. */
    isPlus?: boolean;
    /** Active child profiles, for the "Reading as" list. */
    children?: HeaderSessionChild[];
    /** Device is in child mode: returning to the parent needs a fresh Google sign-in. */
    childMode?: boolean;
    /** ISO end of the family's one-time Plus pass (parent only; null in child mode). */
    plusEndsAt?: string | null;
  } | null;
  reader: { type: "owner" | "sub"; displayName: string; subProfileId?: string } | null;
};

/**
 * GET /api/auth/session: the header session plus the sidebar's paid-Plus flag, so the
 * cookie-free site layout needs one request per page load. Display only: pages and APIs
 * still check the session and entitlements on the server.
 */
export type SiteSessionResponse = HeaderSessionResponse & {
  /** Server-computed (lib/sidebar-access); only shows Plus-only sidebar items. */
  paidPlus?: boolean;
};

export const SIGNED_OUT_SESSION: HeaderSessionResponse = { family: null, reader: null };

export function headerButtonLabel(session: HeaderSessionResponse | null): string {
  if (!session) return "Sign in";
  if (session.family) {
    return session.family.displayName?.trim() || session.family.email || "Parent";
  }
  if (session.reader) {
    return session.reader.displayName;
  }
  return "Sign in";
}

export function isHeaderSignedIn(session: HeaderSessionResponse | null): boolean {
  return Boolean(session?.family || session?.reader);
}

export function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (trimmed.includes("@")) return trimmed.split("@")[0];
  return trimmed.split(/\s+/)[0];
}

export function avatarInitial(name: string): string {
  return (firstName(name).charAt(0) || "?").toUpperCase();
}
