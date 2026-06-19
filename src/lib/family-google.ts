import { prisma } from "@/lib/prisma";
import type { GoogleUserProfile } from "@/lib/google-oauth";

export async function findOrCreateFamilyFromGoogle(profile: GoogleUserProfile) {
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
    return prisma.familyAccount.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.googleId,
        displayName: byEmail.displayName ?? profile.name,
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
