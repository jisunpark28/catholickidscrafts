import { requireAdminSession } from "@/lib/admin-auth";
import {
  getDiscussionAuthorToken,
  hashDiscussionAuthorToken,
  isDiscussionAuthor,
} from "@/lib/bible/discussion-author";

export async function isDiscussionModerator(): Promise<boolean> {
  const { error } = await requireAdminSession();
  return !error;
}

export async function getDiscussionActor() {
  const authorToken = await getDiscussionAuthorToken();
  const canModerate = await isDiscussionModerator();
  return { authorToken, canModerate };
}

export function canManageDiscussionPost(
  authorTokenHash: string,
  authorToken: string | null,
  canModerate: boolean,
): { canEdit: boolean; canDelete: boolean } {
  const isAuthor = isDiscussionAuthor(authorTokenHash, authorToken);
  const allowed = isAuthor || canModerate;
  return { canEdit: allowed, canDelete: allowed };
}

export function authorHashForToken(token: string): string {
  return hashDiscussionAuthorToken(token);
}
