"use client";

import { MB_LIMITS } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mbFetch } from "./mb-fetch";

type Props = {
  childId: string;
  childName: string;
  others: boolean;
  replies: boolean;
  /** Another parent is linked (the "include other parents" toggle matters). */
  hasOthers: boolean;
  dedication: string;
  dedicationBy: string;
  defaultBy: string;
};

/** Screen-only bar above the booklet: what to include, the cover dedication, and Print. */
export function PdfSettingsBar({ childId, childName, others, replies, hasOthers, dedication, dedicationBy, defaultBy }: Props) {
  const router = useRouter();
  const [text, setText] = useState(dedication);
  const [by, setBy] = useState(dedicationBy || defaultBy);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const go = (next: { others?: boolean; replies?: boolean }) => {
    const q = new URLSearchParams();
    if (!(next.others ?? others)) q.set("others", "0");
    if (!(next.replies ?? replies)) q.set("replies", "0");
    const qs = q.toString();
    router.replace(`/print/moms-bible/${encodeURIComponent(childId)}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  async function saveDedication() {
    setBusy(true);
    setMsg(null);
    const res = await mbFetch("/api/moms-bible/book", "PUT", { childId, dedication: text, dedicationBy: by });
    setBusy(false);
    if (!res.ok) return setMsg(res.error);
    setMsg("Saved");
    router.refresh();
  }

  return (
    <div className="mbp-bar">
      <div className="mbp-bar__row">
        <Link href="/bible/old-testament" className="mbp-bar__back">
          ← Back to the Bible
        </Link>
        <button type="button" className="mbp-btn" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
      </div>
      <div className="mbp-bar__row mbp-bar__toggles">
        {hasOthers && (
          <label>
            <input type="checkbox" checked={others} onChange={(e) => go({ others: e.target.checked })} /> Include the other
            parents&apos; notes
          </label>
        )}
        <label>
          <input type="checkbox" checked={replies} onChange={(e) => go({ replies: e.target.checked })} /> Include{" "}
          {childName}&apos;s replies
        </label>
      </div>
      <div className="mbp-bar__dedication">
        <label>
          <span>Dedication on the cover</span>
          <textarea
            value={text}
            maxLength={MB_LIMITS.dedication}
            rows={3}
            placeholder={`To my dear ${childName}, …`}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="mbp-bar__row">
          <label className="mbp-bar__by">
            <span>Signed</span>
            <input value={by} maxLength={60} onChange={(e) => setBy(e.target.value)} />
          </label>
          <button type="button" className="mbp-btn mbp-btn--ghost" disabled={busy} onClick={() => void saveDedication()}>
            {busy ? "Saving…" : "Save dedication"}
          </button>
          {msg && <span className="mbp-bar__msg">{msg}</span>}
        </div>
      </div>
      <p className="mbp-bar__hint">Choose “Save as PDF” in the print dialog. This bar is not printed.</p>
    </div>
  );
}
