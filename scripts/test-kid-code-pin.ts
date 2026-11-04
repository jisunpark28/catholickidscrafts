/**
 * Kid Code + PIN policy checks.
 * Run: npx tsx scripts/test-kid-code-pin.ts
 */
import {
  generateUniqueKidCode,
  isValidKidCode,
  kidCodeCandidate,
  kidCodeNamePart,
  normalizeKidCode,
} from "../src/lib/kids/kid-code";
import { checkPin } from "../src/lib/kids/pin-policy";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

async function main() {
  // Kid Code
  check("name part", kidCodeNamePart("Lily") === "lily");
  check("name part spaces", kidCodeNamePart("Lily Anne") === "lilyanne");
  check("name part accents", kidCodeNamePart("Zoé") === "zoe");
  check("name part korean", kidCodeNamePart("민지") === "kid");
  check("name part one letter", kidCodeNamePart("J") === "kid");
  check("name part max 12", kidCodeNamePart("Maximiliananna") === "maximilianan");
  check("candidate format", kidCodeCandidate("Lily", () => 8492) === "lily-8492");
  check("candidate pads", kidCodeCandidate("Leo", () => 7) === "leo-0007");
  for (let i = 0; i < 200; i++) {
    const c = kidCodeCandidate("Mia");
    check(`random candidate valid ${c}`, isValidKidCode(c));
  }
  check("normalize", normalizeKidCode(" Lily-8492 ") === "lily-8492");
  check("valid", isValidKidCode("lily-8492") && isValidKidCode("kid-0000"));
  check("invalid", !isValidKidCode("lily-24") && !isValidKidCode("Lily-8492") && !isValidKidCode("l-1234") && !isValidKidCode("CKC-ABCD-EFGH"));

  const taken = new Set(["lily-0001", "lily-0002"]);
  const seq = [1, 2, 3];
  let i = 0;
  const code = await generateUniqueKidCode("Lily", async (c) => taken.has(c), () => seq[i++]!);
  check("retry on collision", code === "lily-0003", code);
  let threw = false;
  try {
    await generateUniqueKidCode("Lily", async () => true);
  } catch {
    threw = true;
  }
  check("gives up after max attempts", threw);

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
