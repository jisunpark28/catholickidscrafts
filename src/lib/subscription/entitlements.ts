import { auth } from "@/auth";
import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";

/**
 * Paid-feature gate. There is no payment system yet, so this is false for everyone
 * except signed-in site admins and family accounts listed in PAID_PREVIEW_EMAILS
 * (comma-separated). Sub profiles inherit from their parent family account's email.
 * Server-only: always re-check in API routes.
 */
export function paidPreviewEmails(): Set<string> {
  const raw = process.env.PAID_PREVIEW_EMAILS ?? "";
  return new Set(
    raw
      .split(/[,\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@")),
  );
}

async function isAdminSignedIn(): Promise<boolean> {
  try {
    const session = await auth();
    return Boolean(session?.user?.email);
  } catch {
    return false;
  }
}

async function familyEmailForReader(key: ReaderKey): Promise<string | null> {
  if (key.type === "owner") {
    const row = await prisma.familyAccount.findUnique({
      where: { id: key.familyAccountId },
      select: { email: true },
    });
    return row?.email?.toLowerCase() ?? null;
  }
  if (key.type === "sub") {
    const row = await prisma.subProfile.findUnique({
      where: { id: key.subProfileId },
      select: { familyAccount: { select: { email: true } } },
    });
    return row?.familyAccount.email?.toLowerCase() ?? null;
  }
  return null;
}

export async function hasPaidFeatures(key: ReaderKey | null): Promise<boolean> {
  if (await isAdminSignedIn()) return true;
  if (!key || key.type === "guest") return false;
  const allow = paidPreviewEmails();
  if (allow.size === 0) return false;
  const email = await familyEmailForReader(key);
  return Boolean(email && allow.has(email));
}
