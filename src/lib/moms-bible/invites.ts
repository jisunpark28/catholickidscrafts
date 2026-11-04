/** Co-parent invites: random token in the link, only its SHA-256 stored. Server only. */
import { createHash, randomBytes } from "node:crypto";

export function newInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Shape check before hashing (43 base64url chars). */
export function isInviteTokenShape(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
