/**
 * Who is using Mom's Bible on this request, and what they may touch. Server only.
 * Identity always comes from the signed session (getReaderKey / parent guard), never the body.
 */
import { getReaderKey } from "@/lib/bible/reader";
import { requireParentActive } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { childHasFamilyPass } from "@/lib/subscription/entitlements";
import type { ParentFacts } from "./rules";

export type MbLinkedChild = { id: string; displayName: string; roleLabel: string; isOwner: boolean };

export type MbViewer =
  | { kind: "parent"; parentId: string; children: MbLinkedChild[] }
  | { kind: "child"; childId: string; displayName: string; kidCode: string | null };

/**
 * Children a parent may see: ParentChildLink rows (owner + co-parent) for active children, plus
 * the parent's own children as a fallback (every child got an owner link in PR-1).
 */
export async function linkedChildren(parentId: string): Promise<MbLinkedChild[]> {
  const [links, owned] = await Promise.all([
    prisma.parentChildLink.findMany({
      where: { parentAccountId: parentId, child: { active: true } },
      select: {
        roleLabel: true,
        isOwner: true,
        child: { select: { id: true, displayName: true, sortOrder: true, createdAt: true } },
      },
    }),
    prisma.subProfile.findMany({
      where: { familyAccountId: parentId, active: true },
      select: { id: true, displayName: true, sortOrder: true, createdAt: true },
    }),
  ]);
  const map = new Map<string, MbLinkedChild & { sort: number; created: number }>();
  for (const l of links) {
    map.set(l.child.id, {
      id: l.child.id,
      displayName: l.child.displayName,
      roleLabel: l.roleLabel,
      isOwner: l.isOwner,
      sort: l.child.sortOrder,
      created: l.child.createdAt.getTime(),
    });
  }
  for (const c of owned) {
    if (!map.has(c.id)) {
      map.set(c.id, {
        id: c.id,
        displayName: c.displayName,
        roleLabel: "Parent",
        isOwner: true,
        sort: c.sortOrder,
        created: c.createdAt.getTime(),
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => Number(b.isOwner) - Number(a.isOwner) || a.sort - b.sort || a.created - b.created)
    .map(({ id, displayName, roleLabel, isOwner }) => ({ id, displayName, roleLabel, isOwner }));
}

/** Mom's Bible viewer for pages: a parent (not in child mode) or a signed-in child. */
export async function getMbViewer(): Promise<MbViewer | null> {
  const key = await getReaderKey();
  if (!key || key.type === "guest") return null;
  if (key.type === "sub") {
    const sub = await prisma.subProfile.findUnique({
      where: { id: key.subProfileId },
      select: { id: true, displayName: true, active: true, kidCode: true },
    });
    return sub?.active ? { kind: "child", childId: sub.id, displayName: sub.displayName, kidCode: sub.kidCode } : null;
  }
  const parent = await requireParentActive();
  if (!parent || parent.familyAccountId !== key.familyAccountId) return null;
  return { kind: "parent", parentId: parent.familyAccountId, children: await linkedChildren(parent.familyAccountId) };
}

/** Is `parentId` linked to active child `childId`? */
export async function isParentLinked(parentId: string, childId: string): Promise<boolean> {
  const row = await prisma.subProfile.findFirst({
    where: {
      id: childId,
      active: true,
      OR: [{ familyAccountId: parentId }, { parentLinks: { some: { parentAccountId: parentId } } }],
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function parentFacts(parentId: string, childId: string): Promise<ParentFacts> {
  const linked = await isParentLinked(parentId, childId);
  if (!linked) return { linked: false, familyPass: false };
  return { linked: true, familyPass: await childHasFamilyPass(childId) };
}

/** Parents linked to a child with their role labels (owner first). */
export async function linkedParents(childId: string): Promise<{ parentId: string; roleLabel: string; isOwner: boolean }[]> {
  const [sub, links] = await Promise.all([
    prisma.subProfile.findUnique({ where: { id: childId }, select: { familyAccountId: true } }),
    prisma.parentChildLink.findMany({
      where: { subProfileId: childId },
      select: { parentAccountId: true, roleLabel: true, isOwner: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const out = links.map((l) => ({ parentId: l.parentAccountId, roleLabel: l.roleLabel, isOwner: l.isOwner }));
  if (sub && !out.some((p) => p.parentId === sub.familyAccountId)) {
    out.unshift({ parentId: sub.familyAccountId, roleLabel: "Parent", isOwner: true });
  }
  return out.sort((a, b) => Number(b.isOwner) - Number(a.isOwner));
}
