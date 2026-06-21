import { requireAdminSession } from "@/lib/admin-auth";
import {
  deleteChapterThread,
  getChapterThread,
  normalizeDiscussionBody,
  updateChapterThread,
} from "@/lib/bible/discussion";
import { isDiscussionAuthor } from "@/lib/bible/discussion-permissions";
import { getSignedInDiscussionReader } from "@/lib/bible/discussion-reader";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ threadId: string }> };

async function authorizeThreadWrite(threadId: string) {
  const thread = await getChapterThread(threadId);
  if (!thread) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  const readerKey = await getSignedInDiscussionReader();
  const { error } = await requireAdminSession();
  const canModerate = !error;
  const isAuthor = isDiscussionAuthor(thread, readerKey);

  if (!isAuthor && !canModerate) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { thread };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { threadId } = await context.params;
  const auth = await authorizeThreadWrite(threadId);
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
    const updated = await updateChapterThread(threadId, text);
    return NextResponse.json({
      thread: {
        id: updated.id,
        body: updated.body,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("discussion update thread", e);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { threadId } = await context.params;
  const auth = await authorizeThreadWrite(threadId);
  if (auth.error) return auth.error;

  try {
    await deleteChapterThread(threadId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("discussion delete thread", e);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
