"use client";

import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { GospelTypingSection } from "@/components/gospel/GospelTypingSection";
import { MyReadingCalendarPanel } from "@/components/gospel/MyReadingCalendarPanel";
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
    <BibleHubShell showBack={false}>
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
    </BibleHubShell>
  );
}
