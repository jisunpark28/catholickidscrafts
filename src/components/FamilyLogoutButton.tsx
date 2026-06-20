"use client";

import { useRouter } from "next/navigation";

export function FamilyLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/family/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
    >
      Sign out
    </button>
  );
}
