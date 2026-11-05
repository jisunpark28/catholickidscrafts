/**
 * Shared copy for Kid Code + PIN sign-in (the site UI is English; keep all kid-login strings
 * here so the server and the picker say exactly the same thing).
 */
export const KID_LOGIN_GENERIC_ERROR =
  "That code or PIN didn't work. Wait a minute and try again, or ask a grown-up to check Account → Children.";

export const KID_LOGIN_TOO_MANY =
  "Too many tries from this device. Please wait a while and try again, or ask a grown-up.";

export const KID_LOGIN_RETIRED =
  "Access IDs no longer work. Sign in with your Kid Code and PIN at /kids.";

export const KID_LOGIN_LABELS = {
  title: "Who's reading?",
  subtitle: "Tap your name and type your 4-digit PIN.",
  addKid: "Add Kid",
  addKidTitle: "Add a kid to this device",
  kidCode: "Kid Code",
  kidCodePlaceholder: "lily",
  pin: "PIN",
  enterPin: "Type your PIN",
  signIn: "Sign in",
  signingIn: "Signing in…",
  back: "Back",
  editProfiles: "Edit profiles",
  doneEditing: "Done",
  remove: "Remove",
  removeConfirm: (name: string) => `Remove ${name} from this device? Their Bible and progress stay safe.`,
  noProfiles: "No kids on this device yet. Tap Add Kid and type your Kid Code and PIN.",
  parentHint:
    "Grown-ups: Kid Codes and PINs are in Account → Children. A child can't sign in until a parent sets a PIN.",
  editNeedsParent: "Only a signed-in parent can remove profiles from this device.",
} as const;
