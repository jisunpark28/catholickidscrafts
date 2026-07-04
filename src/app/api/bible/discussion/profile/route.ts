import {
  getDiscussionPenNameForReader,
  normalizeDiscussionPenName,
  saveDiscussionPenName,
} from "@/lib/bible/discussion-pen-name";
import { withDiscussionSchemaReady } from "@/lib/bible/discussion-db";
import { getSignedInDiscussionReader } from "@/lib/bible/discussion-reader";
import { NextResponse } from "next/server";

export async function GET() {
  const readerKey = await getSignedInDiscussionReader();
  if (!readerKey) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { penName, needsPenName } = await withDiscussionSchemaReady(() =>
    getDiscussionPenNameForReader(readerKey),
  );
  return NextResponse.json({
    penName,
    needsPenName,
    readerType: readerKey.type,
  });
}

export async function PUT(request: Request) {
  const readerKey = await getSignedInDiscussionReader();
  if (!readerKey) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { penName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const penName = normalizeDiscussionPenName(body.penName);
  if (!penName) {
    return NextResponse.json(
      { error: "penName is required (max 40 characters)" },
      { status: 400 },
    );
  }

  try {
    await withDiscussionSchemaReady(() => saveDiscussionPenName(readerKey, penName));
    return NextResponse.json({ penName, needsPenName: false });
  } catch (e) {
    console.error("discussion pen name save", e);
    return NextResponse.json({ error: "Could not save pen name" }, { status: 500 });
  }
}
