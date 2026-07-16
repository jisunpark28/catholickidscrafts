import { execSync } from "node:child_process";
import {
  isVercelPreviewDeploy,
  runWithTimeout,
  shouldContinueBuildAfterDbStep,
} from "./vercel-build-helpers";

const PRISMA = "pnpm exec prisma";
const MIGRATE_TIMEOUT_MS = isVercelPreviewDeploy() ? 90_000 : 600_000;
const DISCUSSION_MIGRATION = "20260622120000_bible_chapter_discussion";
const RECOVERY_MIGRATION = "20260623150000_bible_discussion_tables_recovery";
const CRAFT_GALLERY_MIGRATION = "20260710120000_craft_gallery_submissions";

function run(command: string): { output: string; code: number } {
  try {
    const output = execSync(command, { encoding: "utf8" });
    return { output, code: 0 };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; status?: number; message?: string };
    const output = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n");
    return { output, code: err.status ?? 1 };
  }
}

function log(output: string): void {
  if (output.trim()) process.stdout.write(`${output}\n`);
}

function isParishRemovalIssue(output: string): boolean {
  return (
    output.includes("20260704120000_remove_parish_teacher_kits") ||
    output.includes("cannot drop table \"Parish\"") ||
    output.includes("LessonKit_parishId_fkey")
  );
}

function recoverParishRemovalMigration(output: string): boolean {
  if (!isParishRemovalIssue(output)) return false;

  if (output.includes("P3009") || output.includes("failed migrations")) {
    console.log("Recovering failed parish-removal migration (rolled back, will retry)...");
    const rolled = run(
      `${PRISMA} migrate resolve --rolled-back 20260704120000_remove_parish_teacher_kits`,
    );
    log(rolled.output);
    return true;
  }

  return false;
}

/** Clear failed migration rows left by other preview branches on the shared Neon DB. */
function recoverGenericFailedMigration(output: string): boolean {
  if (!output.includes("P3009") && !output.includes("failed migrations")) {
    return false;
  }

  const match = output.match(/`(\d{14}_[\w_]+)` migration/);
  if (!match) return false;

  const migrationName = match[1];
  if (
    migrationName === DISCUSSION_MIGRATION ||
    migrationName === RECOVERY_MIGRATION ||
    migrationName === CRAFT_GALLERY_MIGRATION ||
    migrationName === "20260704120000_remove_parish_teacher_kits"
  ) {
    return false;
  }

  console.log(`Recovering orphaned failed migration ${migrationName} (rolled back, will retry)...`);
  const rolled = run(`${PRISMA} migrate resolve --rolled-back ${migrationName}`);
  log(rolled.output);
  return rolled.code === 0 || rolled.output.includes("is already recorded");
}

function isDiscussionIssue(output: string): boolean {
  return (
    output.includes(DISCUSSION_MIGRATION) ||
    output.includes(RECOVERY_MIGRATION) ||
    output.includes("discussionPenName")
  );
}

function bootstrapDiscussionSchema(): boolean {
  console.log("Bootstrapping Bible discussion tables via direct DB connection...");
  const result = run("pnpm exec tsx scripts/ensure-bible-discussion-schema.ts");
  log(result.output);
  return result.code === 0;
}

function markDiscussionMigrationsApplied(): void {
  for (const migration of [DISCUSSION_MIGRATION, RECOVERY_MIGRATION]) {
    const { output, code } = run(`${PRISMA} migrate resolve --applied ${migration}`);
    log(output);
    if (code !== 0 && !output.includes("is already recorded as applied")) {
      console.warn(`Could not mark ${migration} as applied (may already be applied).`);
    }
  }
}

function recoverDiscussionMigration(output: string): boolean {
  if (!isDiscussionIssue(output)) return false;

  if (output.includes("P3009") || output.includes("failed migrations")) {
    console.log("Recovering failed Bible discussion migration...");
    const rolled = run(`${PRISMA} migrate resolve --rolled-back ${DISCUSSION_MIGRATION}`);
    log(rolled.output);
    return true;
  }

  if (
    output.includes("already exists") ||
    output.includes("42701") ||
    output.includes("P3018")
  ) {
    console.log("Discussion columns already exist; bootstrapping tables and marking migrations applied...");
    if (!bootstrapDiscussionSchema()) return false;
    markDiscussionMigrationsApplied();
    return true;
  }

  if (
    output.includes("P3008") ||
    output.includes("was modified after it was applied") ||
    output.includes("checksum")
  ) {
    console.log("Discussion migration checksum drift; bootstrapping tables directly...");
    if (!bootstrapDiscussionSchema()) return false;
    markDiscussionMigrationsApplied();
    return true;
  }

  return false;
}

