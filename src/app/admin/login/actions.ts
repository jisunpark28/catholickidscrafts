"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
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
      redirect("/admin/login?error=CredentialsSignin");
    }
    console.error("loginAction", error);
    redirect("/admin/login?error=Configuration");
  }
}
