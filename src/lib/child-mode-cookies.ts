import { DEVICE_LOCK_COOKIE } from "@/lib/family-session";
import type { NextResponse } from "next/server";

/**
 * Cookie clearing for child mode, kept free of DB imports so it can be unit tested.
 * Every clear uses the same name + path ("/") + host-only domain the cookie was set with,
 * otherwise the browser keeps the old cookie.
 */

/** Remove the "this device was handed to a child" marker (only after a proven grown-up sign-in). */
export function clearDeviceLockCookie(res: NextResponse): void {
  res.cookies.set(DEVICE_LOCK_COOKIE, "", { path: "/", maxAge: 0 });
}

// Sign-outs (parent, child, admin) use lib/session-reset.ts, which clears every session
// cookie including the device lock.
