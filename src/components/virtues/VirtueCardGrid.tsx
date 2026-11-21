"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSession } from "@/components/SiteSessionProvider";
import { LearnGateDialog } from "@/components/learn/LearnGateDialog";
import { isHeaderSignedIn } from "@/lib/header-session";
import { cardThumbSrc } from "@/lib/resource/card-meta";
import { signInPath } from "@/lib/sign-in-callback";
import type { VirtueBundle } from "@/data/virtues/courage";

function firstSlideSrc(virtue: VirtueBundle): string {
  const cardId = virtue.stories.find((story) => story.cardId)?.cardId;
  return cardId ? cardThumbSrc(cardId) : virtue.cover;
}

/** Virtue tiles. Signed-out visitors get a preview; signed-in visitors open the carousel. */
export function VirtueCardGrid({ virtues }: { virtues: readonly VirtueBundle[] }) {
  const { ready, session } = useSiteSession();
  const signedIn = ready && isHeaderSignedIn(session);
  const [gate, setGate] = useState<VirtueBundle | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !pending) return;
    const virtue = virtues.find((item) => item.slug === pending) ?? null;
    setPending(null);
    if (!virtue) return;
    if (signedIn) window.location.assign(`/virtues/${virtue.slug}`);
    else setGate(virtue);
  }, [pending, ready, signedIn, virtues]);

  return (
    <>
      <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {virtues.map((virtue) => (
          <li key={virtue.slug}>
            <Link
              href={`/virtues/${virtue.slug}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0d9b8] bg-white no-underline shadow-[0_1px_3px_rgba(28,28,28,0.04)] hover:border-[#c9773a]"
              onClick={(event) => {
                if (signedIn) return;
                event.preventDefault();
                if (!ready) setPending(virtue.slug);
                else setGate(virtue);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={virtue.cover} alt={virtue.coverAlt} width={768} height={1024} className="block aspect-[4/5] h-auto w-full object-cover" />
              <span className="px-4 py-3">
                <span className="block font-[Georgia,serif] text-xl font-bold text-[#1f2937]">{virtue.name}</span>
                <span className="mt-1 block text-sm font-semibold text-[#335599]">Open {virtue.name} →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {gate ? (
        <LearnGateDialog
          title={gate.name}
          message="Sign up to learn this virtue."
          imageSrc={firstSlideSrc(gate)}
          imageAlt={gate.stories[0]?.title ?? gate.coverAlt}
          imageFit="contain"
          signInHref={signInPath(`/virtues/${gate.slug}`)}
          onClose={() => setGate(null)}
        />
      ) : null}
    </>
  );
}
