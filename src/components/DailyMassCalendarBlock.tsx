import { LiturgicalSeasonBanner } from "@/components/LiturgicalSeasonBanner";
import { MassCalendar } from "@/components/MassCalendar";
import type { MonthCalendar } from "@/types/mass";

type Props = {
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
};

/** Liturgical season banner + month calendar (shared by /mass and home Daily Mass panel). */
export function DailyMassCalendarBlock({
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
}: Props) {
  return (
    <div className="space-y-8">
      <LiturgicalSeasonBanner
        season={calendar.season}
        todayTitle={todayTitle}
        calendarCelebration={calendarCelebration}
      />
      <MassCalendar
        initial={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
      />
    </div>
  );
}
