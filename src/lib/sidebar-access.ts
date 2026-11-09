import "server-only";
import { getReaderKey, type ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { resolveFamilyPlus } from "@/lib/subscription/entitlements";
import { sidebarPaidPlusForReader } from "@/lib/sidebar-entitlement";

/**
 * Request-scoped server decision. Never trust client plan flags or cache across users.
 * Pass `knownReaderKey` when the caller already resolved it (saves repeat DB reads).
 */
export async function getSidebarPaidPlus(knownReaderKey?: ReaderKey | null): Promise<boolean> {
  try {
    const key = knownReaderKey === undefined ? await getReaderKey() : knownReaderKey;
    return await sidebarPaidPlusForReader(key, {
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