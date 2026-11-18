"use client";

import { saveActivityPdf } from "@/lib/resource/activity-download-client";
import type { ActivityVariant } from "@/lib/resource/activities";
import { useState } from "react";

const btn =
  "inline-flex items-center justify-center rounded-full border border-[#eadccd] bg-white px-3 py-1.5 text-xs font-bold text-[#1f2937] no-underline transition hover:bg-[#fff6ef] disabled:opacity-60";

/** Compact BW / Colour download for Plus pack week cards. API enforces access. */
export function PackActivityDownloads({ slug }: { slug: string }) {
  const [busy, setBusy] = useState<ActivityVariant | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async (variant: ActivityVariant) => {
    setBusy(variant);
    setMsg(null);
    try {
      await saveActivityPdf(slug, variant);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" className={btn} disabled={busy !== null} onClick={() => void run("bw")}>
        {busy === "bw" ? "…" : "BW"}
      </button>
      <button type="button" className={btn} disabled={busy !== null} onClick={() => void run("color")}>
        {busy === "color" ? "…" : "Colour"}
      </button>
      {msg ? (
        <span role="alert" className="text-xs text-[#b42318]">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
