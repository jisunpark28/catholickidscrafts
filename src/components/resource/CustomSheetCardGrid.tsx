import { resourceEditPath } from "@/lib/resource/sheet-edit-path";
import { keyToSlug } from "@/lib/resource/sheets";
import Link from "next/link";

export type CustomSheetCard = {
  id: string;
  name: string;
  baseKey: string;
  level: 1 | 2;
  updatedAt: string;
  thumbUrl: string | null;
};

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Plus member saved custom sheets — Open resumes Fabric edit with ?id=. */
export function CustomSheetCardGrid({ sheets }: { sheets: CustomSheetCard[] }) {
  if (sheets.length === 0) {
    return (
      <p className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-6 text-sm text-[#6b7280]">
        No custom sheets yet. Open any sheet, tap{" "}
        <span className="font-semibold text-[#1c1c1c]">Edit</span>, then Save — it will show up here.
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sheets.map((s) => {
        const editHref = resourceEditPath(s.baseKey, s.level, s.id);
        return (
          <li
            key={s.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#e7e3de] bg-white shadow-[0_1px_3px_rgba(28,28,28,0.04)]"
          >
            <Link href={editHref} className="block aspect-[8.5/11] bg-[#f5ebe0] no-underline" tabIndex={-1}>
              {s.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.thumbUrl} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#9ca3af]">
                  {s.name}
                </div>
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <div className="text-xs font-bold tracking-wide text-[#d35400]">
                {s.baseKey} · L{s.level}
              </div>
              <h3 className="m-0 text-base font-bold leading-snug text-[#1c1c1c]">
                <Link href={editHref} className="text-inherit no-underline hover:underline">
                  {s.name}
                </Link>
              </h3>
              <p className="mb-0 mt-auto text-xs text-[#6b7280]">Updated {formatUpdated(s.updatedAt)}</p>
              <div className="mt-2 flex gap-2">
                <Link
                  href={editHref}
                  className="rounded-full bg-[#d35400] px-4 py-1.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
                >
                  Open
                </Link>
                <Link
                  href={`/resource/${keyToSlug(s.baseKey)}${s.level === 2 ? "?level=2" : ""}`}
                  className="rounded-full border border-[#e7e3de] px-4 py-1.5 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
                >
                  Base sheet
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
