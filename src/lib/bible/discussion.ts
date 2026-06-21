import { prisma } from "@/lib/prisma";
import type { SignedInReaderKey } from "@/lib/bible/discussion-reader";
import { readerAuthorIds } from "@/lib/bible/discussion-reader";

export const DISCUSSION_BODY_MAX = 2000;

export function normalizeDiscussionBody(body: unknown): string | null {
  if (typeof body !== "string") return null;
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > DISCUSSION_BODY_MAX) return null;
  return trimmed;
}

export function parseDiscussionAnonymous(value: unknown): boolean {
  return value === true;
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

type CreateDiscussionPostInput = {
  body: string;
  isAnonymous: boolean;
  authorLabel: string;
  readerKey: SignedInReaderKey;
};

export async function createChapterThread(
  bookSlug: string,
  chapter: number,
  input: CreateDiscussionPostInput,
) {
  const authorIds = readerAuthorIds(input.readerKey);
  return prisma.bibleChapterThread.create({
    data: {
      bookSlug,
      chapter,
      body: input.body,
      isAnonymous: input.isAnonymous,
      authorLabel: input.authorLabel,
      ...authorIds,
    },
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

export async function createChapterComment(threadId: string, input: CreateDiscussionPostInput) {
  const authorIds = readerAuthorIds(input.readerKey);
  return prisma.bibleChapterComment.create({
    data: {
      threadId,
      body: input.body,
      isAnonymous: input.isAnonymous,
      authorLabel: input.authorLabel,
      ...authorIds,
    },
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
