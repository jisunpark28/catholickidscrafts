"use client";

import {
  packDownloadPath,
  packSheetPrintUrlsForScope,
  type AdventPackDownloadScope,
} from "@/lib/advent-complete-2026";
import { useState } from "react";

const btn =
  "inline-flex items-center justify-center rounded-full bg-[#d35400] px-4 py-2 text-xs font-extrabold text-white no-underline transition hover:bg-[#b8470a] disabled:opacity-60 sm:text-sm";

/**
 * Plus Download all: ZIP of activity PDFs (API) + opens Gospel sheet print tabs.
 * Sheets are HTML print routes, not files in the ZIP.
 */
export function PackDownloadAll({
  scope,
  label = "Download all",
}: {
  scope: AdventPackDownloadScope;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(packDownloadPath(scope), { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(
          body?.error ??
            (res.status === 401
              ? "Please sign in."
              : res.status === 402
                ? "Plus members only."
                : "Download failed."),
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        scope === "all"
          ? "catholickidscrafts-advent-complete-2026.zip"
          : `catholickidscrafts-advent-complete-2026-${scope}.zip`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      // Week scope only: open that week's Gospel print tabs (HTML → Save as PDF).
      // Full-pack scope skips this so we don't open ten windows at once.
      if (scope !== "all") {
        for (const href of packSheetPrintUrlsForScope(scope)) {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button type="button" className={btn} disabled={busy} onClick={() => void run()} aria-label={`${label} · 전체 다운로드`}>
        {busy ? "Preparing…" : label}
      </button>
      {msg ? (
        <span role="alert" className="text-xs text-[#b42318]">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
