import { ensureDiscussionSchema } from "../src/lib/bible/discussion-schema";

async function main(): Promise<void> {
  await ensureDiscussionSchema();
  console.log("Bible discussion schema ready");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
