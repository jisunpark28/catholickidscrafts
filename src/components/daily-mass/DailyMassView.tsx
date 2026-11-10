"use client";

import { DailyMassCalendarPanel } from "@/components/daily-mass/DailyMassCalendarPanel";
import { FaithJournalBanner } from "@/components/daily-mass/FaithJournalBanner";
import { GospelTypingSection } from "@/components/gospel/GospelTypingSection";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { deviceDateKey } from "@/lib/daily-mass/device-date";
import type { FaithJournalState } from "@/lib/daily-mass/faith-journal-shared";
import type { FamilyTalkEntry } from "@/lib/daily-mass/family-talk";
import type { ReadingRef } from "@/lib/daily-mass/reading-refs";
import type { VestmentColorInfo } from "@/lib/daily-mass/vestment-color";
import type { LiturgicalSeasonInfo, MonthCalendar } from "@/types/mass";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

export type DailyMassReadingRef = ReadingRef;

export type DailyMassViewProps = {
  dateKey: string;
  /** True when the URL carried ?date=, so device-date sync is skipped. */
  explicitDate: boolean;
  displayDate: string;
  dayTitle: string;
  seasonName: string;
  seasonColor: LiturgicalSeasonInfo["color"];
  memorial?: string;
  color: VestmentColorInfo;
  readings: ReadingRef[];
  usccbUrl: string;
  familyTalk: FamilyTalkEntry | null;
  gospelCitation?: string;
  /** Where the Faith Journal "Read" link goes: the passage in the Bible reader, else /gospel. */
  gospelReadHref: string;
  /** Sign-in / Plus state and (Plus) memo anchor + recent entries for the Faith Journal banner. */
  journal: FaithJournalState;
  calendar: MonthCalendar;
  calendarError?: boolean;
};

