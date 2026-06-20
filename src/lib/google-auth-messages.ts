export function googleAuthErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "google_denied":
      return "Google sign-in was canceled.";
    case "google_email_conflict":
      return "This email is already linked to a different Google account.";
    case "google_email_exists":
      return "An account with this email already exists. Sign in with email and password, then link Google from your account.";
    case "google_db":
      return "Could not save your account to the database. Run npx prisma migrate deploy, then try again.";
    case "google_session":
      return "Account was created but sign-in could not finish. Check AUTH_SECRET in .env, restart pnpm dev, and try Google sign-in again.";
    case "google_state":
      return "Sign-in expired. Please try again.";
    case "google_profile":
    case "google_account":
    case "google_missing":
      return "Google sign-in failed. Please try again or use email and password.";
    default:
      return null;
  }
}
