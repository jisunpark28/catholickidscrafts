import { getReaderKey, isSignedInReaderKey, type ReaderKey } from "@/lib/bible/reader";

export type SignedInReaderKey = Exclude<ReaderKey, { type: "guest" }>;

export async function getSignedInDiscussionReader(): Promise<SignedInReaderKey | null> {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return null;
  return key;
}

export function readerAuthorIds(readerKey: SignedInReaderKey): {
  familyAccountId: string | null;
  subProfileId: string | null;
} {
  if (readerKey.type === "owner") {
    return { familyAccountId: readerKey.familyAccountId, subProfileId: null };
  }
  return { familyAccountId: null, subProfileId: readerKey.subProfileId };
}

/** Child (Access ID) readers may read the public discussion but never post, reply, edit, or set a pen name. */
export function isChildReader(readerKey: SignedInReaderKey | null): boolean {
  return readerKey?.type === "sub";
}

export const CHILD_POSTING_BLOCKED_MESSAGE =
  "Chapter discussion is for parents. Children can read comments but cannot post.";
