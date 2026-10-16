import { DailyMassCalendarBlock } from "@/components/DailyMassCalendarBlock";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ReaderThisWeekCard } from "@/components/lesson/ReaderThisWeekCard";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
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
  exploreHeading: string;
  readingUsccb: string;
  readingLwc: string;
  readingGoodnews: string;
  curriculum: string;
  gallery: string;
  play: string;
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
  const { groups } = buildHomePdfNav(sections, {
    gallery: copy.gallery,
    curriculum: copy.curriculum,
    resources: copy.ctaResources,
    play: copy.play,
  });

  return (
    <HomePdfShell groups={groups}>
      <h1 className="sr-only">{copy.heroTitle}</h1>
      <p className="sr-only">{copy.heroSubtitle}</p>
      <section aria-label={copy.dailyMassLabel}>
        <DailyMassCalendarBlock
          variant="home"
          calendar={calendar}
          selectedDate={selectedDate}
          todayDate={todayDate}
          todayTitle={todayTitle}
          calendarCelebration={calendarCelebration}
          readingLinkLabels={{
            usccb: copy.readingUsccb,
            lwc: copy.readingLwc,
            goodnews: copy.readingGoodnews,
          }}
          readingLinkHint={copy.dailyMassHint}
        />
        <p className="sr-only">{copy.dailyMassHint}</p>
      </section>
      <div className="mt-8 max-w-3xl">
        <ReaderThisWeekCard />
      </div>
    </HomePdfShell>
  );
}
