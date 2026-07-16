import { spawnSync } from "node:child_process";
import { isVercelPreviewDeploy } from "./vercel-build-helpers";

function runStep(label: string, scriptPath: string): void {
  console.log(`vercel-build: ${label}`);
  const result = spawnSync("pnpm", ["exec", "tsx", scriptPath], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

/**
 * Production: migrate + idempotent schema/home fixes before next build.
 * Preview: skip DB steps — PR previews share the Neon DB already migrated by production.
 */
function main(): void {
  if (isVercelPreviewDeploy()) {
    console.log(
      "vercel-build: preview deploy — skipping DB migrate/ensure steps (shared Neon DB).",
    );
    return;
  }

  runStep("prisma migrate deploy", "scripts/vercel-migrate-deploy.ts");
  runStep("ensure home hub items", "scripts/ensure-home-section-items.ts");
  runStep("ensure bible discussion schema", "scripts/ensure-bible-discussion-schema.ts");
}

main();
