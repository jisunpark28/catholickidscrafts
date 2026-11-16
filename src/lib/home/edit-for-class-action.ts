/**
 * Homepage "Edit it for your class" click: signed out → sign-in guide, signed-in free →
 * subscribe guide, Plus → sheet Edit (same path Customize / resource Edit uses).
 * Display-only decision; the edit page and APIs still enforce session + Plus.
 */
export type EditForClassDecision =
  | { kind: "signin" }
  | { kind: "subscribe" }
  | { kind: "edit"; href: string };

export function decideEditForClass(args: {
  sessionReady: boolean;
  signedIn: boolean;
  isPlus: boolean;
  editHref: string | null;
}): EditForClassDecision {
  // Unknown session counts as signed out (same rule as useSignInGate / Print).
  if (!args.sessionReady || !args.signedIn) return { kind: "signin" };
  if (!args.isPlus) return { kind: "subscribe" };
  return { kind: "edit", href: args.editHref ?? "/resource" };
}
