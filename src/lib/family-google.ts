import { getPrismaClient } from "@/lib/prisma";
import type { GoogleUserProfile } from "@/lib/google-oauth";

/**
 * Parent accounts are Google-only. A verified Google email may claim an
 * existing (legacy email+password) FamilyAccount with the same email.
 */
export async function findOrCreateFamilyFromGoogle(profile: GoogleUserProfile) {
  if (!profile.emailVerified) {
    throw new Error("GOOGLE_EMAIL_UNVERIFIED");
  }
  const prisma = getPrismaClient();
  const byGoogle = await prisma.familyAccount.findUnique({
    where: { googleId: profile.googleId },
  });
  if (byGoogle) return byGoogle;

  const byEmail = await prisma.familyAccount.findUnique({
    where: { email: profile.email },
  });

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== profile.googleId) {
      throw new Error("EMAIL_LINKED_OTHER_GOOGLE");
    }
    // First Google link of a legacy password account. Bump sessionVersion so
    // any session created by whoever registered that email with a password
    // (which was never verified) is revoked; the Google owner takes over.
    return prisma.familyAccount.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.googleId,
        displayName: byEmail.displayName ?? profile.name,
        sessionVersion: { increment: 1 },
      },
    });
  }

  return prisma.familyAccount.create({
    data: {
      email: profile.email,
      googleId: profile.googleId,
      displayName: profile.name,
    },
  });
}
