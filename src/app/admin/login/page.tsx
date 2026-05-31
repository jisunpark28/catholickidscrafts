"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const configError = searchParams.get("error") === "Configuration";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(
        result.code === "CredentialsSignin"
          ? "Invalid email or password."
          : "Sign-in failed. Check AUTH_SECRET on the server and try again.",
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md border border-[var(--color-border)] bg-white p-8"
    >
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Operator login</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Manage Curriculum and Kids Resources. Daily Mass readings are loaded automatically.
      </p>
      {configError && (
        <p className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Server misconfiguration: set AUTH_SECRET in Vercel Environment Variables, then redeploy.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="mt-6 block text-sm font-semibold">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
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

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
