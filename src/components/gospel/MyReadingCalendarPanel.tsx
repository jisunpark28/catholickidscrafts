"use client";

import { GospelReadingCalendar } from "@/components/gospel/GospelReadingCalendar";
import { HomeHubButton, HOME_HUB_DAILY_MASS_WIDTH_CLASS, HOME_HUB_CONTENT_CLASS } from "@/components/HomeHubButton";
import { useState } from "react";

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
  onSelectDate?: (dateKey: string) => void;
};

export function MyReadingCalendarPanel({
  signedIn,
  initialCompleted,
  todayDate,
  onSelectDate,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-8">
      <div className={HOME_HUB_DAILY_MASS_WIDTH_CLASS}>
        <HomeHubButton variant="primary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>My Reading Calendar</span>
          <span className="text-sm font-normal opacity-60" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
        </HomeHubButton>
      </div>
      {open && (
        <div className={`mt-6 ${signedIn ? "w-full" : HOME_HUB_DAILY_MASS_WIDTH_CLASS}`}>
          <GospelReadingCalendar
            signedIn={signedIn}
            initialCompleted={initialCompleted}
            todayDate={todayDate}
            onSelectDate={onSelectDate}
          />
        </div>
      )}
    </section>
  );
}
