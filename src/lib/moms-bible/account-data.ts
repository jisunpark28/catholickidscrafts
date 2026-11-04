/** /account data for the Mom's Bible section. Server only. Reads only (settings are created on first write). */
import { prisma } from "@/lib/prisma";
import { memoImportOffer } from "./memo-import-server";
import { parentUnseenReplies } from "./queries";

export async function accountMomsBible(parentId: string) {
  const [settings, links, own, replies, memoImport] = await Promise.all([
    prisma.mbParentSettings.findUnique({ where: { parentAccountId: parentId }, select: { emailMode: true } }),
    prisma.parentChildLink.findMany({
      where: { parentAccountId: parentId, child: { active: true } },
      select: { id: true, roleLabel: true, isOwner: true, child: { select: { displayName: true, familyAccountId: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subProfile.findMany({
      where: { familyAccountId: parentId, active: true },
      select: { id: true, displayName: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    parentUnseenReplies(parentId),
    // Kept on /account until the memos are moved (even after "Not now").
    memoImportOffer(parentId, { force: true }).catch(() => null),
  ]);
  return {
    emailMode: settings?.emailMode ?? ("INSTANT" as const),
    roleLabel: links[0]?.roleLabel ?? "Mom",
    ownChildren: own,
    joined: links
      .filter((l) => !l.isOwner && l.child.familyAccountId !== parentId)
      .map((l) => ({ linkId: l.id, childName: l.child.displayName })),
    replies,
    memoImport,
  };
}
