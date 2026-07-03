import { markAssignmentCompleteForReader } from "@/lib/lesson-kit/assignments";
import { getReaderKey } from "@/lib/bible/reader";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ shareSlug: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { shareSlug } = await params;
  const reader = await getReaderKey();
  await markAssignmentCompleteForReader(shareSlug, reader);
  return NextResponse.json({ ok: true });
}
