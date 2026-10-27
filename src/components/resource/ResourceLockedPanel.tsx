import Link from "next/link";

type Props = {
  liturgicalName: string;
  gospelRef: string;
  yearLabel: string;
  thisSundayHref?: string | null;
};

/** Shown when a free member opens a sheet that is not this Sunday. */
export function ResourceLockedPanel({
  liturgicalName,
  gospelRef,
  yearLabel,
  thisSundayHref,
}: Props) {
  return (
    <section
      aria-label="Plus required"
      className="mt-5 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-6 py-8 text-center"
    >
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-[#d35400]">Plus library</p>
      <h2 className="mb-2 mt-2 text-xl font-bold text-[#1c1c1c]">{liturgicalName}</h2>
      <p className="m-0 text-sm text-[#6b7280]">
        {yearLabel} · {gospelRef}
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#4b5563]">
        Free accounts can browse the library and open <strong>this Sunday&apos;s</strong> worksheet to
        view and print. Unlock Plus to open every Sunday and feast sheet, and to edit with photos and
        stickers.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/subscribe"
          className="rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
        >
          Unlock with Plus
        </Link>
        <Link
          href={thisSundayHref || "/resource"}
          className="rounded-full border border-[#e7e3de] bg-white px-5 py-2.5 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
        >
          {thisSundayHref ? "This Sunday's sheet" : "Back to Resource"}
        </Link>
      </div>
    </section>
  );
}