function isCraftGalleryIssue(output: string): boolean {
  return (
    output.includes(CRAFT_GALLERY_MIGRATION) || output.includes("CraftGallerySubmission")
  );
}

function bootstrapCraftGallerySchema(): boolean {
  console.log("Bootstrapping craft gallery table via direct DB connection...");
  const result = run("pnpm exec tsx scripts/ensure-craft-gallery-schema.ts");
  log(result.output);
  return result.code === 0;
}

function markCraftGalleryMigrationApplied(): void {
  const { output, code } = run(`${PRISMA} migrate resolve --applied ${CRAFT_GALLERY_MIGRATION}`);
  log(output);
  if (code !== 0 && !output.includes("is already recorded as applied")) {
    console.warn(`Could not mark ${CRAFT_GALLERY_MIGRATION} as applied (may already be applied).`);
  }
}

function recoverCraftGalleryMigration(output: string): boolean {
  if (!isCraftGalleryIssue(output)) return false;

  if (output.includes("P3009") || output.includes("failed migrations")) {
    console.log("Recovering failed craft gallery migration...");
    const rolled = run(`${PRISMA} migrate resolve --rolled-back ${CRAFT_GALLERY_MIGRATION}`);
    log(rolled.output);
    return rolled.code === 0 || rolled.output.includes("is already recorded");
  }

  if (
    output.includes("already exists") ||
    output.includes("42701") ||
    output.includes("P3018")
  ) {
    console.log("Craft gallery table already exists; bootstrapping and marking migration applied...");
    if (!bootstrapCraftGallerySchema()) return false;
    markCraftGalleryMigrationApplied();
    return true;
  }

  if (
    output.includes("P3008") ||
    output.includes("was modified after it was applied") ||
    output.includes("checksum")
  ) {
    console.log("Craft gallery migration checksum drift; bootstrapping table directly...");
    if (!bootstrapCraftGallerySchema()) return false;
    markCraftGalleryMigrationApplied();
    return true;
  }

  return false;
}

for (let attempt = 1; attempt <= 4; attempt += 1) {
  const { output, code, timedOut } = runWithTimeout(
    `${PRISMA} migrate deploy`,
    MIGRATE_TIMEOUT_MS,
  );
  log(output);
  if (code === 0) {
    process.exit(0);
  }

  if (shouldContinueBuildAfterDbStep("prisma migrate deploy", output, timedOut)) {
    process.exit(0);
  }

  if (recoverDiscussionMigration(output)) {
    continue;
  }

  if (recoverCraftGalleryMigration(output)) {
    continue;
  }

  if (recoverParishRemovalMigration(output)) {
    continue;
  }

  if (recoverGenericFailedMigration(output)) {
    continue;
  }

  console.error("Prisma migrate deploy failed for a non-discussion migration.");
  process.exit(code);
}

console.log("Migrate deploy still failing after recovery; bootstrapping schemas as last resort...");
const discussionOk = bootstrapDiscussionSchema();
const craftGalleryOk = bootstrapCraftGallerySchema();
if (!discussionOk && !craftGalleryOk) {
  console.error("Could not bootstrap discussion or craft gallery schema.");
  process.exit(1);
}
markDiscussionMigrationsApplied();
markCraftGalleryMigrationApplied();

const final = runWithTimeout(`${PRISMA} migrate deploy`, MIGRATE_TIMEOUT_MS);
log(final.output);
if (final.code !== 0 && (isDiscussionIssue(final.output) || isCraftGalleryIssue(final.output))) {
  console.warn(
    "Discussion or craft gallery migrations remain unresolved, but schema bootstrap ran. Continuing build.",
  );
  process.exit(0);
}

if (
  final.code !== 0 &&
  shouldContinueBuildAfterDbStep("prisma migrate deploy (final)", final.output, final.timedOut)
) {
  process.exit(0);
}

process.exit(final.code);
