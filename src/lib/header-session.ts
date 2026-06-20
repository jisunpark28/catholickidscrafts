export type HeaderSessionResponse = {
  family: { email: string; displayName: string | null } | null;
  reader: { type: "owner" | "sub"; displayName: string } | null;
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
