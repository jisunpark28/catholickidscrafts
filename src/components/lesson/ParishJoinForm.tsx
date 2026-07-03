"use client";

import { LessonBigButton } from "@/components/lesson/LessonUi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ParishJoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/program/parish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not join");
      }
      router.push("/program");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="max-w-md space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Invite code</span>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-3 text-lg font-bold tracking-widest"
          placeholder="ABC123"
          autoComplete="off"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <LessonBigButton type="submit" disabled={pending || !code.trim()}>
        {pending ? "Joining…" : "Join"}
      </LessonBigButton>
    </form>
  );
}
