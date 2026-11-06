import type { SidebarIcon } from "@/lib/sidebar-navigation";

/** Original paper-and-ink drawings. All pigment inherits currentColor, including active white ink. */
export function SidebarIllustration({ kind, className = "" }: { kind: SidebarIcon; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-sidebar-illustration={kind}>
      {kind === "printables" && <>
        <path d="M17 10.5Q16 9 19 9l29 .4 13 13-.5 38q0 4-4 4l-36 .5q-4 0-4-4Z" fill="currentColor" fillOpacity=".05" />
        <path d="m48 10-.5 13 13-.2M25 25l10 .2M25 35l25 .4M25 45l19-.2M25 55l10-.3" />
        <path d="m41 57 21-22q2-2 4 0l4 4q2 2 0 4L49 65l-11 3Z" fill="currentColor" fillOpacity=".1" />
        <path d="m41 57 8 8m11-28 8 8M38 68l4-1-3-3m6-5 18-19" />
        <path d="m21 13 22 .2M20 59l.2-36" strokeWidth=".8" opacity=".4" />
      </>}
      {kind === "mass" && <>
        <circle cx="40" cy="20" r="11.5" fill="currentColor" fillOpacity=".045" />
        <path d="M40 14v12m-4-8h8" strokeWidth="1.8" />
        <path d="M15 34q24-8 50 .1-1 24-24.5 27Q18 59 15 34Z" fill="currentColor" fillOpacity=".08" />
        <path d="M15 34q23 9 50 .1M19 42q21 7 42 .1M37 61l-.5 5q-.3 3-6 5l-5 2q14 5 29-.2l-5-2q-7-2-7-5v-5" />
        <path d="M23 47q3 7 9 9m14-1 8-5" strokeWidth="1" opacity=".65" />
      </>}
      {kind === "play" && <>
        <path d="M21 18Q11 20 7 43L5 59q0 12 9 9l13-14q13-4 26 .3l13 13q10 6 9-7L70 35q-3-16-12-17-5-1-10 2-8 5-16 0-5-3-11-2Z" fill="currentColor" fillOpacity=".055" />
        <path d="M19 29h7v8h8v7h-8v8h-7v-8h-8v-7h8Z" fill="currentColor" strokeWidth="1.2" />
        <g fill="currentColor" strokeWidth="1"><circle cx="58" cy="29" r="3" /><circle cx="49" cy="38" r="3" /><circle cx="67" cy="38" r="3" /><circle cx="58" cy="47" r="3" /></g>
        <path d="m35 44 3-.1m5 0 3 .1M12 55l-2 7M66 53l5 9" strokeWidth="1.1" opacity=".55" />
      </>}
      {kind === "bible" && <>
        <path d="M7 19q17-9 33 0 15-9 32-1l1 46q-16-7-33 .5-16-7-34 1Z" fill="currentColor" fillOpacity=".07" />
        <path d="M11 16q14-7 29 2 14-8 28-2l.5 43q-14-5-28 2-15-7-29 0Z" />
        <path d="m40 18 .3 43M18 25q7-2 14 1M18 33q7-2 14 1M18 41q7-2 14 1M18 49q7-2 14 1" strokeWidth="1.1" opacity=".8" />
        <path d="M54 26v23m-7-16h14" strokeWidth="2.8" />
        <path d="m51 59-.1 14 6-4 6 3V58" fill="currentColor" fillOpacity=".5" />
      </>}
      {kind === "questions" && <>
        <path d="m12 14 31-5q4-1 5 4l5 35q1 4-3 5l-29 5q-5 1-6-3L9 19q-1-4 3-5Z" fill="currentColor" fillOpacity=".055" />
        <path d="m35 24 32 5q4 1 3 5l-6 35q0 4-5 3l-32-5q-4-1-3-5l6-34q0-5 5-4Z" fill="currentColor" fillOpacity=".07" />
        <path d="M42 42q.5-8 8-7 9 2 6 9-1 3-6 5-4 2-4 6" strokeWidth="3.2" />
        <circle cx="45" cy="61" r="1.8" fill="currentColor" stroke="none" />
        <path d="m14 20 26-5m-21 37 4-.5m13-24 26 4" strokeWidth=".8" opacity=".45" />
      </>}
      {kind === "prayer" && <>
        <path d="m17 59 8-12 7-30q1-7 4-6 4 0 3 7l-2 23m2-22 1-8q1-5 4-3 2 1 1 7l-1 28q0 9-8 17l-8 8Z" fill="currentColor" fillOpacity=".05" />
        <path d="m63 59-8-12-7-30q-1-7-4-6M44 21l-1 20m2-23-2-9m-4 32q-5-14-9-12-3 2 0 8l1 10-6 9m19-15q5-14 9-12 3 2 0 8l-1 10 6 9M44 43q0 9 8 17l8 8" />
        <path d="m16 55 15 12-9 11L7 66Zm48 0L49 67l9 11 15-12Z" fill="currentColor" strokeWidth="1.4" />
        <path d="m35 17-5 23m17-20 4 20M34 49l-6 10m19-10 6 10" strokeWidth=".9" opacity=".6" />
      </>}
      {kind === "binder" && <>
        <path d="M17 12q-4 0-4 4v49q0 4 4 4l23-.5q15-2 28 .5V16q0-4-4-4-12-3-24 .5-12-3-23-.5Z" fill="currentColor" fillOpacity=".06" />
        <path d="M22 12v57m18-55v54M13 23H8v34h5M45 19q8-2 16-.5M46 62l15 .5" strokeWidth="1.4" />
        <path d="M34 25q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4m-5 12q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4m-5 12q-2-4 2-4h8q4 0 3 4-1 3-4 3h-4" />
        <path d="M17 17v45m47-43v44" strokeWidth=".8" opacity=".4" />
      </>}
    </svg>
  );
}