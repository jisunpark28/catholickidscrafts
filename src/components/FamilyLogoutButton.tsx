"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  /** "both" (default) shows both buttons; "signout" or "all" shows just one. */
  mode?: "both" | "signout" | "all";
};

export function FamilyLogoutButton({ mode = "both" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    await fetch("/api/auth/family/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function logoutEverywhere() {
    if (
      !window.confirm(
        "Sign out on every device? Children's Access ID sign-ins will also be signed out.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/auth/family/logout-all", { method: "POST" });
    } finally {
      setBusy(false);
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {mode !== "all" && (
        <button
          type="button"
          onClick={() => void logout()}
          className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
        >
          Sign out
        </button>
      )}
      {mode !== "signout" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void logoutEverywhere()}
          className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:border-[var(--color-accent)] disabled:opacity-60"
        >
          Sign out of all devices
        </button>
      )}
    </div>
  );
}