function Chevron({ up }: { up: boolean }) {
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

function ArrowToggle({ open, controls, label, onToggle }: { open: boolean; controls: string; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="dm-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6b7280] hover:bg-white hover:text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
    >
      <Chevron up={open} />
      <span className="sr-only">{open ? `Hide ${label}` : `Show ${label}`}</span>
    </button>
  );
}

/** One full-width Daily Mass block. Collapsed shows a slim bar; the content stays mounted so typing is kept. */
function Collapsible({
  label,
  title,
  open,
  onToggle,
  children,
}: {
  label: string;
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: (toggle: ReactNode) => ReactNode;
}) {
  const id = useId();
  const toggle = <ArrowToggle open={open} controls={id} label={label} onToggle={onToggle} />;
  return (
    <section className="dm-section w-full min-w-0" aria-label={label}>
      {open ? null : (
        <div className="dm-card flex w-full items-center justify-between gap-3 rounded-2xl border border-[#e8e0d6] bg-white px-4 py-2.5 shadow-sm sm:px-5">
          <span className="dm-ink text-[0.95em] font-semibold text-[#1c1c1c]">{title}</span>
          {toggle}
        </div>
      )}
      <div id={id} hidden={!open} className="w-full min-w-0">
        {children(toggle)}
      </div>
    </section>
  );
}

const SIZES = [0.9, 1, 1.1, 1.25, 1.4] as const;
const STORE_KEY = "ckc.dailyMass.reader";

const pill =
  "dm-pill inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#e7e3de] bg-white px-3.5 py-1.5 text-[0.8125em] font-semibold text-[#1c1c1c] no-underline transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

export function DailyMassView(props: DailyMassViewProps) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const router = useRouter();
  const [sizeIdx, setSizeIdx] = useState(1);
  const [dark, setDark] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(props.journal.signedIn);
  const [stickerVersion, setStickerVersion] = useState(0);
  // All three sections start collapsed; content stays mounted (hidden) so typing and stickers keep working.
  const [open, setOpen] = useState({ calendar: false, typing: false, journal: false });
  const flip = (key: keyof typeof open) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as { size?: number; dark?: boolean };
      if (typeof saved.size === "number" && saved.size >= 0 && saved.size < SIZES.length) setSizeIdx(saved.size);
      if (typeof saved.dark === "boolean") setDark(saved.dark);
    } catch {
      /* ignore */
    }
    const local = deviceDateKey();
    setToday(local);
    if (!props.explicitDate && local !== props.dateKey) {
      router.replace(`/daily-mass?date=${local}`);
    }
  }, [props.explicitDate, props.dateKey, router]);

  useEffect(() => {
    setSignedIn(props.journal.signedIn);
  }, [props.journal.signedIn]);

  const onTypingCompleted = useCallback(() => {
    setSignedIn(true);
    setStickerVersion((value) => value + 1);
  }, []);

  function save(next: { size: number; dark: boolean }) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const { color, familyTalk } = props;
  const lookFor =
    familyTalk?.lookFor ??
    t("daily_mass.family.look_for_fallback", "Look at the priest's vestments. What color are they today?").replace(
      "{color}",
      color.label.toLowerCase(),
    );
  const questions = familyTalk?.questions ?? [
    t("daily_mass.family.fallback_q1", "What is one word or picture from today's Gospel that you remember?"),
    t("daily_mass.family.fallback_q2", "What does today's Gospel teach us about Jesus?"),
    t("daily_mass.family.fallback_q3", "How can our family live out today's Gospel this week?"),
  ];

  return (
    <div className={`daily-mass-reader w-full min-w-0 ${dark ? "dm-dark" : ""}`} style={{ fontSize: `${SIZES[sizeIdx]}rem` }}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="dm-ink m-0 text-[1.75em] font-bold text-[#2e7d32]">{t("daily_mass.page.title", "Daily Mass")}</h1>
          <p className="dm-muted m-0 mt-1 text-[0.9em] text-[#4b5563]">
            {t("daily_mass.page.choose", "Choose a day to see the readings")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-base" role="group" aria-label={t("daily_mass.tools.label", "Reading tools")}>
          <button
            type="button"
            className={pill}
            onClick={() => {
              const size = Math.max(0, sizeIdx - 1);
              setSizeIdx(size);
              save({ size, dark });
            }}
            disabled={sizeIdx === 0}
            aria-label={t("daily_mass.tools.smaller", "Smaller text")}
          >
            A−
          </button>
          <button
            type="button"
            className={pill}
            onClick={() => {
              const size = Math.min(SIZES.length - 1, sizeIdx + 1);
              setSizeIdx(size);
              save({ size, dark });
            }}
            disabled={sizeIdx === SIZES.length - 1}
            aria-label={t("daily_mass.tools.larger", "Larger text")}
          >
            A+
          </button>
          <button
            type="button"
            className={pill}
            aria-pressed={dark}
            onClick={() => {
              setDark(!dark);
              save({ size: sizeIdx, dark: !dark });
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            {t("daily_mass.tools.dark", "Dark mode")}
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Collapsible label="Mass calendar" title={<><span aria-hidden>📅 </span>Mass Calendar</>} open={open.calendar} onToggle={() => flip("calendar")}>
          {(toggle) => (
            <DailyMassCalendarPanel
              initial={props.calendar}
              calendarError={Boolean(props.calendarError)}
              selectedDate={props.dateKey}
              todayDate={today}
              signedIn={signedIn}
              stickerVersion={stickerVersion}
              displayDate={props.displayDate}
              dayTitle={props.dayTitle}
              seasonName={props.seasonName}
              seasonColor={props.seasonColor}
              memorial={props.memorial}
              readings={props.readings}
              usccbUrl={props.usccbUrl}
              headerEnd={toggle}
            />
          )}
        </Collapsible>

        <Collapsible label="Typing" title={<><span aria-hidden>⌨️ </span>Today&apos;s Readings</>} open={open.typing} onToggle={() => flip("typing")}>
          {(toggle) =>
            today ? (
              <GospelTypingSection
                key={props.dateKey}
                todayDate={today}
                focusDate={props.dateKey}
                readingRefs={props.readings}
                usccbUrl={props.usccbUrl}
                onCompleted={onTypingCompleted}
                headerEnd={toggle}
              />
            ) : null
          }
        </Collapsible>

        <Collapsible label="Our Faith Journal" title={<><span aria-hidden>✍️ </span>{t("daily_mass.journal.title", "Our Faith Journal")}</>} open={open.journal} onToggle={() => flip("journal")}>
          {(toggle) => (
            <FaithJournalBanner
              dateKey={props.dateKey}
              gospelLabel={familyTalk?.gospel ?? props.gospelCitation}
              readHref={props.gospelReadHref}
              questions={questions}
              lookFor={lookFor}
              lookColorHex={color.hex}
              journal={props.journal}
              headerEnd={toggle}
            />
          )}
        </Collapsible>
      </div>
    </div>
  );
}
