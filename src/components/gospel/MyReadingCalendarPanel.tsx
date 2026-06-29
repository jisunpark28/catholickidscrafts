"use client";

import { GospelReadingCalendar } from "@/components/gospel/GospelReadingCalendar";
import { HomeHubButton } from "@/components/HomeHubButton";
import { useState } from "react";

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
  focusDate: string;
  onSelectDate?: (dateKey: string) => void;
};

export function MyReadingCalendarPanel({
  signedIn,
  initialCompleted,
  todayDate,
  focusDate,
  onSelectDate,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-8">
      <HomeHubButton variant="primary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>My Reading Calendar</span>
          <span className="text-sm font-normal opacity-60" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
      </HomeHubButton>
      {open && (
        <div className="mt-6 w-full">
          <GospelReadingCalendar
            signedIn={signedIn}
            initialCompleted={initialCompleted}
            todayDate={todayDate}
            focusDate={focusDate}
            onSelectDate={onSelectDate}
          />
        </div>
      )}
    </section>
  );
}
