export function googleAuthErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "google_denied":
      return "Google sign-in was canceled.";
    case "google_email_conflict":
      return "This email is already linked to a different Google account.";
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
