"use client";

import { DailyMassCalendarBlock } from "@/components/DailyMassCalendarBlock";
import { HomeHubButton } from "@/components/HomeHubButton";
import type { MonthCalendar } from "@/types/mass";
import { useState } from "react";

type Props = {
  label: string;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
  todayTitle?: string;
  calendarCelebration?: string;
};

export function DailyMassPanel({
  label,
  calendar,
  selectedDate,
  todayDate,
  todayTitle,
  calendarCelebration,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-10">
      <HomeHubButton variant="primary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>{label}</span>
          <span className="text-sm font-normal opacity-60" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
      </HomeHubButton>
      {open && (
        <div className="relative z-10 mt-6 w-full">
          <DailyMassCalendarBlock
            calendar={calendar}
            selectedDate={selectedDate}
            todayDate={todayDate}
            todayTitle={todayTitle}
            calendarCelebration={calendarCelebration}
          />
        </div>
      )}
    </section>
  );
}
