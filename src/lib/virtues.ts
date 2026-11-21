import { COURAGE, type VirtueBundle } from "@/data/virtues/courage";

/** Live catechism virtue bundles. Other virtues stay off the index until they are written. */
export const VIRTUE_BUNDLES: readonly VirtueBundle[] = [COURAGE];

export function getVirtue(slug: string): VirtueBundle | null {
  return VIRTUE_BUNDLES.find((virtue) => virtue.slug === slug) ?? null;
}
