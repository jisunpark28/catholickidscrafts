"use client";

import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";
import Link from "next/link";

type Props = {
  /** Kept for API compatibility; Google sign-in redirects to /account. */
  redirectTo?: string;
  /** Google sign-in error to show inside the card. */
  error?: string | null;
};

export function FamilyLoginForm({ error }: Props) {
  return (
    <div className="w-full rounded-2xl border border-[#efe6da] bg-white px-6 py-8 text-center shadow-[0_12px_32px_rgba(120,84,48,0.12)] sm:px-8">
      <span
        aria-hidden
        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe6]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e07b39" strokeWidth="2.6" strokeLinecap="round">
          <path d="M12 3v18M6 9h12" />
        </svg>
      </span>
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-ink)]">Family account</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">
        Sign in to save progress, stickers and memos for your family.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6">
        <GoogleFamilySignIn from="login" showDivider={false} buttonClassName="min-h-[48px] text-[15px]" />
      </div>
      <p className="mt-3 text-[13px] text-[var(--color-muted)]">
        New families are created automatically the first time you sign in.
      </p>

      <div className="my-6 h-px bg-[#efe6da]" />

      <p className="text-[14px] text-[var(--color-ink)]">
        <span aria-hidden>👧 </span>Kids reading on their own? Use your Access ID
      </p>
      <Link
        href="/reader/login"
        className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg border-2 border-[#e07b39] bg-white text-[15px] font-semibold text-[#c4621f] no-underline transition hover:bg-[#fdf3ea]"
      >
        Reader sign-in
      </Link>
    </div>
  );
}
