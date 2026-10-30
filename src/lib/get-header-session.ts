import { effectiveReaderMode, getFamilySession } from "@/lib/family-auth";
import { getReaderKey } from "@/lib/bible/reader";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { prisma } from "@/lib/prisma";
import { resolveFamilyPlus } from "@/lib/subscription/entitlements";

export async function getHeaderSession(): Promise<HeaderSessionResponse> {
  const [familySession, readerKey] = await Promise.all([
    getFamilySession(),
    getReaderKey(),
  ]);

  let family: HeaderSessionResponse["family"] = null;
  if (familySession) {
    const familyAccountId = familySession.familyAccountId;
    const [account, children, plus, mode] = await Promise.all([
      prisma.familyAccount.findUnique({
        where: { id: familyAccountId },
        select: { email: true, displayName: true },
      }),
      prisma.subProfile
        .findMany({
          where: { familyAccountId, active: true },
          select: { id: true, displayName: true },
          orderBy: { createdAt: "asc" },
        })
        .catch(() => []),
      resolveFamilyPlus(familyAccountId).catch(() => null),
      effectiveReaderMode(familySession),
    ]);
    const childMode = mode.type === "sub" || readerKey?.type === "sub";
    const isPlus = Boolean(plus?.isPlus);
    const plusEndsAt = plus?.source === "pass" && plus.pass.endsAt ? plus.pass.endsAt.toISOString() : null;
    if (account) {
      family = childMode
        ? {
            // Child mode: no parent email, family name or sibling names reach the browser.
            email: "",
            displayName: null,
            isPlus: false,
            children:
              readerKey?.type === "sub"
                ? children.filter((c) => c.id === readerKey.subProfileId)
                : [],
            childMode: true,
            plusEndsAt: null,
          }
        : {
            email: account.email,
            displayName: account.displayName,
            isPlus,
            children,
            childMode: false,
            plusEndsAt,
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
        reader = { type: "sub", displayName: sub.displayName, subProfileId: readerKey.subProfileId };
      }
    }
  }

  return { family, reader };
}
