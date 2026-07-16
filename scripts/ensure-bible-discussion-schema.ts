import { ensureDiscussionSchema } from "../src/lib/bible/discussion-schema";
import { shouldContinueBuildAfterDbStep } from "./vercel-build-helpers";

const DISCUSSION_SCHEMA_TIMEOUT_MS = 45_000;

async function main(): Promise<void> {
  await Promise.race([
    ensureDiscussionSchema(),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("ensure-bible-discussion-schema timed out")),
        DISCUSSION_SCHEMA_TIMEOUT_MS,
      );
    }),
  ]);
  console.log("Bible discussion schema ready");
}

main().catch((error) => {
  console.error(error);
  const message = error instanceof Error ? error.message : String(error);
  const timedOut = /timed out/i.test(message);
  if (shouldContinueBuildAfterDbStep("ensure-bible-discussion-schema", message, timedOut)) {
    process.exit(0);
  }
  process.exit(1);
});
