"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  imageUrl: string;
  authorName: string;
  caption: string | null;
  resourceTitle: string | null;
};

type Props = {
  pending: Row[];
};

export function GalleryModerationPanel({ pending }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function moderate(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0) {
    return (
      <p className="mt-6 rounded-2xl bg-white p-8 text-center text-[var(--color-muted)] shadow-sm">
        No submissions waiting for review.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pending.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[var(--color-border)]/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
          <div className="space-y-3 p-4">
            <p className="font-semibold text-[var(--color-ink)]">Made by {item.authorName}</p>
            {item.caption ? (
              <p className="text-sm text-[var(--color-muted)]">{item.caption}</p>
            ) : null}
            {item.resourceTitle ? (
              <p className="text-xs font-semibold text-[var(--color-muted)]">
                Craft: {item.resourceTitle}
              </p>
            ) : null}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void moderate(item.id, "approve")}
                className="flex-1 rounded-full bg-[var(--color-accent)] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void moderate(item.id, "reject")}
                className="flex-1 rounded-full bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-muted)] hover:bg-[var(--color-border)]/40 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
