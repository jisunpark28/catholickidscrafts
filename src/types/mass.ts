export type ReadingKind = "first_reading" | "psalm" | "second_reading" | "gospel";

export type MassReading = {
  kind: ReadingKind;
  label: string;
  title: string;
  text: string;
};

export type MassDaySummary = {
  date: string;
  liturgicalTitle: string;
  rank: "solemnity" | "feast" | "memorial" | "sunday" | "ferial";
};

export type MassDay = MassDaySummary & {
  saint?: string;
  feast?: string;
  readings: MassReading[];
  source: string;
};

export type LiturgicalSeasonInfo = {
  name: string;
  color: "green" | "purple" | "white" | "red" | "rose";
  description: string;
  periodLabel: string;
};

export type MonthCalendar = {
  year: number;
  month: number;
  season: LiturgicalSeasonInfo;
  days: MassDaySummary[];
  source: string;
};
