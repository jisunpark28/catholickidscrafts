import {
  createLessonKitComment,
  getCommunityCommentKit,
  kitAllowsPublicComments,
  listLessonKitComments,
  normalizeLessonKitCommentAuthorName,
  normalizeLessonKitCommentBody,
} from "@/lib/lesson-kit/comments";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const kit = await getCommunityCommentKit(id);
  if (!kitAllowsPublicComments(kit)) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const session = await requireFamilySession();
  const comments = await listLessonKitComments(id, session?.familyAccountId ?? null);

  return NextResponse.json({
    comments,
    signedIn: Boolean(session),
  });
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const kit = await getCommunityCommentKit(id);
  if (!kitAllowsPublicComments(kit)) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    body?: unknown;
    parentId?: unknown;
    authorName?: unknown;
  };

  const text = normalizeLessonKitCommentBody(body.body);
  if (!text) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  const parentId = typeof body.parentId === "string" && body.parentId.trim() ? body.parentId.trim() : null;
  const authorName = normalizeLessonKitCommentAuthorName(body.authorName);

  const comment = await createLessonKitComment({
    kitId: id,
    familyAccountId: session.familyAccountId,
    body: text,
    parentId,
    authorName,
    fallbackAuthorName: session.displayName,
  });

  if (!comment) {
    return NextResponse.json({ error: "Parent comment not found" }, { status: 400 });
  }

  return NextResponse.json({ comment });
}
