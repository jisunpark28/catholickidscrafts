import { prisma } from "@/lib/prisma";

export const LESSON_KIT_COMMENT_BODY_MAX = 2000;
export const LESSON_KIT_COMMENT_AUTHOR_MAX = 80;

export type LessonKitCommentDto = {
  id: string;
  body: string;
  authorName: string;
  parentId: string | null;
  createdAt: string;
  isMine: boolean;
};

export function normalizeLessonKitCommentBody(body: unknown): string | null {
  if (typeof body !== "string") return null;
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > LESSON_KIT_COMMENT_BODY_MAX) return null;
  return trimmed;
}

export function normalizeLessonKitCommentAuthorName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > LESSON_KIT_COMMENT_AUTHOR_MAX) return null;
  return trimmed;
}

export async function getCommunityCommentKit(kitId: string) {
  return prisma.lessonKit.findUnique({
    where: { id: kitId },
    select: {
      id: true,
      scope: true,
      communityVisible: true,
    },
  });
}

export function kitAllowsPublicComments(
  kit: { scope: string; communityVisible: boolean } | null,
): kit is { scope: string; communityVisible: boolean; id: string } {
  return Boolean(kit && kit.scope === "PERSONAL" && kit.communityVisible);
}

function commentAuthorLabel(
  comment: { authorName: string | null; familyAccount: { displayName: string | null } | null },
): string {
  const snapshot = comment.authorName?.trim();
  if (snapshot) return snapshot;
  const accountName = comment.familyAccount?.displayName?.trim();
  if (accountName) return accountName;
  return "Teacher";
}

function serializeComment(
  comment: {
    id: string;
    body: string;
    authorName: string | null;
    parentId: string | null;
    createdAt: Date;
    familyAccountId: string | null;
    familyAccount: { displayName: string | null } | null;
  },
  viewerFamilyAccountId: string | null,
): LessonKitCommentDto {
  return {
    id: comment.id,
    body: comment.body,
    authorName: commentAuthorLabel(comment),
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    isMine: Boolean(
      viewerFamilyAccountId &&
        comment.familyAccountId &&
        comment.familyAccountId === viewerFamilyAccountId,
    ),
  };
}

export async function listLessonKitComments(
  kitId: string,
  viewerFamilyAccountId: string | null,
): Promise<LessonKitCommentDto[]> {
  const rows = await prisma.lessonKitComment.findMany({
    where: { kitId },
    orderBy: { createdAt: "asc" },
    include: {
      familyAccount: { select: { displayName: true } },
    },
  });

  return rows.map((row) => serializeComment(row, viewerFamilyAccountId));
}

type CreateLessonKitCommentInput = {
  kitId: string;
  familyAccountId: string;
  body: string;
  parentId?: string | null;
  authorName?: string | null;
  fallbackAuthorName?: string | null;
};

export async function createLessonKitComment(
  input: CreateLessonKitCommentInput,
): Promise<LessonKitCommentDto | null> {
  if (input.parentId) {
    const parent = await prisma.lessonKitComment.findFirst({
      where: { id: input.parentId, kitId: input.kitId },
      select: { id: true },
    });
    if (!parent) return null;
  }

  const authorSnapshot =
    input.authorName?.trim() ||
    input.fallbackAuthorName?.trim() ||
    null;

  const created = await prisma.lessonKitComment.create({
    data: {
      kitId: input.kitId,
      familyAccountId: input.familyAccountId,
      authorName: authorSnapshot,
      body: input.body,
      parentId: input.parentId ?? null,
    },
    include: {
      familyAccount: { select: { displayName: true } },
    },
  });

  return serializeComment(created, input.familyAccountId);
}
