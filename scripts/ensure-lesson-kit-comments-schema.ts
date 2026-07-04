import { ensureLessonKitCommentsSchema } from "../src/lib/lesson-kit/comments-schema";

async function main(): Promise<void> {
  await ensureLessonKitCommentsSchema();
  console.log("Lesson kit comments schema ready");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
