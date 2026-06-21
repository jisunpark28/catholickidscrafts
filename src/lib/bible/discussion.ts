import { prisma } from "@/lib/prisma";

export const DISCUSSION_BODY_MAX = 2000;

export function normalizeDiscussionBody(body: unknown): string | null {
  if (typeof body !== "string") return null;
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > DISCUSSION_BODY_MAX) return null;
  return trimmed;
}

export async function listChapterDiscussion(bookSlug: string, chapter: number) {
  return prisma.bibleChapterThread.findMany({
    where: { bookSlug, chapter },
    orderBy: { createdAt: "asc" },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createChapterThread(
  bookSlug: string,
  chapter: number,
  body: string,
  authorTokenHash: string,
) {
  return prisma.bibleChapterThread.create({
    data: { bookSlug, chapter, body, authorTokenHash },
  });
}

export async function updateChapterThread(threadId: string, body: string) {
  return prisma.bibleChapterThread.update({
    where: { id: threadId },
    data: { body },
  });
}

export async function deleteChapterThread(threadId: string) {
  return prisma.bibleChapterThread.delete({ where: { id: threadId } });
}

export async function getChapterThread(threadId: string) {
  return prisma.bibleChapterThread.findUnique({ where: { id: threadId } });
}

export async function createChapterComment(
  threadId: string,
  body: string,
  authorTokenHash: string,
) {
  return prisma.bibleChapterComment.create({
    data: { threadId, body, authorTokenHash },
  });
}

export async function updateChapterComment(commentId: string, body: string) {
  return prisma.bibleChapterComment.update({
    where: { id: commentId },
    data: { body },
  });
}

export async function deleteChapterComment(commentId: string) {
  return prisma.bibleChapterComment.delete({ where: { id: commentId } });
}

export async function getChapterComment(commentId: string) {
  return prisma.bibleChapterComment.findUnique({ where: { id: commentId } });
}
