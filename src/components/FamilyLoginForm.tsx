"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { redirectTo?: string };

export function FamilyLoginForm({ redirectTo = "/account" }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/family/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Sign-in failed");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md border border-[var(--color-border)] bg-white p-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Parent sign-in</h2>
      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <label className="mt-6 block text-sm font-semibold">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal"
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
