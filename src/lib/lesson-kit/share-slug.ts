import { randomBytes } from "crypto";

/** URL-safe slug for /lesson/[shareSlug] (unguessable). */
export function generateLessonShareSlug(): string {
  return randomBytes(12).toString("base64url");
}
