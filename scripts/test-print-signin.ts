/**
 * Print / Download need a family sign-in: safe callbackUrl handling, the OAuth state round trip,
 * the client gate decision, and the server gates on the print pages and the card download API.
 * Run: pnpm exec tsx scripts/test-print-signin.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createGoogleOAuthState, verifyGoogleOAuthState } from "../src/lib/google-oauth";
import { pathWithQuery, safeCallbackPath, signInPath } from "../src/lib/sign-in-callback";
import { signInGateAllows } from "../src/components/useSignInGate";

const root = join(__dirname, "..");
const src = (p: string) => readFileSync(join(root, p), "utf8");

// --- callbackUrl: same-site paths only -------------------------------------------------------
assert.equal(safeCallbackPath("/resource/a-ot34?level=2"), "/resource/a-ot34?level=2");
assert.equal(safeCallbackPath("/"), "/");
assert.equal(safeCallbackPath("/resource?view=cards&q=lamb#top"), "/resource?view=cards&q=lamb#top");
for (const bad of [
  "https://evil.example/x",
  "//evil.example/x",
  "/\\evil.example",
  "\\\\evil.example",
  "javascript:alert(1)",
  "resource/a-ot34",
  "/api/auth/family/google",
  "/account/login?callbackUrl=/x",
  "/account/signup",
  "/x\r\nSet-Cookie: a=b",
  "",
  "/" + "a".repeat(2000),
  undefined,
  42,
]) {
  assert.equal(safeCallbackPath(bad), null, `rejects ${String(bad).slice(0, 40)}`);
}
assert.equal(signInPath("/resource/a-ot34?level=2"), "/account/login?callbackUrl=%2Fresource%2Fa-ot34%3Flevel%3D2");
assert.equal(signInPath("https://evil.example"), "/account/login");
assert.equal(pathWithQuery("/print/resource/a-ot34", { level: "2", autoprint: "1" }), "/print/resource/a-ot34?level=2&autoprint=1");
assert.equal(pathWithQuery("/resource", { tag: ["a", "b"], x: undefined }), "/resource?tag=a&tag=b");
assert.equal(pathWithQuery("/", {}), "/");

// --- client gate: only a known signed-in session prints/downloads in place ---------------------
assert.equal(signInGateAllows({ ready: true, signedIn: true }), true);
assert.equal(signInGateAllows({ ready: true, signedIn: false }), false);
assert.equal(signInGateAllows({ ready: false, signedIn: false }), false);

// --- OAuth state carries the signed return path ------------------------------------------------
async function oauthState() {
  const prev = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "test-only-secret-not-used-anywhere-0123456789";
  try {
    const withNext = await createGoogleOAuthState("login", false, "/resource/a-ot34?level=2");
    assert.equal((await verifyGoogleOAuthState(withNext.state))?.next, "/resource/a-ot34?level=2");
    const evil = await createGoogleOAuthState("login", false, "https://evil.example");
    assert.equal((await verifyGoogleOAuthState(evil.state))?.next, null);
    const none = await createGoogleOAuthState("login");
    assert.equal((await verifyGoogleOAuthState(none.state))?.next, null);
  } finally {
    if (prev === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = prev;
  }
}

// --- wiring (source checks) ---------------------------------------------------------------------
function before(file: string, a: string, b: string) {
  const s = src(file);
  const i = s.indexOf(a);
  const j = s.indexOf(b);
  assert.ok(i >= 0 && j >= 0 && i < j, `${file}: "${a}" before "${b}"`);
}
const loginRoute = src("src/app/api/auth/family/google/route.ts");
assert.ok(loginRoute.includes("safeCallbackPath(searchParams.get(CALLBACK_PARAM))"), "OAuth start validates callbackUrl");
assert.ok(src("src/app/api/auth/family/google/callback/route.ts").includes('statePayload.next ?? "/account"'), "callback returns to next");
assert.ok(src("src/app/(site)/account/login/page.tsx").includes("safeCallbackPath("), "login page validates callbackUrl");

// Print pages: sign-in before the existing Plus rule (embed previews render, but print a notice).
before("src/app/print/resource/[slug]/page.tsx", "requireSignInForPage(", 'redirect("/subscribe")');
before("src/app/print/resource/bundle/[slug]/page.tsx", "requireSignInForPage(", 'redirect("/subscribe")');
before("src/app/print/resource/card/[id]/page.tsx", "requireSignInForPage(", 'redirect("/subscribe")');
before("src/app/print/evergreen/[slug]/page.tsx", "requireSignInForPage(", 'redirect("/subscribe")');
assert.ok(src("src/app/print/[slug]/page.tsx").includes("requireSignInForPage("), "legacy print page gated");
for (const f of ["src/app/print/resource/[slug]/page.tsx", "src/app/print/[slug]/page.tsx"]) {
  assert.ok(src(f).includes("SIGNED_OUT_PRINT_CSS"), `${f}: signed-out embed prints a notice`);
}

// Card API: sign-in (401/403) first for every card, then Plus (402) for non-free cards.
const cardApi = "src/app/api/resource/cards/[id]/download/route.ts";
before(cardApi, "await parentApiGuard()", "isFreeFeaturedCard(card.id, country)");
before(cardApi, "isFreeFeaturedCard(card.id, country)", "familyHasPlus(guard.session.familyAccountId)");
before(cardApi, "familyHasPlus(", "readCardOriginal(");
// Activity PDFs keep their 401 -> 402 order.
before("src/lib/resource/activity-download.ts", "deps.guard()", "deps.hasPlus(");

// Buttons: every Print / Download goes through the gate.
for (const [file, needle] of [
  ["src/components/resource/ResourceSheetPanel.tsx", "<SignInGatedLink"],
  ["src/components/resource/SundayBundle.tsx", "<SignInGatedLink"],
  ["src/components/resource/UnifiedSearchResults.tsx", "<SignInGatedLink"],
  ["src/components/resource/ResourceCardGrid.tsx", "<SignInGatedLink"],
  ["src/components/resource/CardTile.tsx", "<SignInGatedLink"],
  ["src/components/resource/CardActions.tsx", "if (!gate()) return;"],
  ["src/components/resource/SundayCardButtons.tsx", "if (!gate()) return;"],
  ["src/components/home/SundaySheetHero.tsx", "if (!gate()) return;"],
] as const) {
  assert.ok(src(file).includes(needle), `${file}: ${needle}`);
}
for (const file of [
  "src/components/resource/ResourceSheetPanel.tsx",
  "src/components/resource/UnifiedSearchResults.tsx",
  "src/components/resource/ResourceCardGrid.tsx",
]) {
  assert.ok(src(file).includes("<PlusLockButton requireSignIn"), `${file}: locked Print asks for sign-in first`);
  assert.ok(!/<a\s[^>]*href=\{resourcePrintPath/.test(src(file)), `${file}: no ungated print <a>`);
}
assert.ok(!src("src/components/home/SundaySheetHero.tsx").includes("No sign-in needed"), "home copy updated");
assert.ok(src("src/components/home/SundaySheetHero.tsx").includes("Edit it for your class"), "home edit-for-class label");
assert.ok(!src("src/components/home/SundaySheetHero.tsx").includes("Save to My Binder"), "home binder label retired");

// Pages stay static / ISR: the home page and the gate helpers never read cookies on render.
assert.ok(!src("src/components/useSignInGate.ts").includes("next/headers"));
assert.ok(!/export const dynamic/.test(src("src/app/(site)/page.tsx")), "home page not made dynamic");

// Image guard: in the root layout, pictures only.
assert.ok(src("src/app/layout.tsx").includes("<ImageGuard />"));
const guard = src("src/components/ImageGuard.tsx");
assert.ok(guard.includes('"img, picture, canvas, svg image, [data-image-preview]"'));
assert.ok(!/\ba\b,|button|\[href\]/.test(guard.match(/IMAGE_SELECTOR = "([^"]+)"/)?.[1] ?? ""), "links and buttons not blocked");

oauthState()
  .then(() => console.log("test-print-signin: callbackUrl, OAuth state, gates and wiring OK"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
