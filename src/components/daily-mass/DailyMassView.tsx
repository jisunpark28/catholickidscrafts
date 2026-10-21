"use client";

import { FaithJournalBanner } from "@/components/daily-mass/FaithJournalBanner";
import { MiniMonthCalendar } from "@/components/daily-mass/MiniMonthCalendar";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import type { FaithJournalState } from "@/lib/daily-mass/faith-journal-shared";
import type { FamilyTalkEntry } from "@/lib/daily-mass/family-talk";
import type { VestmentColorInfo } from "@/lib/daily-mass/vestment-color";
import type { MonthCalendar, ReadingKind } from "@/types/mass";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type DailyMassReadingRef = { kind: ReadingKind; label: string; citation: string };

export type DailyMassViewProps = {
  dateKey: string;
  /** True when the URL carried ?date=, so device-date sync is skipped. */
  explicitDate: boolean;
  displayDate: string;
  dayTitle: string;
  seasonName: string;
  lectionary?: string;
  memorial?: string;
  color: VestmentColorInfo;
  readings: DailyMassReadingRef[];
  usccbUrl: string;
  familyTalk: FamilyTalkEntry | null;
  gospelCitation?: string;
  /** Where "Read the Gospel" goes: the passage in the Bible reader, else /gospel. */
  gospelReadHref: string;
  /** Sign-in / Plus state and (Plus) memo anchor + recent entries for the Faith Journal banner. */
  journal: FaithJournalState;
  nextSunday: {
    dateKey: string;
    shortDate: string;
    title: string;
    gospel?: string;
    usccbUrl: string;
    lwcUrl: string;
  };
  calendar: MonthCalendar;
};

const SIZES = [0.9, 1, 1.1, 1.25, 1.4] as const;
const STORE_KEY = "ckc.dailyMass.reader";

function deviceDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

