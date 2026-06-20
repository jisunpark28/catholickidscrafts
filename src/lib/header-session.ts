import { getFamilySession } from "@/lib/family-auth";
import { getReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";

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

export async function getHeaderSession(): Promise<HeaderSessionResponse> {
  const [familySession, readerKey] = await Promise.all([
    getFamilySession(),
    getReaderKey(),
  ]);

  let family: HeaderSessionResponse["family"] = null;
  if (familySession) {
    const account = await prisma.familyAccount.findUnique({
      where: { id: familySession.familyAccountId },
      select: { email: true, displayName: true },
    });
    if (account) {
      family = {
        email: account.email,
        displayName: account.displayName,
      };
    }
  }

  let reader: HeaderSessionResponse["reader"] = null;
  if (readerKey && readerKey.type !== "guest") {
    if (readerKey.type === "owner") {
      const account = await prisma.familyAccount.findUnique({
        where: { id: readerKey.familyAccountId },
        select: { displayName: true, email: true },
      });
      reader = {
        type: "owner",
        displayName: account?.displayName ?? account?.email ?? "Parent",
      };
    } else {
      const sub = await prisma.subProfile.findUnique({
        where: { id: readerKey.subProfileId },
        select: { displayName: true, active: true },
      });
      if (sub?.active) {
        reader = { type: "sub", displayName: sub.displayName };
      }
    }
  }

  return { family, reader };
}
