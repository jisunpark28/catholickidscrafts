import { neonDatabaseHostLabel } from "@/lib/neon-database-host";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lightweight DB probe — compare `databaseHost` with Neon Console → Primary branch. */
export async function GET() {
  const databaseHost = neonDatabaseHostLabel(process.env.DATABASE_URL);
  const directHost = neonDatabaseHostLabel(
    process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  );

  try {
    const [threadCount, commentCount] = await Promise.all([
      prisma.bibleChapterThread.count(),
      prisma.bibleChapterComment.count(),
    ]);

    return NextResponse.json({
      ok: true,
      databaseHost,
      directHost,
      threadCount,
      commentCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        databaseHost,
        directHost,
        error: message,
      },
      { status: 500 },
    );
  }
}
