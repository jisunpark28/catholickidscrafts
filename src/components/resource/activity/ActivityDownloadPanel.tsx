"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import {
  ACTIVITY_VARIANT_LABELS,
  ACTIVITY_VARIANTS,
  activityEditPath,
  activityPath,
  type ActivityVariant,
  type ResourceActivity,
} from "@/lib/resource/activities";
import { saveActivityPdf } from "@/lib/resource/activity-download-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlusLockButton } from "../PlusLockDialog";
import { ActivitySignInPrompt } from "./ActivitySignInPrompt";

type Props = {
  activity: Pick<ResourceActivity, "slug" | "title" | "kind" | "previews" | "pageSize" | "access" | "editable">;
};

const primary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[#b8470a] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const ghost =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e7e3de] bg-white px-5 py-2.5 text-sm font-semibold text-[#1c1c1c] no-underline transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

/**
 * Preview + B&W / colour choice + download. Free sheets: signed-in parents download (the API checks
 * the session on every request). Plus sheets (the craft): Plus members download, others see the
 * Plus lock. Signed-out visitors get the sign-in prompt. Plus members also get the editor.
 * Display only: the session flags here never unlock anything by themselves.
 */
export function ActivityDownloadPanel({ activity }: Props) {
  const { ready, session } = useSiteSession();
  const [variant, setVariant] = useState<ActivityVariant>("bw");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const family = session.family;
  const signedIn = Boolean(family && !family.childMode);
  const isPlus = Boolean(family?.isPlus && !family.childMode);
  const plusOnly = activity.access === "plus";
  const kindLabel = activity.kind.toLowerCase();

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
    <section aria-label="Download" className="mt-5 grid gap-6 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div>
        <div className="overflow-hidden rounded-2xl border border-[#e7e3de] bg-white p-2 shadow-[0_6px_20px_rgba(28,28,28,0.06)]">
          <Image
            key={variant}
            src={activity.previews[variant]}
            alt={`${activity.title} ${kindLabel} preview (${ACTIVITY_VARIANT_LABELS[variant].toLowerCase()})`}
            width={600}
            height={776}
            className="block h-auto w-full rounded-lg"
            priority
          />
        </div>
        <p className="m-0 mt-2 text-center text-xs text-[#6b7280]">Preview · {activity.pageSize} PDF</p>
      </div>

      <div className="min-w-0 space-y-5">
        <fieldset className="m-0 border-0 p-0">
          <legend className="text-sm font-bold text-[#1c1c1c]">Choose a version</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACTIVITY_VARIANTS.map((v) => (
              <label
                key={v}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  variant === v ? "border-[#d35400] bg-[#fff6ef] text-[#b8470a]" : "border-[#e7e3de] bg-white text-[#1c1c1c] hover:bg-[#fffdfb]"
                }`}
              >
                <input type="radio" name="activity-variant" value={v} checked={variant === v} onChange={() => setVariant(v)} className="sr-only" />
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-3.5 rounded-full border border-[#1c1c1c]/30"
                  style={{ background: v === "bw" ? "#ffffff" : "linear-gradient(135deg,#c7b3db 0 33%,#faedb8 33% 66%,#b8d9b3 66%)" }}
                />
                {ACTIVITY_VARIANT_LABELS[v]}
              </label>
            ))}
          </div>
          <p className="m-0 mt-2 text-xs text-[#6b7280]">
            {variant === "bw" ? "Line art for kids to colour in." : "Soft liturgical colours, ready to print."}
          </p>
        </fieldset>

        {!ready ? (
          <div className="h-[46px] w-56 animate-pulse rounded-full bg-[#f3f1ee]" aria-hidden />
        ) : signedIn && plusOnly && !isPlus ? (
          <div>
            <PlusLockButton
              className={`${primary} cursor-pointer`}
              message={`This ${kindLabel} is for Plus members. The weekly sheet, card and daily activity sheets stay free.`}
            >
              🔒 Download PDF ({ACTIVITY_VARIANT_LABELS[variant]})
            </PlusLockButton>
            <p className="m-0 mt-2 text-xs text-[#6b7280]">
              🔒 Plus members only ·{" "}
              <Link href="/subscribe" className="font-semibold text-[#d35400] hover:underline">
                Get Plus
              </Link>
            </p>
          </div>
        ) : signedIn ? (
          <div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} onClick={() => void download()} disabled={busy}>
                {busy ? "Getting PDF…" : `⬇ Download PDF (${ACTIVITY_VARIANT_LABELS[variant]})`}
              </button>
            </div>
            {msg ? (
              <p role="alert" className="m-0 mt-2 text-sm text-[#b42318]">
                {msg}
              </p>
            ) : (
              <p className="m-0 mt-2 text-xs text-[#6b7280]">
                {plusOnly ? "Included with Plus." : "Free for signed-in families."}
              </p>
            )}
          </div>
        ) : family?.childMode ? (
          <p className="m-0 rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#4b5563]">
            Grown-ups only: sign in with Google again to return to the parent account and download this sheet.
          </p>
        ) : (
          <ActivitySignInPrompt
            title="Sign in to download"
            kicker={plusOnly ? "Plus members" : undefined}
            body={
              plusOnly
                ? `This ${kindLabel} is for Plus members. Sign in with your family account first.`
                : `This ${kindLabel} is free. Sign in with your family account to download the PDF.`
            }
          />
        )}

        {activity.editable ? (
          <div className="rounded-2xl border border-[#e8e0d6] bg-white px-4 py-4">
            <h2 className="m-0 flex items-center gap-2 text-base font-bold text-[#1c1c1c]">
              Make it your own
              <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
            </h2>
            <p className="m-0 mt-1 text-sm leading-relaxed text-[#4b5563]">
              Change any word, line or dot on the page, move or resize the pictures, recolour anything, then print or
              download your own PDF.
            </p>
            <div className="mt-3">
              {!ready ? (
                <div className="h-[42px] w-44 animate-pulse rounded-full bg-[#f3f1ee]" aria-hidden />
              ) : isPlus ? (
                <Link href={activityEditPath(activity.slug)} className={primary}>
                  ✏️ Open the editor
                </Link>
              ) : (
                <>
                  <PlusLockButton
                    className={`${ghost} cursor-pointer text-[#6b7280]`}
                    message={
                      plusOnly
                        ? "Editing and downloading this craft are Plus features."
                        : "Editing this sheet is a Plus feature. Downloading it is free when you sign in."
                    }
                    {...(plusOnly
                      ? {}
                      : {
                          freeHref: signedIn ? activityPath(activity.slug) : "/account/login",
                          freeLabel: signedIn ? "Download the free sheet" : "Sign in to download free",
                        })}
                  >
                    🔒 Open the editor
                  </PlusLockButton>
                  <p className="m-0 mt-1.5 text-xs text-[#6b7280]">
                    🔒 Plus members only ·{" "}
                    <Link href="/subscribe" className="font-semibold text-[#d35400] hover:underline">
                      Get Plus
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
