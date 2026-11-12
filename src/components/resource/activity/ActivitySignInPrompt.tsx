"use client";

import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";
import Link from "next/link";

/** Free-with-sign-in prompt (same Google family sign-in as /account/login). */
export function ActivitySignInPrompt({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-5 text-center">
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-[#1e7b34]">Free with a family account</p>
      <h2 className="mb-1 mt-1.5 text-lg font-bold text-[#1c1c1c]">{title}</h2>
      <p className="mx-auto mb-4 mt-0 max-w-sm text-sm leading-relaxed text-[#4b5563]">{body}</p>
      <div className="mx-auto max-w-xs">
        <GoogleFamilySignIn from="login" showDivider={false} buttonClassName="min-h-[46px]" />
      </div>
      <p className="mb-0 mt-3 text-xs text-[#6b7280]">
        New families are created automatically the first time you sign in.{" "}
        <Link href="/account/login" className="font-semibold text-[#d35400] no-underline hover:underline">
          Other ways to sign in
        </Link>
      </p>
    </div>
  );
}
