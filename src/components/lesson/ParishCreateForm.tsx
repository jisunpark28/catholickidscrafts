"use client";

import { LessonBigButton } from "@/components/lesson/LessonUi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ParishCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/program/parish/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        parish?: { inviteCode: string };
      };
      if (!res.ok) {
        throw new Error(data.error === "already_member" ? "You already belong to a parish" : "Could not create");
      }
      setInviteCode(data.parish?.inviteCode ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create parish");
    } finally {
      setPending(false);
    }
  };

  if (inviteCode) {
    return (
      <div className="max-w-md space-y-3 rounded border border-[#e8e0d6] bg-[#fffaf5] p-5">
        <p className="font-bold text-[var(--color-ink)]">Parish created</p>
        <p className="text-sm text-[var(--color-muted)]">
          Share this invite code with catechists:
        </p>
        <p className="text-2xl font-bold tracking-widest text-[var(--color-ink)]">{inviteCode}</p>
        <LessonBigButton onClick={() => router.push("/program/parish")}>Open dashboard</LessonBigButton>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="max-w-md space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Parish or PSR name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-lg font-bold"
          placeholder="St. Mary's PSR"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <LessonBigButton type="submit" disabled={pending || !name.trim()}>
        {pending ? "Creating…" : "Create parish workspace"}
      </LessonBigButton>
    </form>
  );
}
