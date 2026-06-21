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
