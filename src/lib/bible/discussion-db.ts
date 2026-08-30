import {
  ensureDiscussionSchema,
  isDiscussionSchemaError,
  resetDiscussionSchemaCache,
} from "@/lib/bible/discussion-schema";

export { isDiscussionSchemaError };

/** Run a DB operation; bootstrap discussion schema once and retry when tables/columns are missing. */
export async function withDiscussionSchemaReady<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isDiscussionSchemaError(error)) throw error;
    await ensureDiscussionSchema();
    try {
      return await fn();
    } catch (retryError) {
      if (!isDiscussionSchemaError(retryError)) throw retryError;
      resetDiscussionSchemaCache();
      await ensureDiscussionSchema();
      return await fn();
    }
  }
}
