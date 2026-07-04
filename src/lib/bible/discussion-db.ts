import { Prisma } from "@prisma/client";
import { ensureDiscussionSchema } from "@/lib/bible/discussion-schema";

/** Prisma / Postgres errors that mean discussion tables or columns are not ready yet. */
export function isDiscussionSchemaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") return true;
  }

  if (error instanceof Error) {
    const message = error.message;
    if (
      message.includes("BibleChapterThread") ||
      message.includes("BibleChapterComment") ||
      message.includes("discussionPenName")
    ) {
      return true;
    }
    if (message.includes("does not exist") && message.includes("column")) {
      return true;
    }
  }

  return false;
}

/** Run a DB operation; bootstrap discussion schema once and retry when tables/columns are missing. */
export async function withDiscussionSchemaReady<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isDiscussionSchemaError(error)) throw error;
    await ensureDiscussionSchema();
    return await fn();
  }
}
