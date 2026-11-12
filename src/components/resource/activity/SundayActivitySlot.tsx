"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import {
  ACTIVITY_VARIANT_LABELS,
  ACTIVITY_VARIANTS,
  activityPath,
  type ActivityVariant,
  type ResourceActivity,
} from "@/lib/resource/activities";
import { saveActivityPdf } from "@/lib/resource/activity-download-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlusLockButton } from "../PlusLockDialog";

type Props = {
  label: string;
  activity: Pick<ResourceActivity, "slug" | "title" | "kind" | "previews" | "access">;
  /** e.g. "Coloring sheet · Today · Nov 13" */
  meta: string;
  note?: string;
  moreHref?: string;
  moreLabel?: string;
  primaryCls: string;
  ghostCls: string;
};

const colBox = "flex min-w-0 flex-col rounded-2xl border border-[#e8e0d6] bg-white p-4";
const colLabel = "m-0 text-[11px] font-bold uppercase tracking-wide text-[#d35400]";

/**
 * This Sunday "Activities" / "Crafts" column: preview, B&W or colour, and the download action.
 * Free sheets download when signed in; Plus sheets (the craft) show the Plus lock unless the
 * family has Plus. The download API checks the session (and Plus) itself on every request;
 * the session flags here only choose which button to show.
 */
export function SundayActivitySlot({ label, activity, meta, note, moreHref, moreLabel, primaryCls, ghostCls }: Props) {
  const { ready, session } = useSiteSession();
  const [variant, setVariant] = useState<ActivityVariant>("color");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const family = session.family;
  const signedIn = Boolean(family && !family.childMode);
  const isPlus = Boolean(family?.isPlus && !family.childMode);
  const plusOnly = activity.access === "plus";
  const href = activityPath(activity.slug);

  const download = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await saveActivityPdf(activity.slug, variant);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not get this sheet right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={colBox} aria-label={label}>
      <div className="flex items-start justify-between gap-2">
        <p className={colLabel}>{label}</p>
        {plusOnly ? (
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
        ) : (
          <span className="rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">FREE</span>
        )}
      </div>
      <h3 className="m-0 mt-0.5 text-base font-bold text-[#1c1c1c]">
        <Link href={href} className="text-inherit no-underline hover:underline">
          {activity.title}
        </Link>
      </h3>
      <p className="m-0 text-xs text-[#6b7280]">{meta}</p>
      <Link href={href} className="mt-3 block overflow-hidden rounded-xl border border-[#eee8e1] bg-white" tabIndex={-1}>
        <Image
          key={variant}
          src={activity.previews[variant]}
          alt={`${activity.title} preview (${ACTIVITY_VARIANT_LABELS[variant].toLowerCase()})`}
          width={600}
          height={776}
          sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 90vw"
          className="mx-auto block h-auto max-h-[300px] w-auto"
        />
      </Link>
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Version">
        {ACTIVITY_VARIANTS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={variant === v}
            onClick={() => setVariant(v)}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
              variant === v ? "border-[#d35400] bg-[#fff6ef] text-[#b8470a]" : "border-[#e7e3de] bg-white text-[#4b5563] hover:bg-[#fffdfb]"
            }`}
          >
            {ACTIVITY_VARIANT_LABELS[v]}
          </button>
        ))}
      </div>
      {note ? <p className="m-0 mt-2 text-xs italic text-[#4b5563]">{note}</p> : null}
      {moreHref ? (
        <p className="m-0 mt-1 text-xs">
          <Link href={moreHref} className="text-[#d35400] no-underline hover:underline">
            {moreLabel ?? "More"}
          </Link>
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        {!ready ? (
          <span className="h-[38px] w-28 animate-pulse rounded-full bg-[#f3f1ee]" aria-hidden />
        ) : signedIn && (!plusOnly || isPlus) ? (
          <button type="button" className={primaryCls} onClick={() => void download()} disabled={busy}>
            {busy ? "Getting PDF…" : "⬇ Download"}
          </button>
        ) : signedIn ? (
          <PlusLockButton
            className={`${primaryCls} cursor-pointer`}
            message={`This ${activity.kind.toLowerCase()} is for Plus members. The weekly sheet, card and daily activity sheets stay free.`}
          >
            🔒 Download
          </PlusLockButton>
        ) : (
          <Link href={href} className={primaryCls}>
            {plusOnly ? "🔒 Sign in · Plus" : "Sign in"}
          </Link>
        )}
        <Link href={href} className={ghostCls}>
          Open
        </Link>
      </div>
      {msg ? (
        <p role="alert" className="m-0 mt-2 text-xs text-[#b42318]">
          {msg}
        </p>
      ) : null}
    </article>
  );
}
