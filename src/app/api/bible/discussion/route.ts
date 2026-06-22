import {
  createChapterThread,
  listChapterDiscussion,
  normalizeDiscussionBody,
} from "@/lib/bible/discussion";
import { ensureDiscussionSchema } from "@/lib/bible/discussion-schema";
import { getAuthorLabelForPost, getDiscussionPenNameForReader } from "@/lib/bible/discussion-pen-name";
import {
  canManageDiscussionPost,
  isDiscussionModerator,
  publicAuthorDisplay,
} from "@/lib/bible/discussion-permissions";
import {
  getSignedInDiscussionReader,
  type SignedInReaderKey,
} from "@/lib/bible/discussion-reader";
import { ensureOwnerReaderCookie } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseChapter(value: string | null): number | null {
  if (!value) return null;
  const chapter = Number(value);
  if (!Number.isFinite(chapter) || chapter < 1) return null;
  return chapter;
}

function serializeThread(
  thread: Awaited<ReturnType<typeof listChapterDiscussion>>[number],
  readerKey: SignedInReaderKey | null,
  canModerate: boolean,
) {
  const threadPerms = canManageDiscussionPost(thread, readerKey, canModerate);
  return {
    id: thread.id,
    body: thread.body,
    authorDisplay: publicAuthorDisplay(thread.isAnonymous, thread.authorLabel),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    canEdit: threadPerms.canEdit,
    canDelete: threadPerms.canDelete,
    comments: thread.comments.map((comment) => {
      const commentPerms = canManageDiscussionPost(comment, readerKey, canModerate);
      return {
        id: comment.id,
        body: comment.body,
        authorDisplay: publicAuthorDisplay(comment.isAnonymous, comment.authorLabel),
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        canEdit: commentPerms.canEdit,
        canDelete: commentPerms.canDelete,
      };
    }),
  };
}

async function buildViewer(readerKey: SignedInReaderKey | null, canModerate: boolean) {
  if (!readerKey) {
    return {
      canWrite: false,
      penName: null as string | null,
      needsPenName: false,
      canModerate,
      readerType: null as "owner" | "sub" | null,
    };
  }

  const { penName } = await getDiscussionPenNameForReader(readerKey);
  return {
    canWrite: true,
    penName: penName ?? (readerKey.type === "owner" ? "Parent" : "Reader"),
    needsPenName: false,
    canModerate,
    readerType: readerKey.type,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug")?.trim();
  const chapter = parseChapter(searchParams.get("chapter"));

  if (!bookSlug || chapter === null) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }

  try {
    await ensureDiscussionSchema();

    const readerKey = await getSignedInDiscussionReader();
    const canModerate = await isDiscussionModerator();
    const viewer = await buildViewer(readerKey, canModerate);
    const threads = await listChapterDiscussion(bookSlug, chapter);
    return NextResponse.json({
      viewer,
      threads: threads.map((thread) => serializeThread(thread, readerKey, canModerate)),
    });
  } catch (e) {
    console.error("discussion list", e);
    return NextResponse.json(
      {
        viewer: {
          canWrite: false,
          penName: null,
          needsPenName: false,
          canModerate: false,
          readerType: null,
        },
        threads: [],
        error: "Could not load discussion",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const readerKey = await getSignedInDiscussionReader();
    if (!readerKey) {
      return NextResponse.json(
        { error: "Sign in with a family account or Access ID to post." },
        { status: 401 },
      );
    }

    let body: { bookSlug?: string; chapter?: number | string; body?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const bookSlug = body.bookSlug?.trim();
    const chapter = parseChapter(
      body.chapter === undefined || body.chapter === null
        ? null
        : String(body.chapter),
    );
    const text = normalizeDiscussionBody(body.body);

    if (!bookSlug || chapter === null) {
      return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "body is required (max 2000 characters)" }, { status: 400 });
    }

    await ensureDiscussionSchema();
    const authorLabel = await getAuthorLabelForPost(readerKey);
    const thread = await createChapterThread(bookSlug, chapter, {
      body: text,
      isAnonymous: false,
      authorLabel,
      readerKey,
    });

    const res = NextResponse.json({
      thread: {
        id: thread.id,
        body: thread.body,
        authorDisplay: publicAuthorDisplay(thread.isAnonymous, thread.authorLabel),
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
        comments: [],
      },
    });
    if (readerKey.type === "owner") {
      await ensureOwnerReaderCookie(res, readerKey.familyAccountId);
    }
    return res;
  } catch (e) {
    console.error("discussion create thread", e);
    return NextResponse.json({ error: "Could not post" }, { status: 500 });
  }
}
