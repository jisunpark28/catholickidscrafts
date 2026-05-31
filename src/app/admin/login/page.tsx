import { loginAction } from "@/app/admin/login/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
};

function errorMessage(code: string | undefined): string | null {
  if (code === "CredentialsSignin") {
    return "Invalid email or password. Use the same ADMIN_EMAIL and ADMIN_PASSWORD from your .env when you ran npm run db:seed.";
  }
  if (code === "Configuration") {
    return "Server misconfiguration: set AUTH_SECRET (and AUTH_URL=https://www.catholickidscrafts.com) in Vercel, then redeploy.";
  }
  return null;
}

async function LoginPanel({ searchParams }: PageProps) {
  const params = await searchParams;
  const message = errorMessage(params.error);
  const callbackUrl = params.callbackUrl ?? "/admin";

  return (
    <form
      action={loginAction}
      className="w-full max-w-md border border-[var(--color-border)] bg-white p-8"
    >
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Operator login</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Manage Curriculum and Kids Resources. Daily Mass readings are loaded automatically.
      </p>

      {message && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}

      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="mt-6 block text-sm font-semibold">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="mt-6 w-full bg-[var(--color-accent)] py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
      >
        Sign in
      </button>
    </form>
  );
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading…</p>}>
        <LoginPanel searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
