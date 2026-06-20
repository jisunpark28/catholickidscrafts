import { Prisma } from "@prisma/client";

export function familyAuthErrorResponse(
  e: unknown,
  fallback: string,
): { message: string; status: number } {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return { message: "An account with this email already exists", status: 409 };
    }
    if (e.code === "P2021" || e.code === "P2022") {
      return {
        message:
          "Account sign-up is temporarily unavailable. Please try again in a few minutes.",
        status: 503,
      };
    }
  }

  if (e instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: "Account sign-up is temporarily unavailable. Please try again in a few minutes.",
      status: 503,
    };
  }

  if (e instanceof Error) {
    if (e.message.includes("AUTH_SECRET")) {
      return {
        message: "Account sign-up is temporarily unavailable. Please try again in a few minutes.",
        status: 503,
      };
    }
    if (e.message.includes("DATABASE_URL") || e.message.includes("Can't reach database")) {
      return {
        message: "Account sign-up is temporarily unavailable. Please try again in a few minutes.",
        status: 503,
      };
    }
    if (
      e.message.includes("does not exist") ||
      e.message.includes("FamilyAccount") ||
      e.message.includes("column")
    ) {
      return {
        message:
          "Account sign-up is temporarily unavailable. Please try again in a few minutes.",
        status: 503,
      };
    }
  }

  return { message: fallback, status: 500 };
}

export function googleAccountFailureReason(e: unknown): string {
  if (e instanceof Error && e.message === "EMAIL_LINKED_OTHER_GOOGLE") {
    return "google_email_conflict";
  }
  const mapped = familyAuthErrorResponse(e, "");
  if (mapped.status === 503) return "google_db";
  if (mapped.status === 409) return "google_email_exists";
  return "google_account";
}

export function assertFamilyAuthConfigured(): void {
  if (!process.env.AUTH_SECRET?.trim()) {
    throw new Error("AUTH_SECRET is required for family sessions");
  }
}
