"use client";

import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";

type Props = {
  /** Kept for API compatibility; Google sign-in redirects to /account. */
  redirectTo?: string;
};

export function FamilyLoginForm(props: Props) {
  void props;
  return (
    <div className="w-full max-w-md border border-[var(--color-border)] bg-white p-8">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">Parent sign-in</h2>
      <div className="mt-6">
        <GoogleFamilySignIn from="login" />
      </div>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Parent accounts use Google sign-in. If you used an email and password before,
        continue with Google using the same email - your family profiles and progress stay.
      </p>
    </div>
  );
}
