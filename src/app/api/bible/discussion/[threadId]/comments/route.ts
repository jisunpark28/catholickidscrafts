import {
  getDiscussionAuthorToken,
  hashDiscussionAuthorToken,
  newDiscussionAuthorToken,
  setDiscussionAuthorCookie,
} from "@/lib/bible/discussion-author";
import {
  createChapterComment,
  getChapterThread,
  normalizeDiscussionBody,
} from "@/lib/bible/discussion";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { threadId } = await context.params;

  const thread = await getChapterThread(threadId);
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

  let authorToken = await getDiscussionAuthorToken();
  let setCookie = false;
  if (!authorToken) {
    authorToken = newDiscussionAuthorToken();
    setCookie = true;
  }

  try {
    const comment = await createChapterComment(
      threadId,
      text,
      hashDiscussionAuthorToken(authorToken),
    );

    const res = NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
      },
    });

    if (setCookie) {
      setDiscussionAuthorCookie(res, authorToken);
    }

    return res;
  } catch (e) {
    console.error("discussion create comment", e);
    return NextResponse.json({ error: "Could not reply" }, { status: 500 });
  }
}
