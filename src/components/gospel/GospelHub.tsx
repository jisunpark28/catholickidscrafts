"use client";

import { GospelTypingSection } from "@/components/gospel/GospelTypingSection";
import { MyReadingCalendarPanel } from "@/components/gospel/MyReadingCalendarPanel";
import { HomeHubButtonLink, HOME_HUB_CONTENT_CLASS } from "@/components/HomeHubButton";
import { useState } from "react";

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
};

export function GospelHub({ signedIn, initialCompleted, todayDate }: Props) {
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [focusDate, setFocusDate] = useState(todayDate);

  function handleCompleted(dateKey: string) {
    setCompleted((prev) => (prev.includes(dateKey) ? prev : [...prev, dateKey]));
    setFocusDate(dateKey);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-10">
      <div className={HOME_HUB_CONTENT_CLASS}>
        <HomeHubButtonLink href="/" variant="outline" className="mb-8 !min-h-[2.75rem] !py-2.5 !text-sm">
          ← Home
        </HomeHubButtonLink>
      </div>

      <MyReadingCalendarPanel
        signedIn={signedIn}
        initialCompleted={completed}
        todayDate={todayDate}
        onSelectDate={setFocusDate}
      />

      <GospelTypingSection
        signedIn={signedIn}
        todayDate={todayDate}
        focusDate={focusDate}
        onCompleted={handleCompleted}
      />
    </div>
  );
}
