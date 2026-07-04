"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  kitId: string;
  shareSlug: string;
  signedIn: boolean;
  className?: string;
};

export function CommunityForkButton({
  kitId,
  shareSlug,
  signedIn,
  className = "lesson-big-button flex-1",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const duplicateKit = async () => {
    const returnPath = `/program/community/${shareSlug}`;
    if (!signedIn) {
      router.push(`/account/login?next=${encodeURIComponent(returnPath)}`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/program/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: kitId }),
      });
      const json = (await res.json()) as { kit?: { id: string } };
      if (json.kit) {
        router.push(`/program/kit/${json.kit.id}`);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void duplicateKit()}
      className={className}
    >
      {pending ? "Copying…" : "Use this"}
    </button>
  );
}
