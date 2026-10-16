"use client";

import { GospelReadingCalendar } from "@/components/gospel/GospelReadingCalendar";
import { useId, useState } from "react";

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
  onSelectDate?: (dateKey: string) => void;
};

function CalendarArrow({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 ${up ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M5 12.5 10 7.5 15 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MyReadingCalendarPanel({
  signedIn,
  initialCompleted,
  todayDate,
  onSelectDate,
}: Props) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  const toggle = (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6b7280] hover:bg-white hover:text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => setOpen((value) => !value)}
    >
      <CalendarArrow up={open} />
      <span className="sr-only">{open ? "Hide calendar" : "Show calendar"}</span>
    </button>
  );

  return (
    <section className="mb-6" aria-label="Reading calendar">
      {open ? (
        <div id={panelId}>
          <GospelReadingCalendar
            signedIn={signedIn}
            initialCompleted={initialCompleted}
            todayDate={todayDate}
            onSelectDate={onSelectDate}
            headerEnd={toggle}
          />
        </div>
      ) : (
        <div id={panelId} className="flex justify-end">
          {toggle}
        </div>
      )}
    </section>
  );
}