const pill =
  "dm-pill inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#e7e3de] bg-white px-3.5 py-1.5 text-[0.8125em] font-semibold text-[#1c1c1c] no-underline transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const card = "dm-card rounded-2xl border border-[#e7e3de] bg-white p-5";
const eyebrow = "dm-muted mb-2 text-[0.6875em] font-semibold uppercase tracking-[0.12em] text-[#6b7280]";

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={pill}>
      {children} <span aria-hidden>↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function DailyMassView(props: DailyMassViewProps) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const router = useRouter();
  const [sizeIdx, setSizeIdx] = useState(1);
  const [dark, setDark] = useState(false);
  const [deviceToday, setDeviceToday] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as { size?: number; dark?: boolean };
      if (typeof saved.size === "number" && saved.size >= 0 && saved.size < SIZES.length) setSizeIdx(saved.size);
      if (typeof saved.dark === "boolean") setDark(saved.dark);
    } catch {
      /* ignore */
    }
    const local = deviceDateKey();
    setDeviceToday(local);
    if (!props.explicitDate && local !== props.dateKey) {
      router.replace(`/daily-mass?date=${local}`);
    }
  }, [props.explicitDate, props.dateKey, router]);

  function save(next: { size: number; dark: boolean }) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const isToday = deviceToday === null ? !props.explicitDate : deviceToday === props.dateKey;
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
    <div
      className={`daily-mass-reader ${dark ? "dm-dark" : ""}`}
      style={{ fontSize: `${SIZES[sizeIdx]}rem` }}
    >
      <div className="mb-[1.125em] flex flex-wrap items-center justify-between gap-3">
        <h1 className="dm-ink m-0 text-[1.75em] font-bold text-[#1c1c1c]">
          {t("daily_mass.page.title", "Daily Mass")}
        </h1>
        <div className="flex items-center gap-1.5 text-base" role="group" aria-label={t("daily_mass.tools.label", "Reading tools")}>
          <button
            type="button"
            className={pill}
            onClick={() => {
              const s = Math.max(0, sizeIdx - 1);
              setSizeIdx(s);
              save({ size: s, dark });
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
              const s = Math.min(SIZES.length - 1, sizeIdx + 1);
              setSizeIdx(s);
              save({ size: s, dark });
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

      <div className="mb-5">
        <FaithJournalBanner
          dateKey={props.dateKey}
          gospelLabel={familyTalk?.gospel ?? props.gospelCitation}
          readHref={props.gospelReadHref}
          questions={questions}
          lookFor={lookFor}
          lookColorHex={color.hex}
          journal={props.journal}
        />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Left column */}
        <div className="flex min-w-0 flex-1 flex-col gap-[1.125em]">
          <section className={`${card} dm-today border-t-4 border-t-[#059669] bg-[#fbfdfb]`} aria-labelledby="dm-today-title">
            <p className={eyebrow}>
              {isToday ? t("daily_mass.today.label", "Today") : t("daily_mass.selected.label", "Selected day")}
            </p>
            <div className="flex flex-wrap justify-between gap-4">
              <div className="min-w-0">
                <p className="dm-muted m-0 text-[0.9375em] text-[#4b5563]">{props.displayDate}</p>
                <h2 id="dm-today-title" className="dm-ink my-1 text-[1.5em] font-bold leading-tight text-[#1c1c1c]">
                  {props.dayTitle}
                </h2>
                <p className="dm-muted m-0 text-[0.875em] text-[#4b5563]">
                  {t("daily_mass.today.season", "Season")}: {props.seasonName}
                  {props.lectionary ? ` · ${t("daily_mass.today.lectionary", "Lectionary")} ${props.lectionary}` : ""}
                </p>
                {props.memorial && (
                  <p className="dm-muted mt-1.5 text-[0.875em] text-[#4b5563]">
                    {t("daily_mass.today.memorial", "Optional memorial")}: <b>{props.memorial}</b>
                  </p>
                )}
              </div>
            </div>
            {!isToday && deviceToday && (
              <p className="dm-muted mb-0 mt-3 text-[0.75em] text-[#9ca3af]">
                <Link href={`/daily-mass?date=${deviceToday}`} className="font-semibold text-[#d35400]">
                  {t("daily_mass.today.back", "Back to today")}
                </Link>
              </p>
            )}
          </section>

          <section className={card} aria-labelledby="dm-readings-title">
            <h2 id="dm-readings-title" className={eyebrow}>
              {t("daily_mass.readings.title", "Today's readings")}
            </h2>
            {props.readings.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {props.readings.map((r) => (
                  <li
                    key={r.kind}
                    className="dm-rule flex flex-wrap items-center justify-between gap-2.5 border-t border-[#f0ece7] py-3"
                  >
                    <div>
                      <div className="dm-muted text-[0.75em] font-semibold text-[#6b7280]">{r.label}</div>
                      <div className="dm-ink text-[1em] font-semibold text-[#1c1c1c]">{r.citation}</div>
                    </div>
                    <ExtLink href={props.usccbUrl}>{t("daily_mass.links.usccb", "Read on USCCB")}</ExtLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dm-muted text-[0.875em] text-[#4b5563]">
                {t("daily_mass.readings.unavailable", "Reading citations aren't available for this date yet. Open USCCB or Living with Christ above.")}
              </p>
            )}
            <Link
              href="/gospel"
              className="mt-3.5 inline-flex rounded-full bg-[#d35400] px-[1.375em] py-[0.7em] text-[0.9375em] font-semibold text-white no-underline hover:bg-[#b84a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]"
            >
              {t("daily_mass.readings.type_gospel", "Type today's Gospel")} <span aria-hidden>&nbsp;→</span>
            </Link>
          </section>
        </div>

        {/* Right column — top aligns with the Today card */}
        <div className="flex w-full min-w-0 flex-col gap-[1.125em] lg:w-[23.75rem] lg:shrink-0">
          <section className={`${card} border-t-4 border-t-[#059669]`} aria-labelledby="dm-sunday-title">
            <p className={eyebrow}>
              {t("daily_mass.sunday.label", "Next Sunday")} · {props.nextSunday.shortDate}
            </p>
            <h2 id="dm-sunday-title" className="dm-ink m-0 text-[1.0625em] font-bold text-[#1c1c1c]">
              {props.nextSunday.title}
            </h2>
            {props.nextSunday.gospel && (
              <p className="dm-muted mb-3 mt-1.5 text-[0.875em] text-[#4b5563]">
                {t("daily_mass.sunday.gospel", "Gospel")}: <b>{props.nextSunday.gospel}</b>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <ExtLink href={props.nextSunday.usccbUrl}>{t("daily_mass.links.usccb", "Read on USCCB")}</ExtLink>
              <ExtLink href={props.nextSunday.lwcUrl}>{t("daily_mass.links.lwc", "Living with Christ")}</ExtLink>
            </div>
          </section>

          <MiniMonthCalendar initial={props.calendar} selectedDate={props.dateKey} todayDate={deviceToday ?? props.dateKey} />
        </div>
      </div>

      <footer className="dm-rule dm-muted mt-7 border-t border-[#e7e3de] pt-3.5 text-[0.75em] text-[#9ca3af]">
        {t("daily_mass.sources.readings", "Reading citations")}:{" "}
        <a href={props.usccbUrl} target="_blank" rel="noopener noreferrer" className="text-[#1e40af]">
          USCCB Daily Readings
        </a>{" "}
        ({t("daily_mass.sources.links_only", "links only")}).{" "}
        {t("daily_mass.sources.questions", "Family talk questions written by CatholicKidsCrafts.")}
      </footer>
    </div>
  );
}
