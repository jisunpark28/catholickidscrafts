import type { ResourceSeason } from "@/lib/resource/sheets";

/** Client-safe Sunday calendar row (serialized from the server). */
export type SundayCalendarEntry = {
  date: string;
  key: string;
  liturgicalName: string;
  season: ResourceSeason;
  seasonLabel: string;
  color: string;
};

/** Named season jumps for the Printables Sundays middle finder (client-safe). */
export const SUNDAY_SEASON_JUMPS: readonly {
  id: string;
  label: string;
  season?: ResourceSeason;
  keySuffix?: string;
}[] = [
  { id: "advent", label: "Advent", season: "advent" },
  { id: "christmas", label: "Christmas", season: "christmas" },
  { id: "lent", label: "Lent", season: "lent" },
  { id: "easter", label: "Easter", season: "easter" },
  { id: "ordinary-time", label: "Ordinary Time", season: "ordinary-time" },
  { id: "christ-the-king", label: "Christ the King", keySuffix: "OT34" },
  { id: "feasts", label: "Feasts", season: "feasts" },
];
