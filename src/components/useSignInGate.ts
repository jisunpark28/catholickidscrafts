"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import { signInPath } from "@/lib/sign-in-callback";
import { useCallback } from "react";

/** True when Print/Download may go ahead in the browser (the server re-checks every request). */
export function signInGateAllows(state: { ready: boolean; signedIn: boolean }): boolean {
  // Unknown yet counts as signed out: the sign-in page sends an already signed-in parent straight back.
  return state.ready && state.signedIn;
}

/**
 * Print / Download buttons: signed-out visitors go to the family sign-in page and return to
 * this same page (path + query) afterwards. Returns true when the action may continue.
 */
export function useSignInGate(): (event?: { preventDefault(): void }) => boolean {
  const { ready, session } = useSiteSession();
  const signedIn = Boolean(session.family);
  return useCallback(
    (event) => {
      if (signInGateAllows({ ready, signedIn })) return true;
      event?.preventDefault();
      window.location.assign(signInPath(`${window.location.pathname}${window.location.search}`));
      return false;
    },
    [ready, signedIn],
  );
}
