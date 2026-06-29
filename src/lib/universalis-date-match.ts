import { parseDateParam } from "@/lib/dates";

/** Site “today” may be up to one civil day ahead of Universalis during GMT/BST rollover. */
export function isAcceptableUniversalisDate(
  universalisDateKey: string,
  siteTodayKey: string,
): boolean {
  if (universalisDateKey === siteTodayKey) return true;
  const site = parseDateParam(siteTodayKey);
  const uni = parseDateParam(universalisDateKey);
  if (!site || !uni) return false;
  const diffDays = (site.getTime() - uni.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}
