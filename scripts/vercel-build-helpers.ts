import { execSync } from "node:child_process";

/** Vercel sets VERCEL_ENV to production | preview | development. */
export function isVercelPreviewDeploy(): boolean {
  return process.env.VERCEL_ENV === "preview";
}

export function isVercelProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export type TimedCommandResult = {
  output: string;
  code: number;
  timedOut: boolean;
};

/**
 * Run a shell command with a hard timeout.
 * Preview PR builds share one Neon DB; concurrent `migrate deploy` can block on advisory locks.
 */
export function runWithTimeout(command: string, timeoutMs: number): TimedCommandResult {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      timeout: timeoutMs,
      killSignal: "SIGTERM",
    });
    return { output, code: 0, timedOut: false };
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      status?: number;
      message?: string;
      killed?: boolean;
      signal?: string;
    };
    const output = [err.stdout, err.stderr, err.message].filter(Boolean).join("\n");
    const timedOut =
      err.killed === true ||
      err.signal === "SIGTERM" ||
      /timed out|ETIMEDOUT|ESRCH/i.test(output);
    return { output, code: err.status ?? 1, timedOut };
  }
}

export function isMigrationLockOrTimeout(output: string): boolean {
  return /timed out|ETIMEDOUT|advisory lock|lock timeout|P1002|P1017|connection pool|too many clients|ECONNRESET|ECONNREFUSED/i.test(
    output,
  );
}

/** Preview builds should not fail when the shared DB is busy or already migrated on production. */
export function shouldContinuePreviewBuildAfterDbStep(
  label: string,
  output: string,
  timedOut: boolean,
): boolean {
  if (!isVercelPreviewDeploy()) return false;
  if (!timedOut && !isMigrationLockOrTimeout(output)) return false;
  console.warn(
    `Preview deploy: ${label} did not complete (${timedOut ? "timeout" : "connection/lock issue"}). Continuing build — shared Neon DB is migrated by production deploys.`,
  );
  if (output.trim()) {
    console.warn(output.trim());
  }
  return true;
}
