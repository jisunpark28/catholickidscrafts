import { requireAdminSession } from "@/lib/admin-auth";
import type { SignedInReaderKey } from "@/lib/bible/discussion-reader";

type DiscussionAuthorFields = {
  familyAccountId: string | null;
  subProfileId: string | null;
};

export async function isDiscussionModerator(): Promise<boolean> {
  const { error } = await requireAdminSession();
  return !error;
}

export function isDiscussionAuthor(
  post: DiscussionAuthorFields,
  readerKey: SignedInReaderKey | null,
): boolean {
  if (!readerKey) return false;
  if (readerKey.type === "owner") {
    return (
      post.familyAccountId === readerKey.familyAccountId && post.subProfileId === null
    );
  }
  return post.subProfileId === readerKey.subProfileId;
}

export function canManageDiscussionPost(
  post: DiscussionAuthorFields,
  readerKey: SignedInReaderKey | null,
  canModerate: boolean,
): { canEdit: boolean; canDelete: boolean } {
  const isAuthor = isDiscussionAuthor(post, readerKey);
  const allowed = isAuthor || canModerate;
  return { canEdit: allowed, canDelete: allowed };
}

/** Public API/UI label for discussion posts — names are stored server-side only. */
export function publicAuthorDisplay(isAnonymous: boolean, authorLabel: string): string {
  void isAnonymous;
  void authorLabel;
  return "";
}
