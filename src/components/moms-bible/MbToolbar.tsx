"use client";

import { MB_CHILD_COOKIE } from "@/lib/moms-bible/constants";
import type { MbToolbarData } from "@/lib/moms-bible/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusModal } from "./PlusModal";
import { SeedsBadge } from "./SeedsBadge";
import "@/styles/moms-bible.css";

/**
 * Header row (mockups 1–3): "👧 Viewing Mia's Bible ▾ | Leo" + "📖 Print Mia's Bible PDF" for a
 * parent, "🧒 Hi, Mia! (kid code)" for a child, "⭐ Get Plus" for guests.
 * Switching child stores the id in a cookie (re-checked on the server) and reloads server data.
 */
export function MbToolbar({ data, variant = "full" }: { data: MbToolbarData | null; variant?: "full" | "for" }) {
  const router = useRouter();
  const [plusOpen, setPlusOpen] = useState(false);

  if (!data) {
    return (
      <div className="mb-toolbar">
        <button type="button" className="mb-pill" onClick={() => setPlusOpen(true)}>
          <span aria-hidden>⭐</span> Get Plus
        </button>
        <PlusModal open={plusOpen} onClose={() => setPlusOpen(false)} />
      </div>
    );
  }

  if (data.viewer === "child") {
    return (
      <div className="mb-toolbar">
        <span className="mb-pill">
          <span aria-hidden>🧒</span> Hi, {data.childName}!
          {data.kidCode && <span className="mb-pill__muted">({data.kidCode})</span>}
        </span>
        <SeedsBadge seeds={data.seeds} />
      </div>
    );
  }

  const pick = (childId: string) => {
    document.cookie = `${MB_CHILD_COOKIE}=${encodeURIComponent(childId)}; path=/; max-age=31536000; samesite=lax`;
    const url = new URL(window.location.href);
    if (url.searchParams.has("child")) {
      // ?child= would win over the cookie; drop it so the new choice sticks.
      url.searchParams.delete("child");
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
    router.refresh();
  };
  const others = data.children.filter((c) => c.id !== data.childId);

  return (
    <div className="mb-toolbar">
      <span className="mb-pill">
        <span aria-hidden>👧</span>
        {data.children.length > 1 ? (
          <label>
            <span className="sr-only">Whose Bible</span>
            <select value={data.childId} onChange={(e) => pick(e.target.value)}>
              {data.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {variant === "for" ? `For ${c.displayName} ▾` : `Viewing ${c.displayName}'s Bible ▾`}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span>{variant === "for" ? `For ${data.childName}` : `Viewing ${data.childName}'s Bible`}</span>
        )}
        {variant === "full" && others.slice(0, 3).map((c) => (
          <button key={c.id} type="button" className="mb-pill__sib" onClick={() => pick(c.id)} title={`Switch to ${c.displayName}'s Bible`}>
            | {c.displayName}
          </button>
        ))}
      </span>
      {variant === "for" ? null : data.canPrint ? (
        <Link href={`/print/moms-bible/${encodeURIComponent(data.childId)}`} className="mb-btn-outline" prefetch={false}>
          <span aria-hidden>📖</span> Print {data.childName}&apos;s Bible PDF
        </Link>
      ) : (
        <button type="button" className="mb-btn-outline" onClick={() => setPlusOpen(true)}>
          <span aria-hidden>📖</span> Print {data.childName}&apos;s Bible PDF
        </button>
      )}
      <PlusModal open={plusOpen} onClose={() => setPlusOpen(false)} />
    </div>
  );
}
