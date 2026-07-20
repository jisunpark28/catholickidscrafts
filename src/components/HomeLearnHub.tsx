import { DailyMassPanel } from "@/components/DailyMassPanel";
import { HubPillWidth } from "@/components/HubPillWidth";
import { HomeNavPill } from "@/components/HomeNavPill";
import { ReaderThisWeekCard } from "@/components/lesson/ReaderThisWeekCard";
import type { HomeSectionWithItems } from "@/lib/home-sections";
import type { MonthCalendar } from "@/types/mass";
import "@/styles/lesson-kit.css";

type Props = {
  dailyMassLabel: string;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
  sections: HomeSectionWithItems[];
};

export function HomeLearnHub({
  dailyMassLabel,
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
  sections,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[144rem] px-4 py-8 sm:px-8 sm:py-10">
      <DailyMassPanel
        label={dailyMassLabel}
        calendar={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
        todayTitle={todayTitle}
        calendarCelebration={calendarCelebration}
      />

      <HubPillWidth>
        <ReaderThisWeekCard />
      </HubPillWidth>

      <div className="relative z-30 space-y-10">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`home-section-${section.id}`}>
            <HubPillWidth>
              <h2
                id={`home-section-${section.id}`}
                className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]"
              >
                {section.title}
              </h2>
            </HubPillWidth>
            <div className="flex flex-col gap-3">
              {section.items.map((item) => (
                <HomeNavPill key={item.id} href={item.href}>
                  {item.title}
                </HomeNavPill>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
