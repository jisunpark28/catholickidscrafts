"use client";

import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  redirectTo?: string;
  googleEnabled?: boolean;
};

export function FamilySignupForm({ redirectTo = "/account", googleEnabled = false }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    let res: Response;
    try {
      res = await fetch("/api/auth/family/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          displayName: form.get("displayName"),
        }),
      });
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
      return;
    }
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not create account. Please try again.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md border border-[var(--color-border)] bg-white p-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Create family account</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Parents manage reader profiles and Access IDs for children (no email required for readers).
      </p>

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6">
        <GoogleFamilySignIn enabled={googleEnabled} from="signup" />
      </div>

      <form onSubmit={onSubmit}>
        <label className="mt-2 block text-sm font-semibold">
          Your name (optional)
          <input
            name="displayName"
            type="text"
            autoComplete="name"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal"
            placeholder="e.g. Maria"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
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
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-[var(--color-accent)] py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up with email"}
        </button>
      </form>
    </div>
  );
}
