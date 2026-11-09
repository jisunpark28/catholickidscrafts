import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SidebarNavigation } from "../src/components/home/SidebarNavigation";
import { SidebarIllustration } from "../src/components/home/SidebarIllustration";
import { sidebarItems, sidebarItemIsCurrent, SIDEBAR_ITEMS, isPaidSidebarGrant } from "../src/lib/sidebar-navigation";
import { sidebarPaidPlusForReader } from "../src/lib/sidebar-entitlement";
import { subscriptionGrantsPlus, type SubscriptionSnapshot } from "../src/lib/subscription/status";
import type { ReaderKey } from "../src/lib/bible/reader";
Object.assign(globalThis, { React });

type Plan = Parameters<typeof isPaidSidebarGrant>[0];
const free: Plan = { isPlus: false, source: "free", pass: { active: false }, sub: { grantsPlus: false, subscription: null } };
const paid: Plan = { ...free, isPlus: true, source: "pass", pass: { active: true } };
const owner: ReaderKey = { type: "owner", familyAccountId: "fixture-family" };
const child: ReaderKey = { type: "sub", subProfileId: "fixture-child" };
const guest: ReaderKey = { type: "guest", guestId: "fixture-guest" };
const now = new Date("2026-11-06T23:00:00Z");
const future = new Date(now.getTime() + 86400000), past = new Date(now.getTime() - 86400000);
const cases: [string, Plan, boolean][] = [
  ["free", free, false], ["active paid pass", paid, true],
  ["expired or revoked pass", { ...paid, isPlus: false, pass: { active: false } }, false],
  ["preview email is not paid", { ...paid, source: "preview" }, false],
];
for (const status of ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "INCOMPLETE", "INCOMPLETE_EXPIRED", "UNPAID", "PAUSED"] as const) {
  for (const end of [future, past]) {
    const subscription: SubscriptionSnapshot = { status, currentPeriodEnd: end, cancelAtPeriodEnd: true, pastDueSince: new Date(now.getTime() - 8 * 86400000) };
    const grantsPlus = subscriptionGrantsPlus(subscription, now);
    cases.push([`${status}/${end === future ? "future" : "past"}`, { ...free, isPlus: grantsPlus, source: grantsPlus ? "stripe" : "free", sub: { grantsPlus, subscription } }, grantsPlus && status !== "TRIALING"]);
  }
}
async function main() {
  let decisions = 0;
  for (const [label, plan, expected] of cases) {
    assert.equal(isPaidSidebarGrant(plan), expected, label);
    for (const key of [null, guest, owner, child]) {
      let lookups = 0;
      const actual = await sidebarPaidPlusForReader(key, { resolveFamily: async () => { lookups++; return plan; }, childFamilyIds: async () => ["fixture-family"] });
      assert.equal(actual, key && key.type !== "guest" ? expected : false, `${label}/${key?.type ?? "signed-out"}`);
      if (!key || key.type === "guest") assert.equal(lookups, 0);
      decisions++;
    }
  }
  assert.equal(await sidebarPaidPlusForReader(child, { resolveFamily: async (id) => id === "co-parent" ? paid : free, childFamilyIds: async () => ["owner", "co-parent"] }), true);
  assert.equal(await sidebarPaidPlusForReader(child, { resolveFamily: async () => paid, childFamilyIds: async () => [] }), false);
  assert.equal(await sidebarPaidPlusForReader(owner, { resolveFamily: async () => { throw Error("DB unavailable"); }, childFamilyIds: async () => [] }), false);
  const labels = ["Printables", "Daily Mass", "Play & Learn", "Mom's Bible", "Q&A Cards", "Faith & Prayer"];
  assert.deepEqual(sidebarItems(false).map((item) => item.label), labels);
  assert.deepEqual(sidebarItems(true).map((item) => item.label), [...labels, "My Binder"]);
  assert.equal(SIDEBAR_ITEMS.find((item) => item.id === "binder")?.href, null, "missing binder must never silently become /account/memos or an invented URL");
  assert.equal(SIDEBAR_ITEMS.find((item) => item.id === "bible")?.href, "/moms-bible/situations", "Mom's Bible opens the situations board first");
  const routes = [
    ["/resource", "", "printables"], ["/resource/example", "", "printables"],
    ["/daily-mass", "", "mass"], ["/mass/participation", "", "mass"],
    ["/play", "", "play"], ["/play/ten-commandments", "", "play"],
    ["/bible/genesis", "", "bible"], ["/bible/read/matthew/5", "", "bible"], ["/bible/gospel", "", "bible"], ["/moms-bible/situations", "", "bible"],
    ["/catholic-faith-questions", "", "prayer"], ["/catholic-faith-questions", "#qa-cards", "questions"], ["/catholic-faith-questions/why-do-we-pray", "", "questions"],
    ["/prayers", "", "prayer"], ["/liturgy/advent", "", "prayer"], ["/liturgy/saints", "", "prayer"],
  ];
  for (const [pathname, hash, id] of routes) {
    assert.deepEqual(SIDEBAR_ITEMS.filter((item) => sidebarItemIsCurrent(item.id, pathname, hash)).map((item) => item.id), [id]);
    const html = renderToStaticMarkup(React.createElement(SidebarNavigation, { pathname, hash, activePaidPlus: true }));
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  }
  for (const pathname of ["/", "/subscribe", "/resources-not-a-route", "/playground"]) {
    assert.equal(SIDEBAR_ITEMS.filter((item) => sidebarItemIsCurrent(item.id, pathname)).length, 0);
  }
  const fixtures: Record<string, string> = {};
  for (const [state, key, plan] of [["signed-out", null, free], ["free", owner, free], ["plus", owner, paid]] as const) {
    const activePaidPlus = await sidebarPaidPlusForReader(key, { resolveFamily: async () => plan, childFamilyIds: async () => [] });
    const html = renderToStaticMarkup(React.createElement(SidebarNavigation, { pathname: "/resource", activePaidPlus }));
    fixtures[state] = html;
    assert.equal((html.match(/<a /g) ?? []).length, 6);
    assert.equal((html.match(/data-sidebar-separator=/g) ?? []).length, activePaidPlus ? 2 : 1);
    assert.equal(html.includes("My Binder"), activePaidPlus);
    assert.equal(html.includes("sidebar-binder-unavailable"), activePaidPlus);
    if (activePaidPlus) assert.match(html, /disabled=""/);
    assert.doesNotMatch(html, /href="\/subscribe"|Old Testament|Ordinary Time|Get Plus/);
  }
  for (const file of ["resource/page.tsx", "daily-mass/page.tsx", "play/page.tsx", "bible/read/[bookSlug]/[chapter]/page.tsx", "catholic-faith-questions/page.tsx"]) {
    assert.ok(existsSync(path.join("src/app/(site)", file)), file);
  }
  assert.doesNotMatch(readFileSync("src/lib/sidebar-navigation.ts", "utf8"), /\/bible\/(old-testament|new-testament)/);
  assert.match(readFileSync("src/lib/sidebar-access.ts", "utf8"), /resolveFamily:\s*resolveFamilyPlus/);
  assert.match(readFileSync("src/app/(site)/layout.tsx", "utf8"), /getSidebarPaidPlus/);
  const icons = SIDEBAR_ITEMS.map((item) => ({ label: item.label, svg: renderToStaticMarkup(React.createElement(SidebarIllustration, { kind: item.id })) }));
  for (const icon of icons) {
    assert.match(icon.svg, /stroke="currentColor"/);
    assert.doesNotMatch(icon.svg, /<image|<text|#[0-9a-f]{3,6}/i);
    assert.ok((icon.svg.match(/<path|<circle/g) ?? []).length >= 4);
  }
  const luminance = (hex: string) => hex.match(/../g)!.map((v) => parseInt(v, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const contrast = (foreground: string, background: string) => {
    const a = luminance(foreground), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  };
  for (const [label, foreground, background, minimum] of [
    ["normal text", "493a30", "fffdfa", 4.5], ["active text/icon", "9d451d", "fbe8dc", 4.5],
    ["normal icon", "b65b2e", "fffdfa", 3], ["active border", "b46139", "fbe8dc", 3],
    ["green active marker", "2e7d32", "fbe8dc", 3], ["focus on paper", "9d451d", "fcf7f2", 3],
    ["focus on hover", "9d451d", "fff2e8", 3], ["Plus badge", "40502d", "dce6c5", 4.5],
  ] as const) {
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= minimum, `${label}: ${ratio.toFixed(2)}:1 needs ${minimum}:1`);
    console.log(`PASS contrast ${label}: ${ratio.toFixed(2)}:1`);
  }
  const navigationSource = readFileSync("src/components/home/SidebarNavigation.tsx", "utf8");
  assert.doesNotMatch(navigationSource, /text-white|#607537|#405329|#c5b37b/, "no old olive/white-active palette");
  assert.match(navigationSource, /before:bg-\[#2e7d32\]/, "green active indicator");
  const directory = process.env.SIDEBAR_FIXTURE_DIR ?? tmpdir(); mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "sidebar-fixtures.json"), JSON.stringify({ fixtures, icons }));
  console.log(`PASS: ${decisions} reader/plan decisions + co-parent/inactive/error guards; ${routes.length} route/hash highlights; exact order/SSR omission/real destination files/7 illustrations/contrast. Fixtures: ${directory}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });