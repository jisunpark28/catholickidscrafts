"use client";

import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { SheetThumb } from "@/components/resource/SheetThumb";
import { resourceEditPath } from "@/lib/resource/sheet-edit-path";
import { keyToSlug } from "@/lib/resource/sheets";
import { getSundaySheet, toGospelSheetView } from "@/lib/sunday-sheet-content";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    if (busy) return;
    const ok = window.confirm(`Delete “${name}”? This cannot be undone.`);
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/resource/custom-sheets/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? `Delete failed (${res.status})`);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Delete failed");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={busy}
        className="rounded-full border border-[#e7e3de] bg-white px-4 py-1.5 text-sm font-medium text-[#9b1c1c] hover:border-[#f5c2c2] hover:bg-[#fff5f5] disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="text-xs text-[#9b1c1c]">{error}</span> : null}
    </div>
  );
}

/** Plus saved sheets — same paper thumb style as the All library grid. */
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
    <>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sheets.map((s) => {
          const editHref = resourceEditPath(s.baseKey, s.level, s.id);
          const base = getSundaySheet(s.baseKey);
          const view = base ? { ...toGospelSheetView(base), sundayLabel: s.baseKey } : null;
          return (
            <li
              key={s.id}
              className="flex flex-col rounded-2xl border border-[#e7e3de] bg-white p-3 shadow-[0_1px_3px_rgba(28,28,28,0.04)]"
            >
              <Link href={editHref} className="relative block no-underline" tabIndex={-1}>
                {view ? (
                  <SheetThumb sheet={view} level={s.level} />
                ) : s.thumbUrl?.startsWith("data:image/") ? (
                  <div className="overflow-hidden rounded-xl border border-[#ece7e1] bg-white shadow-[0_1px_2px_rgba(28,28,28,0.04)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.thumbUrl} alt="" className="block w-full object-cover object-top" />
                  </div>
                ) : (
                  <div className="flex aspect-[8.5/11] items-center justify-center rounded-xl border border-[#ece7e1] bg-white text-sm text-[#9ca3af]">
                    {s.name}
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  CUSTOM
                </span>
              </Link>
              <div className="mt-3 px-1 text-xs font-bold tracking-wide text-[#d35400]">
                {s.baseKey} · L{s.level}
              </div>
              <h3 className="mb-0.5 mt-0.5 px-1 text-base font-bold leading-snug text-[#1c1c1c]">
                <Link href={editHref} className="text-inherit no-underline hover:underline">
                  {s.name}
                </Link>
              </h3>
              <p className="mb-0 mt-auto px-1 text-xs text-[#6b7280]">Updated {formatUpdated(s.updatedAt)}</p>
              <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1 pt-1">
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
                <DeleteButton id={s.id} name={s.name} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
