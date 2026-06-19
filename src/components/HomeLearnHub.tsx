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
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:max-w-xl sm:py-12">
      <DailyMassPanel
        label={dailyMassLabel}
        calendar={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
      />

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-4 text-2xl text-[var(--color-ink)] sm:text-3xl">{section.title}</h2>
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

      {sections.length === 0 && (
        <p className="text-center text-sm text-[var(--color-muted)]">
          Home sections are not configured yet. Operators can add them in Admin → Home sections.
        </p>
      )}
    </div>
  );
}
