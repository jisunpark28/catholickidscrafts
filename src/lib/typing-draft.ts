import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";

const MAX_DRAFT_CHARS = 500_000;

export type TypingDraftPayload = {
  typedText: string;
  elapsedMs: number | null;
  updatedAt: string | null;
};

function draftWhere(key: ReaderKey, draftKey: string) {
  if (key.type === "guest") {
    return { guestId: key.guestId, draftKey };
  }
  if (key.type === "owner") {
    return { familyAccountId: key.familyAccountId, draftKey };
  }
  return { subProfileId: key.subProfileId, draftKey };
}

function upsertWhere(key: ReaderKey, draftKey: string) {
  if (key.type === "guest") {
    return { guestId_draftKey: { guestId: key.guestId, draftKey } };
  }
  if (key.type === "owner") {
    return {
      familyAccountId_draftKey: { familyAccountId: key.familyAccountId, draftKey },
    };
  }
  return { subProfileId_draftKey: { subProfileId: key.subProfileId, draftKey } };
}

export function isValidDraftKey(draftKey: string): boolean {
  return draftKey.length > 0 && draftKey.length <= 200 && /^[a-z0-9:_-]+$/i.test(draftKey);
}

export async function getTypingDraft(
  key: ReaderKey,
  draftKey: string,
): Promise<TypingDraftPayload | null> {
  const row = await prisma.typingDraft.findFirst({
    where: draftWhere(key, draftKey),
    select: { typedText: true, elapsedMs: true, updatedAt: true },
  });
  if (!row) return null;
  return {
    typedText: row.typedText,
    elapsedMs: row.elapsedMs,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveTypingDraft(
  key: ReaderKey,
  draftKey: string,
  typedText: string,
  elapsedMs?: number | null,
): Promise<void> {
  const text = typedText.slice(0, MAX_DRAFT_CHARS);
  const data = {
    draftKey,
    typedText: text,
    elapsedMs: Number.isFinite(elapsedMs) ? Math.max(0, Math.floor(elapsedMs!)) : null,
    guestId: key.type === "guest" ? key.guestId : null,
    familyAccountId: key.type === "owner" ? key.familyAccountId : null,
    subProfileId: key.type === "sub" ? key.subProfileId : null,
  };

  await prisma.typingDraft.upsert({
    where: upsertWhere(key, draftKey),
    create: data,
    update: {
      typedText: data.typedText,
      elapsedMs: data.elapsedMs,
    },
  });
}

export async function deleteTypingDraft(key: ReaderKey, draftKey: string): Promise<void> {
  await prisma.typingDraft.deleteMany({
    where: draftWhere(key, draftKey),
  });
}
