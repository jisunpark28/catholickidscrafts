import { DailyMassPanel } from "@/components/DailyMassPanel";
import { HomeNavPill } from "@/components/HomeNavPill";
import type { HomeSectionWithItems } from "@/lib/home-sections";
import type { MonthCalendar } from "@/types/mass";

type Props = {
  dailyMassLabel: string;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  sections: HomeSectionWithItems[];
};

export function HomeLearnHub({
  dailyMassLabel,
  calendar,
  selectedDate,
  todayDate,
  sections,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
      <DailyMassPanel
        label={dailyMassLabel}
        calendar={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
      />

      <div className="mx-auto max-w-xl space-y-10 pt-2">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`home-section-${section.id}`}>
            <h2
              id={`home-section-${section.id}`}
              className="mb-4 text-2xl text-[var(--color-ink)] sm:text-3xl"
            >
              {section.title}
            </h2>
            <div className="space-y-4">
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
