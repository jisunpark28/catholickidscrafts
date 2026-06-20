import { DailyMassPanel } from "@/components/DailyMassPanel";
import { HOME_HUB_DAILY_MASS_WIDTH_CLASS } from "@/components/HomeHubButton";
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
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-10">
      <DailyMassPanel
        label={dailyMassLabel}
        calendar={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
      />

      <div className="relative z-30 space-y-10">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`home-section-${section.id}`}>
            <h2
              id={`home-section-${section.id}`}
              className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]"
            >
              {section.title}
            </h2>
            <div className="flex flex-col items-center gap-3">
              {section.items.map((item) => (
                <div key={item.id} className={`${HOME_HUB_DAILY_MASS_WIDTH_CLASS} relative z-30`}>
                  <HomeNavPill href={item.href}>{item.title}</HomeNavPill>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
