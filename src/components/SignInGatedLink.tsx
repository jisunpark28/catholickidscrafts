"use client";

import type { AnchorHTMLAttributes } from "react";
import { useSignInGate } from "./useSignInGate";

/** Plain <a> for Print / Download links: signed out, a click goes to sign-in and back here. */
export function SignInGatedLink({ onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const gate = useSignInGate();
  return (
    <a
      {...props}
      onClick={(e) => {
        if (!gate(e)) return;
        onClick?.(e);
      }}
    />
  );
}
