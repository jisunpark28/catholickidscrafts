import type { LiturgicalSeasonInfo, MassDaySummary } from "@/types/mass";

export type VestmentColorId = "green" | "violet" | "white" | "red" | "rose";

export type VestmentColorInfo = {
  id: VestmentColorId;
  label: string;
  hex: string;
  /** Short note, e.g. an optional memorial that changes the color. */
  note?: string;
};

const COLORS: Record<VestmentColorId, { label: string; hex: string }> = {
  green: { label: "Green", hex: "#15803d" },
  violet: { label: "Violet", hex: "#6d28d9" },
  white: { label: "White", hex: "#f5f5f4" },
  red: { label: "Red", hex: "#b91c1c" },
  rose: { label: "Rose", hex: "#db7093" },
};

const RED_TITLE = /palm sunday|passion|good friday|pentecost|martyr|apostle|evangelist|exaltation of the holy cross|holy innocents/i;
const ROSE_TITLE = /third sunday of advent|fourth sunday of lent|gaudete|laetare/i;

function info(id: VestmentColorId, note?: string): VestmentColorInfo {
  return { id, ...COLORS[id], ...(note ? { note } : {}) };
}

/**
 * Vestment color derived from the season and the day's rank/title.
 * No feed provides the color, so this is a best-effort rule of thumb
 * (General Instruction of the Roman Missal, 346); parishes may differ.
 */
export function deriveVestmentColor(
  day: Pick<MassDaySummary, "liturgicalTitle" | "rank" | "saint" | "feast">,
  season: LiturgicalSeasonInfo,
): VestmentColorInfo {
  const title = `${day.liturgicalTitle} ${day.feast ?? ""}`;
  const seasonColor: VestmentColorId = season.color === "purple" ? "violet" : season.color;

  if (ROSE_TITLE.test(title)) return info("rose", `${COLORS.violet.label} may also be used`);
  if (day.rank === "solemnity" || day.rank === "feast") {
    return info(RED_TITLE.test(title) ? "red" : "white");
  }
  if (day.rank === "memorial") {
    return info(RED_TITLE.test(title) ? "red" : "white");
  }
  if (/palm sunday|good friday/i.test(title)) return info("red");

  if (day.saint && day.rank === "ferial") {
    const memorialColor = RED_TITLE.test(day.saint) ? "red" : "white";
    return info(seasonColor, `${COLORS[memorialColor].label} if the memorial is kept`);
  }
  return info(seasonColor);
}
