import { requireAdminSession } from "@/lib/admin-auth";
import { getDiscussionAuthorToken, isDiscussionAuthor } from "@/lib/bible/discussion-author";
import {
  deleteChapterComment,
  getChapterComment,
  normalizeDiscussionBody,
  updateChapterComment,
} from "@/lib/bible/discussion";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ commentId: string }> };

async function authorizeCommentWrite(commentId: string) {
  const comment = await getChapterComment(commentId);
  if (!comment) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  const authorToken = await getDiscussionAuthorToken();
  const { error } = await requireAdminSession();
  const canModerate = !error;
  const isAuthor = isDiscussionAuthor(comment.authorTokenHash, authorToken);

  if (!isAuthor && !canModerate) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { comment };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { commentId } = await context.params;
  const auth = await authorizeCommentWrite(commentId);
  if (auth.error) return auth.error;

  let body: { body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = normalizeDiscussionBody(body.body);
  if (!text) {
    return NextResponse.json({ error: "body is required (max 2000 characters)" }, { status: 400 });
  }

  try {
    const updated = await updateChapterComment(commentId, text);
    return NextResponse.json({
      comment: {
        id: updated.id,
        body: updated.body,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("discussion update comment", e);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { commentId } = await context.params;
  const auth = await authorizeCommentWrite(commentId);
  if (auth.error) return auth.error;

  try {
    await deleteChapterComment(commentId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("discussion delete comment", e);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
