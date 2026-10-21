"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function send(url: string, method: string, body?: unknown): Promise<string | null> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return typeof data.error === "string" ? data.error : "Request failed";
}

type RowProps = {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  first: boolean;
  last: boolean;
  canReorder: boolean;
};

export function LiturgyQaRowActions({ id, status, first, last, canReorder }: RowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(url: string, method: string, body?: unknown) {
    setBusy(true);
    setError("");
    const message = await send(url, method, body);
    setBusy(false);
    if (message) setError(message);
    else router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex flex-wrap justify-end gap-3 font-semibold">
        {canReorder && (
          <>
            <button type="button" disabled={busy || first} aria-label="Move up" className="disabled:opacity-30"
              onClick={() => void run(`/api/admin/liturgy-qa/cards/${id}/move`, "POST", { direction: "up" })}>↑</button>
            <button type="button" disabled={busy || last} aria-label="Move down" className="disabled:opacity-30"
              onClick={() => void run(`/api/admin/liturgy-qa/cards/${id}/move`, "POST", { direction: "down" })}>↓</button>
          </>
        )}
        <button type="button" disabled={busy} className="text-[var(--color-link)]"
          onClick={() => void run(`/api/admin/liturgy-qa/cards/${id}`, "PATCH", { status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })}>
          {status === "PUBLISHED" ? "Unpublish" : "Publish"}
        </button>
        <a href={`/admin/liturgy-qa/${id}/edit`} className="text-[var(--color-link)]">Edit</a>
        <button type="button" disabled={busy} className="text-red-700"
          onClick={() => { if (confirm("Delete this card?")) void run(`/api/admin/liturgy-qa/cards/${id}`, "DELETE"); }}>
          Delete
        </button>
      </span>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}

export function LiturgyQaBulkStatus({ topic }: { topic: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function setAll(status: "DRAFT" | "PUBLISHED") {
    const verb = status === "PUBLISHED" ? "Publish" : "Unpublish";
    if (!confirm(`${verb} every card in this topic?`)) return;
    setBusy(true);
    setError("");
    const message = await send(`/api/admin/liturgy-qa/topics/${topic}/status`, "POST", { status });
    setBusy(false);
    if (message) setError(message);
    else router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={busy} onClick={() => void setAll("PUBLISHED")}
        className="border border-green-700 px-3 py-1 text-xs font-bold text-green-800">Publish all</button>
      <button type="button" disabled={busy} onClick={() => void setAll("DRAFT")}
        className="border border-[var(--color-border)] px-3 py-1 text-xs font-bold">Unpublish all</button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
