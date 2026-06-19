"use client";

import { HOME_HUB_DAILY_MASS_WIDTH_CLASS } from "@/components/HomeHubButton";
import { MassCalendar } from "@/components/MassCalendar";
import type { MonthCalendar } from "@/types/mass";
import { useState } from "react";

type Props = {
  label: string;
  calendar: MonthCalendar;
  selectedDate: string;
  todayDate: string;
};

export function DailyMassPanel({ label, calendar, selectedDate, todayDate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-10">
      <div className={HOME_HUB_DAILY_MASS_WIDTH_CLASS}>
        <HomeHubButton variant="primary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>{label}</span>
          <span className="text-sm font-normal opacity-60" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
        </HomeHubButton>
      </div>
      {open && (
        <div className="relative z-0 mt-6 w-full">
          <MassCalendar initial={calendar} selectedDate={selectedDate} todayDate={todayDate} />
        </div>
      )}
    </section>
  );
}
