import { prisma } from "@/lib/prisma";
import type { ReaderKey } from "@/lib/bible/reader";

export const DISCUSSION_PEN_NAME_MAX = 40;

export function normalizeDiscussionPenName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > DISCUSSION_PEN_NAME_MAX) return null;
  return trimmed;
}

export function resolveDiscussionPenName(
  discussionPenName: string | null | undefined,
  displayName: string | null | undefined,
): string | null {
  const pen = discussionPenName?.trim();
  if (pen) return pen;
  const display = displayName?.trim();
  if (display) return display;
  return null;
}

export async function getDiscussionPenNameForReader(
  readerKey: Exclude<ReaderKey, { type: "guest" }>,
): Promise<{ penName: string | null; needsPenName: boolean }> {
  if (readerKey.type === "owner") {
    const account = await prisma.familyAccount.findUnique({
      where: { id: readerKey.familyAccountId },
      select: { discussionPenName: true, displayName: true },
    });
    const penName = resolveDiscussionPenName(
      account?.discussionPenName,
      account?.displayName,
    );
    return { penName, needsPenName: !penName };
  }

  const sub = await prisma.subProfile.findUnique({
    where: { id: readerKey.subProfileId },
    select: { discussionPenName: true, displayName: true },
  });
  const penName = resolveDiscussionPenName(sub?.discussionPenName, sub?.displayName);
  return { penName, needsPenName: !penName };
}

export async function saveDiscussionPenName(
  readerKey: Exclude<ReaderKey, { type: "guest" }>,
  penName: string,
): Promise<void> {
  if (readerKey.type === "owner") {
    await prisma.familyAccount.update({
      where: { id: readerKey.familyAccountId },
      data: { discussionPenName: penName },
    });
    return;
  }

  await prisma.subProfile.update({
    where: { id: readerKey.subProfileId },
    data: { discussionPenName: penName },
  });
}
