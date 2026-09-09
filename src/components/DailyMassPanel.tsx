"use client";

import { DailyMassCalendarBlock } from "@/components/DailyMassCalendarBlock";
import { HomeHubButton } from "@/components/HomeHubButton";
import { HubPillWidth } from "@/components/HubPillWidth";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import type { MonthCalendar } from "@/types/mass";
import { useId, useState } from "react";

type Props = {
  label: string;
  hint: string;
  showLabel: string;
  hideLabel: string;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
};

export function DailyMassPanel({
  label,
  hint,
  showLabel,
  hideLabel,
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="mb-10" aria-label={label}>
      <HomeHubButton
        variant="primary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{label}</span>
        <span className="text-sm font-normal opacity-70">{open ? hideLabel : showLabel}</span>
      </HomeHubButton>
      <HubPillWidth>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">{hint}</p>
      </HubPillWidth>
      <div id={panelId} hidden={!open}>
        {open && (
          <HubTypingWidth wide className="relative z-10 mt-6">
            <DailyMassCalendarBlock
              calendar={calendar}
              selectedDate={selectedDate}
              todayDate={todayDate}
              todayTitle={todayTitle}
              calendarCelebration={calendarCelebration}
              large
            />
          </HubTypingWidth>
        )}
      </div>
    </section>
  );
}
