"use client";

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
      <div className="mx-auto w-1/2 min-w-[9rem] max-w-md">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative block w-full rounded-[2rem] bg-[#f5d4b8] px-6 py-4 text-center text-lg text-[var(--color-ink)] shadow-md transition hover:bg-[#f0c9a8] sm:px-8 sm:py-5 sm:text-xl"
          aria-expanded={open}
        >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-[#2d3748]"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            x="4"
            y="4"
            width="392"
            height="72"
            rx="36"
            ry="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="opacity-90"
          />
        </svg>
        <span className="relative z-10">
          {label}
          <span className="ml-2 text-base opacity-70">{open ? "▲" : "▼"}</span>
        </span>
        </button>
      </div>
      {open && (
        <div className="mt-6">
          <MassCalendar initial={calendar} selectedDate={selectedDate} todayDate={todayDate} />
        </div>
      )}
    </section>
  );
}
