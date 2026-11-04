/** Right column of the Bible reader, reserved for Mom's Bible notes (no data yet). */
export function MomsNotesPlaceholder() {
  return (
    <aside className="bible-reader__notes" aria-labelledby="moms-notes-title">
      <p className="gospel-typing__pane-label">Notes</p>
      <div className="bible-reader__notes-card rounded-xl border border-dashed border-[#e3d9cc] bg-white/70 p-5">
        <h2 id="moms-notes-title" className="text-base font-bold text-[var(--color-ink)]">
          <span aria-hidden>💌</span> Mom&apos;s Notes{" "}
          <span className="ml-1 rounded-full bg-[#fff4ec] px-2 py-0.5 align-middle text-[11px] font-semibold text-[#d35400]">
            Coming soon
          </span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Soon parents will be able to highlight verses, write a letter for this chapter and leave
          notes and stickers for their children right here.
        </p>
      </div>
    </aside>
  );
}
