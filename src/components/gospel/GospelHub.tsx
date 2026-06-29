"use client";

import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { GospelTypingSection } from "@/components/gospel/GospelTypingSection";
import { MyReadingCalendarPanel } from "@/components/gospel/MyReadingCalendarPanel";
import { isHeaderSignedIn, type HeaderSessionResponse } from "@/lib/header-session";
import { useCallback, useEffect, useState } from "react";

type Props = {
  signedIn: boolean;
  initialCompleted: string[];
  todayDate: string;
};

export function GospelHub({ signedIn: initialSignedIn, initialCompleted, todayDate }: Props) {
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [focusDate, setFocusDate] = useState(todayDate);

  useEffect(() => {
    setSignedIn(initialSignedIn);
    setCompleted(initialCompleted);
  }, [initialSignedIn, initialCompleted]);

  const refreshSignedIn = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) return;
      const session = (await res.json()) as HeaderSessionResponse;
      if (isHeaderSignedIn(session)) setSignedIn(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (initialSignedIn) return;
    void refreshSignedIn();
  }, [initialSignedIn, refreshSignedIn]);

  function handleCompleted(dateKey: string) {
    setSignedIn(true);
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
        todayDate={todayDate}
        focusDate={focusDate}
        onCompleted={handleCompleted}
      />
    </BibleHubShell>
  );
}
