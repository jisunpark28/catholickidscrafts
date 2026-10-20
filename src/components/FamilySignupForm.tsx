"use client";

import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";

type Props = {
  /** Kept for API compatibility; Google sign-in redirects to /account. */
  redirectTo?: string;
};

export function FamilySignupForm(props: Props) {
  void props;
  return (
    <div className="w-full max-w-md border border-[var(--color-border)] bg-white p-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Create family account</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Parents manage reader profiles and Access IDs for children (no email required for readers).
      </p>
      <div className="mt-6">
        <GoogleFamilySignIn from="signup" />
      </div>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Family accounts are created with Google sign-in only.
      </p>
    </div>
  );
}
