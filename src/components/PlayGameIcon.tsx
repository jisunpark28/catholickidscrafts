/** Small, decorative line illustrations in the site's warm orange and green palette. */
export function PlayGameIcon({ slug }: { slug: string }) {
  const drawings: Record<string, React.ReactNode> = {
    "ten-commandments": <><path d="M5 42V23l10-8 10 8v19M15 16V6m-4 4h8M28 42V29l8-7 8 7v13M11 42V31h8v11M33 42v-8h6v8M4 43h40" /><path d="M27 9c-4-6-11 0 0 7 11-7 4-13 0-7Z" /></>, 
    church: <><path d="M12 21V10l12-7 12 7v11M8 21h32v22H8zM20 43V30a4 4 0 0 1 8 0v13M24 9v9m-4-5h8M14 28h2m16 0h2" /></>,
    "liturgical-vestments": <><path d="m18 7-11 9 6 10 5-3v19h12V23l5 3 6-10L30 7M18 7a6 6 0 0 0 12 0M24 19v14m-5-9h10" /></>,
    typing: <><rect x="5" y="13" width="38" height="26" rx="5" /><path d="M12 21h2m5 0h2m5 0h2m5 0h2M12 28h2m5 0h2m5 0h2m5 0h2M17 34h14" /></>,
    hangman: <><path d="M24 30v13m0-6-8-4m8 2 8-5" /><circle cx="24" cy="20" r="5" /><path d="M20 15c-10-11 18-11 8 0 15-4 15 17 1 9 7 14-17 18-11 2-16 2-13-18 1-11" /></>,
    "face-to-emoji": <><circle cx="24" cy="24" r="18" /><path d="M16 20h1m14 0h1M16 28c4 8 12 8 16 0" /></>,
    emoji: <><rect x="12" y="3" width="24" height="42" rx="4" /><rect x="17" y="8" width="14" height="12" rx="2" /><rect x="17" y="25" width="14" height="12" rx="2" /><path d="m20 16 3-3 5 4m-8 16 3-3 5 4M22 41h4" /></>,
  };
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-14 w-14" aria-hidden="true" focusable="false">
      {drawings[slug] ?? drawings.church}
    </svg>
  );
}
