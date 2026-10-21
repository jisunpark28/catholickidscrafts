import { getLiturgicalSeason } from "@/lib/liturgical-season";

/** Liturgy page for the season the Church is in on `date` (falls back to Ordinary Time). */
export function currentSeasonHref(date: Date = new Date()): string {
  const name = getLiturgicalSeason(date).name;
  if (name === "Advent") return "/liturgy/advent";
  if (name === "Christmas Season") return "/liturgy/christmas-time";
  if (name === "Lent") return "/liturgy/lent";
  if (name === "Holy Week") return "/liturgy/paschal-triduum";
  if (name === "Easter" || name === "Easter Season") return "/liturgy/easter-time";
  return "/liturgy/ordinary-time";
}
