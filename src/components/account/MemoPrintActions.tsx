"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Screen-only toolbar; opens the print dialog once on load (Save as PDF). */
export function MemoPrintActions() {
  useEffect(() => {
    const id = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div className="memo-print-actions mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm">
      <span>Choose “Save as PDF” in the print dialog.</span>
      <span className="flex gap-2">
        <Link href="/account/memos" className="rounded-full border border-[#d1d5db] bg-white px-4 py-1.5 font-semibold">
          ← My memos
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-[#d9580f] px-4 py-1.5 font-bold text-white hover:bg-[#c04d0c]"
        >
          Print / Save as PDF
        </button>
      </span>
    </div>
  );
}
