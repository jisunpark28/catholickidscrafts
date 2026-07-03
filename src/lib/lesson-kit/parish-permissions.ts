import { getParishMembership } from "@/lib/lesson-kit/db";
import type { ParishRole } from "@prisma/client";

export async function requireParishMember(familyAccountId: string) {
  return getParishMembership(familyAccountId);
}

export async function requireDre(familyAccountId: string) {
  const membership = await getParishMembership(familyAccountId);
  if (!membership || membership.role !== "DRE") return null;
  return membership;
}

export function isDreRole(role: ParishRole) {
  return role === "DRE";
}
