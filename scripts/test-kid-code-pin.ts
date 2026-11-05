/**
 * Kid Code + PIN policy checks.
 * Run: npx tsx scripts/test-kid-code-pin.ts
 */
import {
  isValidKidCode,
  isValidNewKidCode,
  KID_CODE_INVALID_ERROR,
  KID_CODE_NEEDED_ERROR,
  KID_CODE_TAKEN_ERROR,
  kidCodeNamePart,
  normalizeKidCode,
  resolveNewKidCode,
} from "../src/lib/kids/kid-code";
import { checkPin, checkPinForChild } from "../src/lib/kids/pin-policy";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

async function main() {
  // Kid Code: name letters only
  check("name part", kidCodeNamePart("Lily") === "lily");
  check("name part spaces", kidCodeNamePart("Lily Anne") === "lilyanne");
  check("name part accents", kidCodeNamePart("Zo\u00e9") === "zoe");
  check("name part korean", kidCodeNamePart("\ubbfc\uc9c0") === null);
  check("name part one letter", kidCodeNamePart("J") === null);
  check("name part max 12", kidCodeNamePart("Maximiliananna") === "maximilianan");
  check("normalize", normalizeKidCode(" Lily-8492 ") === "lily-8492" && normalizeKidCode(" Lily ") === "lily");

  // Sign-in format: name-only and legacy name-1234
  check("valid name-only", isValidKidCode("lily") && isValidKidCode("mo") && isValidKidCode("maximilianan"));
  check("valid legacy", isValidKidCode("lily-8492") && isValidKidCode("kid-0000"));
  check(
    "invalid",
    !isValidKidCode("lily-24") && !isValidKidCode("Lily-8492") && !isValidKidCode("l-1234") &&
      !isValidKidCode("CKC-ABCD-EFGH") && !isValidKidCode("l") && !isValidKidCode("maximiliananna") &&
      !isValidKidCode("lily8492") && !isValidKidCode("lily-") && !isValidKidCode("") && !isValidKidCode("li ly"),
  );
  // New codes: letters only (legacy digits aren't issued)
  check("new code letters", isValidNewKidCode("lily") && isValidNewKidCode("lilyanne"));
  check("new code no digits", !isValidNewKidCode("lily-8492") && !isValidNewKidCode("lily2") && !isValidNewKidCode("l"));

  // Availability
  const taken = new Set(["lily", "zoe"]);
  const isTaken = async (c: string) => taken.has(c);
  const r1 = await resolveNewKidCode("Mia", null, isTaken);
  check("free name -> code", r1.ok && r1.code === "mia", r1);
  const r2 = await resolveNewKidCode("Lily", null, isTaken);
  check("taken name -> ask", !r2.ok && r2.reason === "taken" && r2.error === KID_CODE_TAKEN_ERROR, r2);
  const r3 = await resolveNewKidCode("\ubbfc\uc9c0", null, isTaken);
  check("korean name -> ask", !r3.ok && r3.reason === "needs_code" && r3.error === KID_CODE_NEEDED_ERROR, r3);
  const r4 = await resolveNewKidCode("Lily", " LilyAnne ", isTaken);
  check("typed free code", r4.ok && r4.code === "lilyanne", r4);
  const r5 = await resolveNewKidCode("Mia", "Zoe", isTaken);
  check("typed taken code", !r5.ok && r5.reason === "taken" && r5.error === KID_CODE_TAKEN_ERROR, r5);
  for (const bad of ["lily-1234", "lily2", "l", "li ly!", "abcdefghijklm"]) {
    const r = await resolveNewKidCode("Mia", bad, isTaken);
    check(`typed invalid ${bad}`, !r.ok && r.reason === "invalid" && r.error === KID_CODE_INVALID_ERROR, r);
  }
  const r6 = await resolveNewKidCode("Mia", "", isTaken);
  check("empty typed -> name", r6.ok && r6.code === "mia", r6);
  // "New Kid Code": the child's current code counts as taken
  const current = "mia";
  const r7 = await resolveNewKidCode("Mia", null, async (c) => c === current || taken.has(c));
  check("current code -> ask", !r7.ok && r7.reason === "taken", r7);
  // Taken message never names who has the code
  check("taken message generic", !/family|parent|lily\b/i.test(KID_CODE_TAKEN_ERROR.replace("lilyanne", "")));

  // PIN-equals-code-digits rule: only legacy codes have digits
  check("name-only code: no digits rule", checkPinForChild("8492", "lily").ok);
  check("legacy code: digits rule kept", !checkPinForChild("8492", "lily-8492").ok);

  // PIN policy
  const rejected: [string, string][] = [
    ["123", "format"], ["12345", "format"], ["12a4", "format"], ["", "format"],
    ["0000", "repeated"], ["1111", "repeated"], ["9999", "repeated"],
    ["0123", "sequence"], ["1234", "sequence"], ["6789", "sequence"], ["4321", "sequence"],
    ["9876", "sequence"], ["3210", "sequence"], ["7890", "sequence"], ["0987", "sequence"], ["9012", "sequence"],
    ["1212", "pattern"], ["3434", "pattern"], ["1122", "pattern"], ["9988", "pattern"],
    ["1004", "common"], ["2580", "common"], ["0852", "common"], ["5683", "common"],
  ];
  for (const [pin, reason] of rejected) {
    const r = checkPin(pin);
    check(`reject ${pin} (${reason})`, !r.ok && r.reason === reason, r);
  }
  for (const pin of ["0815", "2716", "1357", "8402", "4729", "0412", "2013", "1105"]) {
    const r = checkPin(pin);
    check(`accept ${pin}`, r.ok, r);
  }
  let accepted = 0;
  for (let n = 0; n < 10_000; n++) if (checkPin(String(n).padStart(4, "0")).ok) accepted++;
  check("most PINs still allowed", accepted > 9_700, accepted);

  console.log(`kid code + PIN policy: ${accepted} of 10000 PINs allowed, ${failures} failures`);
  if (failures > 0) process.exit(1);
  console.log("kid code + PIN policy OK");
}

void main();
