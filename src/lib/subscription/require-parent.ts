import { getReaderKey } from "@/lib/bible/reader";
import { effectiveReaderMode, requireFamilySession } from "@/lib/family-auth";

/**
 * Billing actions are parent-only: a valid family (Google) session, and the active
 * reader on this device must not be a child profile.
 */
export async function requireBillingParent() {
  const session = await requireFamilySession();
  if (!session) return { error: Response.json({ error: "Sign in with Google first" }, { status: 401 }) } as const;
  const [reader, mode] = await Promise.all([getReaderKey(), effectiveReaderMode(session)]);
  if (reader?.type === "sub" || mode.type !== "owner") {
    return { error: Response.json({ error: "Ask a parent to manage the plan" }, { status: 403 }) } as const;
  }
  return { session } as const;
}
