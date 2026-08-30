declare module "romcal" {
  export type RomcalCelebration = {
    moment: string;
    type: string;
    name: string;
    key?: string;
    source?: string;
    data?: unknown;
  };

  export function calendarFor(options: {
    year: number;
    locale?: string;
  }): RomcalCelebration[];
}
