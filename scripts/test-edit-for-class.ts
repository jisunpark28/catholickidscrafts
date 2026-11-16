/**
 * Homepage "Edit it for your class" wiring: three viewer paths + edit destination.
 * Run: pnpm exec tsx scripts/test-edit-for-class.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { decideEditForClass } from "../src/lib/home/edit-for-class-action";
import { resourceEditPath } from "../src/lib/resource/sheet-edit-path";

function src(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const hero = src("src/components/home/SundaySheetHero.tsx");
assert.ok(hero.includes("Edit it for your class"), "button label");
assert.ok(!hero.includes("Save to My Binder"), "old binder label removed");
assert.ok(hero.includes("decideEditForClass"), "uses shared decision helper");
assert.ok(hero.includes("resourceEditPath"), "Plus uses resource edit path");
assert.ok(hero.includes('signInPath("/")'), "signed-out guide uses family login");
assert.ok(hero.includes('href="/subscribe"'), "free guide links to subscribe");

const home = src("src/app/(site)/home-view.tsx");
assert.ok(home.includes("sheetKey={sheet.key}"), "home passes catalog sheet key");

const editHref = resourceEditPath("A-OT30", 1);
assert.equal(editHref, "/resource/edit/a-ot30");
assert.equal(resourceEditPath("A-OT30", 2), "/resource/edit/a-ot30?level=2");

assert.deepEqual(decideEditForClass({ sessionReady: false, signedIn: false, isPlus: false, editHref }), {
  kind: "signin",
});
assert.deepEqual(decideEditForClass({ sessionReady: true, signedIn: false, isPlus: false, editHref }), {
  kind: "signin",
});
assert.deepEqual(decideEditForClass({ sessionReady: true, signedIn: true, isPlus: false, editHref }), {
  kind: "subscribe",
});
assert.deepEqual(decideEditForClass({ sessionReady: true, signedIn: true, isPlus: true, editHref }), {
  kind: "edit",
  href: editHref,
});
assert.deepEqual(decideEditForClass({ sessionReady: true, signedIn: true, isPlus: true, editHref: null }), {
  kind: "edit",
  href: "/resource",
});

console.log("test-edit-for-class: label, wiring, and three viewer paths OK");
