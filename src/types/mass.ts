export type ReadingKind = "first_reading" | "psalm" | "second_reading" | "gospel";

export type MassReading = {
  kind: ReadingKind;
  label: string;
  title: string;
  /** Full text when USCCB RSS (or licensed republish) provides it. */
  text?: string;
  /** Official USCCB daily readings page for this date. */
  externalUrl?: string;
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
  usccbPageUrl?: string;
  /** True when full reading text is shown on this site. */
  readingsOnSite?: boolean;
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
