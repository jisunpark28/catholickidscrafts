/**
 * Kid PIN hashing, lockout steps and device-profile storage checks (no DB, fake clock).
 * Run: npx tsx scripts/test-kid-pin.ts
 */
import {
  hashKidPin,
  kidPinStatus,
  PIN_ALERT_AT,
  PIN_DISABLE_AT,
  pinFailureOutcome,
  pinLoginBlock,
  verifyKidPin,
} from "../src/lib/kids/kid-pin";
import { checkPinForChild } from "../src/lib/kids/pin-policy";
import {
  clearKidProfiles,
  KID_PROFILES_MAX,
  KID_PROFILES_STORAGE_KEY,
  kidProfileName,
  readKidProfiles,
  removeKidProfile,
  saveKidProfile,
} from "../src/lib/kids/kid-device-profiles";

let failures = 0;
let checks = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.has(k) ? this.data.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, String(v));
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

async function main() {
  // Hashing + verify
  const id = "ckchild123";
  const hash = await hashKidPin(id, "4827");
  check("hash is bcrypt", /^\$2[aby]\$10\$/.test(hash), hash.slice(0, 7));
  check("hash does not contain PIN", !hash.includes("4827"));
  check("verify ok", await verifyKidPin(id, "4827", hash));
  check("verify wrong pin", !(await verifyKidPin(id, "4828", hash)));
  check("verify other child id", !(await verifyKidPin("otherchild", "4827", hash)));
  check("verify null hash", !(await verifyKidPin(id, "4827", null)));
  check("verify unknown child", !(await verifyKidPin(null, "4827", hash)));
  check("verify malformed pin", !(await verifyKidPin(id, "48a7", hash)));
  check("verify 5 digits", !(await verifyKidPin(id, "48270", hash)));
  let threw = false;
  try {
    await hashKidPin(id, "12a4");
  } catch {
    threw = true;
  }
  check("hash rejects malformed", threw);

  // Rough timing: unknown code vs real hash both run one bcrypt compare.
  await verifyKidPin(null, "1111", null); // warm the dummy hash
  const t0 = performance.now();
  await verifyKidPin(null, "4827", null);
  const tDummy = performance.now() - t0;
  const t1 = performance.now();
  await verifyKidPin(id, "4828", hash);
  const tReal = performance.now() - t1;
  check("dummy compare costs about the same as a real one", tDummy > tReal * 0.4 && tDummy < tReal * 2.5, {
    tDummy,
    tReal,
  });

  // Lockout steps (fake clock)
  const now = new Date("2026-11-05T12:00:00Z");
  const min = 60 * 1000;
  for (let n = 1; n <= 4; n++) {
    const o = pinFailureOutcome(n, now);
    check(`fail ${n}: no lock`, o.lockedUntil === null && !o.disabled && o.alert === null, o);
  }
  const lockMs = (n: number) => (pinFailureOutcome(n, now).lockedUntil?.getTime() ?? now.getTime()) - now.getTime();
  for (let n = 5; n <= 9; n++) check(`fail ${n}: 1 min`, lockMs(n) === min, lockMs(n));
  for (let n = 10; n <= 14; n++) check(`fail ${n}: 15 min`, lockMs(n) === 15 * min, lockMs(n));
  for (let n = 15; n <= 19; n++) check(`fail ${n}: 1 h`, lockMs(n) === 60 * min, lockMs(n));
  check("alert at 15", pinFailureOutcome(PIN_ALERT_AT, now).alert === "locked");
  check("no alert at 16", pinFailureOutcome(16, now).alert === null);
  const o20 = pinFailureOutcome(PIN_DISABLE_AT, now);
  check("disable at 20", o20.disabled && o20.alert === "disabled" && o20.lockedUntil === null, o20);
  const o21 = pinFailureOutcome(21, now);
  check("21 still disabled, no 2nd alert", o21.disabled && o21.alert === null, o21);

  // Simulated child: wrong PIN 20 times => at most 20 guesses before a parent reset
  let state = { pinHash: hash, pinDisabledAt: null as Date | null, pinLockedUntil: null as Date | null, pinFailCount: 0 };
  let clock = now.getTime();
  let guesses = 0;
  const alerts: string[] = [];
  for (let i = 0; i < 200; i++) {
    const t = new Date(clock);
    const block = pinLoginBlock(state, t);
    if (block === "disabled") break;
    if (block === "locked") {
      clock = state.pinLockedUntil!.getTime() + 1; // attacker waits out the lock
      continue;
    }
    guesses++;
    state.pinFailCount++;
    const o = pinFailureOutcome(state.pinFailCount, t);
    if (o.alert) alerts.push(o.alert);
    if (o.disabled) state = { ...state, pinDisabledAt: t, pinLockedUntil: null };
    else if (o.lockedUntil) state = { ...state, pinLockedUntil: o.lockedUntil };
  }
  check("max 20 guesses", guesses === 20, guesses);
  check("alerts locked + disabled", alerts.join(",") === "locked,disabled", alerts);
  check("status disabled", kidPinStatus(state, new Date(clock)) === "disabled");
  const hoursSpent = (clock - now.getTime()) / 3_600_000;
  check("20 guesses take over 5 hours of locks", hoursSpent > 5, hoursSpent);

  check("block no pin", pinLoginBlock({ pinHash: null, pinDisabledAt: null, pinLockedUntil: null }, now) === "no-pin");
  check(
    "block locked",
    pinLoginBlock({ pinHash: hash, pinDisabledAt: null, pinLockedUntil: new Date(now.getTime() + 1000) }, now) === "locked",
  );
  check(
    "lock expired",
    pinLoginBlock({ pinHash: hash, pinDisabledAt: null, pinLockedUntil: new Date(now.getTime() - 1) }, now) === null,
  );
  check("status not_set", kidPinStatus({ pinHash: null, pinDisabledAt: null, pinLockedUntil: null }, now) === "not_set");
  check("status set", kidPinStatus({ pinHash: hash, pinDisabledAt: null, pinLockedUntil: null }, now) === "set");

  // Per-child PIN policy
  check("child policy ok", checkPinForChild("4827", "lily-8492").ok);
  check("child policy rejects code digits", !checkPinForChild("8492", "lily-8492").ok);
  check("child policy keeps weak rules", !checkPinForChild("1004", "lily-8492").ok);
  check("child policy keeps format rule", !checkPinForChild("123", "lily-8492").ok);

  // Device profiles: only { code, name }
  const st = new MemoryStorage();
  check("empty", readKidProfiles(st).length === 0);
  saveKidProfile({ code: "Lily-8492 ", name: "Lily Anne" }, st);
  saveKidProfile({ code: "leo-0427", name: "Leo" }, st);
  const raw = JSON.parse(st.getItem(KID_PROFILES_STORAGE_KEY)!);
  check("newest first", raw[0].code === "leo-0427" && raw[1].code === "lily-8492", raw);
  check("first name only", readKidProfiles(st).find((p) => p.code === "lily-8492")?.name === "Lily");
  check(
    "stored keys are code+name only",
    raw.every((p: Record<string, unknown>) => Object.keys(p).sort().join(",") === "code,name"),
    raw,
  );
  // Tampered storage with extra fields / bad codes is cleaned up
  st.setItem(
    KID_PROFILES_STORAGE_KEY,
    JSON.stringify([
      { code: "mia-1111", name: "Mia", pin: "4827", token: "x" },
      { code: "CKC-ABCD-EFGH", name: "Old" },
      "junk",
      { code: "mia-1111", name: "Dup" },
    ]),
  );
  const cleaned = readKidProfiles(st);
  check("sanitize", cleaned.length === 1 && cleaned[0]!.code === "mia-1111" && !("pin" in cleaned[0]!), cleaned);
  saveKidProfile({ code: "zoe-2222", name: "Zoe" }, st);
  check("re-write drops extras", !st.getItem(KID_PROFILES_STORAGE_KEY)!.includes("4827"));
  for (let i = 0; i < 12; i++) saveKidProfile({ code: `kid-${String(1000 + i)}`, name: `K${i}` }, st);
  check("max entries", readKidProfiles(st).length === KID_PROFILES_MAX);
  removeKidProfile("KID-1011", st);
  check("remove", !readKidProfiles(st).some((p) => p.code === "kid-1011"));
  clearKidProfiles(st);
  check("clear", st.getItem(KID_PROFILES_STORAGE_KEY) === null);
  check("name cap", kidProfileName("Maximilianaaaaaaaaaaaaaaaa").length === 20);
  st.setItem(KID_PROFILES_STORAGE_KEY, "{not json");
  check("bad json", readKidProfiles(st).length === 0);

  if (failures > 0) {
    console.error(`${failures} of ${checks} checks failed`);
    process.exit(1);
  }
  console.log(`OK: ${checks} kid PIN checks passed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
