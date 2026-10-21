export type HeaderSessionChild = { id: string; displayName: string };

export type HeaderSessionResponse = {
  family: {
    email: string;
    displayName: string | null;
    /** Family has Plus (existing entitlement helper). Optional for older payloads. */
    isPlus?: boolean;
    /** Active child profiles, for the "Reading as" list. */
    children?: HeaderSessionChild[];
  } | null;
  reader: { type: "owner" | "sub"; displayName: string; subProfileId?: string } | null;
};

export function headerButtonLabel(session: HeaderSessionResponse | null): string {
  if (!session) return "Sign in";
  if (session.family) {
    return session.family.displayName?.trim() || session.family.email;
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
