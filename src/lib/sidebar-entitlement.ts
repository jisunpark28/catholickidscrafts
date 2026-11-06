import type { ReaderKey } from "@/lib/bible/reader";
import { isPaidSidebarGrant } from "./sidebar-navigation";
type Plan = Parameters<typeof isPaidSidebarGrant>[0];
export type SidebarAccessDependencies = {
  resolveFamily: (id: string) => Promise<Plan>;
  childFamilyIds: (id: string) => Promise<readonly string[]>;
};
/** Pure orchestration of verified reader identity + authoritative server billing grants. */
export async function sidebarPaidPlusForReader(key: ReaderKey | null, dependencies: SidebarAccessDependencies): Promise<boolean> {
  try {
    if (!key || key.type === "guest") return false;
    const ids = key.type === "owner" ? [key.familyAccountId] : await dependencies.childFamilyIds(key.subProfileId);
    for (const id of new Set(ids)) if (isPaidSidebarGrant(await dependencies.resolveFamily(id))) return true;
    return false;
  } catch { return false; }
}