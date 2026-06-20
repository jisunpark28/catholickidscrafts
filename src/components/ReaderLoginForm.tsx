"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReaderLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reader/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessId: form.get("accessId") }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Access ID not recognized");
      return;
    }
    router.push("/bible/genesis");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md border border-[var(--color-border)] bg-white p-8">
      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <label className="block text-sm font-semibold">
        Access ID
        <input
          name="accessId"
          type="text"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="CKC-XXXX-XXXX"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-mono text-lg font-normal uppercase tracking-wide"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-[var(--color-accent)] py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
