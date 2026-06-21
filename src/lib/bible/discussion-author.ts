import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";

/** Anonymous author identity for Bible chapter discussion (per browser). */
export const DISCUSSION_AUTHOR_COOKIE = "ckc_discussion_author";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function hashDiscussionAuthorToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function discussionAuthorCookieOptions(token: string) {
  return {
    name: DISCUSSION_AUTHOR_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };
}

export async function getDiscussionAuthorToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DISCUSSION_AUTHOR_COOKIE)?.value?.trim() ?? null;
}

export function newDiscussionAuthorToken(): string {
  return randomUUID();
}

export function isDiscussionAuthor(
  authorTokenHash: string,
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  return hashDiscussionAuthorToken(token) === authorTokenHash;
}

export function setDiscussionAuthorCookie(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  token: string,
) {
  const opts = discussionAuthorCookieOptions(token);
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
}
