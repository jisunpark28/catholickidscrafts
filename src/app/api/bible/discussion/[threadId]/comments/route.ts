import {
  createChapterComment,
  getChapterThread,
  normalizeDiscussionBody,
} from "@/lib/bible/discussion";
import { withDiscussionSchemaReady } from "@/lib/bible/discussion-db";
import { getAuthorLabelForPost } from "@/lib/bible/discussion-pen-name";
import { publicAuthorDisplay } from "@/lib/bible/discussion-permissions";
import { getSignedInDiscussionReader } from "@/lib/bible/discussion-reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { threadId } = await context.params;

    const readerKey = await getSignedInDiscussionReader();
    if (!readerKey) {
      return NextResponse.json(
        { error: "Sign in with a family account or Access ID to reply." },
        { status: 401 },
      );
    }

    const thread = await withDiscussionSchemaReady(() => getChapterThread(threadId));
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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

    const authorLabel = await withDiscussionSchemaReady(() =>
      getAuthorLabelForPost(readerKey),
    );
    const comment = await withDiscussionSchemaReady(() =>
      createChapterComment(threadId, {
        body: text,
        isAnonymous: false,
        authorLabel,
        readerKey,
      }),
    );

    const res = NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        authorDisplay: publicAuthorDisplay(comment.isAnonymous, comment.authorLabel),
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
      },
    });
    if (readerKey.type === "owner") {
      await ensureOwnerReaderCookie(res, readerKey.familyAccountId);
    }
    return res;
  } catch (e) {
    console.error("discussion create comment", e);
    return NextResponse.json({ error: "Could not reply" }, { status: 500 });
  }
}
