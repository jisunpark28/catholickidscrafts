import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { getFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";

export type GallerySubmitterContext = {
  familyAccountId: string;
  defaultAuthorName: string;
};

function resolveDisplayName(
  displayName: string | null | undefined,
  email: string | null | undefined,
  fallback: string,
): string {
  const name = displayName?.trim();
  if (name) return name.slice(0, 40);
  const local = email?.split("@")[0]?.trim();
  if (local) return local.slice(0, 40);
  return fallback;
}

/** Family account or signed-in reader (parent / Access ID student). */
export async function getGallerySubmitterContext(): Promise<GallerySubmitterContext | null> {
  const family = await getFamilySession();
  if (family) {
    const account = await prisma.familyAccount.findUnique({
      where: { id: family.familyAccountId },
      select: { id: true, displayName: true, email: true },
    });
    if (!account) return null;
    return {
      familyAccountId: account.id,
      defaultAuthorName: resolveDisplayName(account.displayName, account.email, "Our family"),
    };
  }

  const reader = await getReaderKey();
  if (!isSignedInReaderKey(reader)) return null;

  if (reader.type === "owner") {
    const account = await prisma.familyAccount.findUnique({
      where: { id: reader.familyAccountId },
      select: { id: true, displayName: true, email: true },
    });
    if (!account) return null;
    return {
      familyAccountId: account.id,
      defaultAuthorName: resolveDisplayName(account.displayName, account.email, "Parent"),
    };
  }

  const sub = await prisma.subProfile.findUnique({
    where: { id: reader.subProfileId },
    select: { familyAccountId: true, displayName: true, active: true },
  });
  if (!sub?.active) return null;

  return {
    familyAccountId: sub.familyAccountId,
    defaultAuthorName: sub.displayName.trim().slice(0, 40) || "Reader",
  };
}
