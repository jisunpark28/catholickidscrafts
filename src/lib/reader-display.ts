import { getReaderKey } from "@/lib/bible/reader";
import { getFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";

export type ReaderDisplay =
  | { mode: "guest" }
  | { mode: "owner"; displayName: string | null; email: string }
  | { mode: "sub"; displayName: string };

export async function getReaderDisplay(): Promise<ReaderDisplay> {
  const key = await getReaderKey();
  if (!key) return { mode: "guest" };
  if (key.type === "guest") return { mode: "guest" };

  if (key.type === "owner") {
    const family = await getFamilySession();
    const account = await prisma.familyAccount.findUnique({
      where: { id: key.familyAccountId },
      select: { displayName: true, email: true },
    });
    return {
      mode: "owner",
      displayName: account?.displayName ?? family?.email ?? null,
      email: account?.email ?? family?.email ?? "",
    };
  }

  const sub = await prisma.subProfile.findUnique({
    where: { id: key.subProfileId },
    select: { displayName: true, active: true },
  });
  if (!sub?.active) return { mode: "guest" };
  return { mode: "sub", displayName: sub.displayName };
}
