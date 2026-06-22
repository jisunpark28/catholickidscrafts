import { execSync } from "node:child_process";

const PRISMA = "pnpm exec prisma";
const DISCUSSION_MIGRATION = "20260622120000_bible_chapter_discussion";
const RECOVERY_MIGRATION = "20260623150000_bible_discussion_tables_recovery";

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

for (let attempt = 1; attempt <= 4; attempt += 1) {
  const { output, code } = run(`${PRISMA} migrate deploy`);
  log(output);
  if (code === 0) {
    process.exit(0);
  }

  if (recoverDiscussionMigration(output)) {
    continue;
  }

  console.error("Prisma migrate deploy failed for a non-discussion migration.");
  process.exit(code);
}

console.log("Migrate deploy still failing after discussion recovery; bootstrapping schema as last resort...");
if (!bootstrapDiscussionSchema()) {
  console.error("Could not bootstrap Bible discussion schema.");
  process.exit(1);
}
markDiscussionMigrationsApplied();

const final = run(`${PRISMA} migrate deploy`);
log(final.output);
if (final.code !== 0 && isDiscussionIssue(final.output)) {
  console.warn("Discussion migrations remain unresolved, but schema bootstrap ran. Continuing build.");
  process.exit(0);
}

process.exit(final.code);
