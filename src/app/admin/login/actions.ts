"use server";

import { signIn } from "@/auth";
import { getAdminLoginThrottle } from "@/lib/admin-login-throttle";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("NEXT_REDIRECT") || error.name === "RedirectError")
  );
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const callbackUrl =
    (formData.get("callbackUrl") as string | null)?.trim() || "/admin";

  if (!email || !password) {
    redirect("/admin/login?error=CredentialsSignin");
  }

  const ip = clientIpFromHeaders(await headers());
  if (getAdminLoginThrottle(ip, email).blocked) {
    redirect("/admin/login?error=TooManyAttempts");
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    redirect("/admin/login?error=Configuration");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/admin",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      if (getAdminLoginThrottle(ip, email).blocked) {
        redirect("/admin/login?error=TooManyAttempts");
      }
      redirect("/admin/login?error=CredentialsSignin");
    }
    console.error("loginAction", error);
    redirect("/admin/login?error=Configuration");
  }
}
