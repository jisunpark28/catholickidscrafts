"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteLiturgyCardButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onClick() {
    if (!confirm("Delete this liturgy card?")) return;
    setError("");
    const res = await fetch(`/api/admin/liturgy-cards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" onClick={() => void onClick()} className="font-semibold text-red-700">
        Delete
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
