import "server-only";
import { getReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { resolveFamilyPlus } from "@/lib/subscription/entitlements";
import { sidebarPaidPlusForReader } from "@/lib/sidebar-entitlement";

/** Request-scoped server decision. Never trust client plan flags or cache across users. */
export async function getSidebarPaidPlus(): Promise<boolean> {
  try {
    return await sidebarPaidPlusForReader(await getReaderKey(), {
      resolveFamily: resolveFamilyPlus,
      childFamilyIds: async (id) => {
        // The same owning/co-parent relationships as the existing childHasFamilyPass gate.
        const [child, links] = await Promise.all([
          prisma.subProfile.findUnique({ where: { id }, select: { familyAccountId: true, active: true } }),
          prisma.parentChildLink.findMany({ where: { subProfileId: id }, select: { parentAccountId: true } }),
        ]);
        return child?.active ? [child.familyAccountId, ...links.map((link) => link.parentAccountId)] : [];
      },
    });
  } catch { return false; }
}