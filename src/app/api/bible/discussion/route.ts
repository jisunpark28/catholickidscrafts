import {
  getDiscussionAuthorToken,
  hashDiscussionAuthorToken,
  newDiscussionAuthorToken,
  setDiscussionAuthorCookie,
} from "@/lib/bible/discussion-author";
import {
  createChapterThread,
  listChapterDiscussion,
  normalizeDiscussionBody,
} from "@/lib/bible/discussion";
import {
  canManageDiscussionPost,
  isDiscussionModerator,
} from "@/lib/bible/discussion-permissions";
import { NextResponse } from "next/server";

function parseChapter(value: string | null): number | null {
  if (!value) return null;
  const chapter = Number(value);
  if (!Number.isFinite(chapter) || chapter < 1) return null;
  return chapter;
}

function serializeThread(
  thread: Awaited<ReturnType<typeof listChapterDiscussion>>[number],
  authorToken: string | null,
  canModerate: boolean,
) {
  const threadPerms = canManageDiscussionPost(thread.authorTokenHash, authorToken, canModerate);
  return {
    id: thread.id,
    body: thread.body,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    canEdit: threadPerms.canEdit,
    canDelete: threadPerms.canDelete,
    comments: thread.comments.map((comment) => {
      const commentPerms = canManageDiscussionPost(
        comment.authorTokenHash,
        authorToken,
        canModerate,
      );
      return {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        canEdit: commentPerms.canEdit,
        canDelete: commentPerms.canDelete,
      };
    }),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug")?.trim();
  const chapter = parseChapter(searchParams.get("chapter"));

  if (!bookSlug || chapter === null) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }

  const authorToken = await getDiscussionAuthorToken();
  const canModerate = await isDiscussionModerator();

  try {
    const threads = await listChapterDiscussion(bookSlug, chapter);
    return NextResponse.json({
      canModerate,
      threads: threads.map((thread) => serializeThread(thread, authorToken, canModerate)),
    });
  } catch (e) {
    console.error("discussion list", e);
    return NextResponse.json({ error: "Could not load discussion" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { bookSlug?: string; chapter?: number; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookSlug = body.bookSlug?.trim();
  const chapter = body.chapter;
  const text = normalizeDiscussionBody(body.body);

  if (!bookSlug || !Number.isFinite(chapter) || chapter! < 1) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }
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
    const thread = await createChapterThread(
      bookSlug,
      chapter!,
      text,
      hashDiscussionAuthorToken(authorToken),
    );

    const res = NextResponse.json({
      thread: {
        id: thread.id,
        body: thread.body,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
        canEdit: true,
        canDelete: true,
        comments: [],
      },
    });

    if (setCookie) {
      setDiscussionAuthorCookie(res, authorToken);
    }

    return res;
  } catch (e) {
    console.error("discussion create thread", e);
    return NextResponse.json({ error: "Could not post" }, { status: 500 });
  }
}
