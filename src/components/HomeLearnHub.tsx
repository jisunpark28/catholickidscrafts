import { DailyMassPanel } from "@/components/DailyMassPanel";
import { HubPillWidth } from "@/components/HubPillWidth";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { HomeHubButtonLink } from "@/components/HomeHubButton";
import { HomeNavPill } from "@/components/HomeNavPill";
import { ReaderThisWeekCard } from "@/components/lesson/ReaderThisWeekCard";
import type { HomeSectionWithItems } from "@/lib/home-sections";
import type { MonthCalendar } from "@/types/mass";
import "@/styles/lesson-kit.css";

export type HomeLearnHubCopy = {
  heroTitle: string;
  heroSubtitle: string;
  ctaMass: string;
  ctaResources: string;
  dailyMassLabel: string;
  dailyMassHint: string;
  dailyMassShow: string;
  dailyMassHide: string;
  exploreHeading: string;
};

type Props = {
  copy: HomeLearnHubCopy;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
  sections: HomeSectionWithItems[];
};

export function HomeLearnHub({
  copy,
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
  sections,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[144rem] px-4 py-8 sm:px-8 sm:py-10">
      <HubTypingWidth>
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-muted)]">
            {copy.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <HomeHubButtonLink href="/mass" variant="primary">
              {copy.ctaMass}
            </HomeHubButtonLink>
            <HomeHubButtonLink href="/resources" variant="outline">
              {copy.ctaResources}
            </HomeHubButtonLink>
          </div>
        </header>
      </HubTypingWidth>

      <DailyMassPanel
        label={copy.dailyMassLabel}
        hint={copy.dailyMassHint}
        showLabel={copy.dailyMassShow}
        hideLabel={copy.dailyMassHide}
        calendar={calendar}
        selectedDate={selectedDate}
        todayDate={todayDate}
        todayTitle={todayTitle}
        calendarCelebration={calendarCelebration}
      />

      <HubPillWidth>
        <ReaderThisWeekCard />
      </HubPillWidth>

      <div className="relative z-30 mt-4 border-t border-[#e8dccf] pt-10">
        <HubPillWidth>
          <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            {copy.exploreHeading}
          </h2>
        </HubPillWidth>
        <div className="space-y-12">
          {sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`home-section-${section.id}`}
              className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-4 py-6 sm:px-6"
            >
              <HubPillWidth>
                <h3
                  id={`home-section-${section.id}`}
                  className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]"
                >
                  {section.title}
                </h3>
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
    </div>
  );
}
